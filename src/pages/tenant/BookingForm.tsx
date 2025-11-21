import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useProperty } from "@/contexts/PropertyContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import BackButton from "@/components/BackButton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, DollarSign, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

declare global {
  interface Window {
    Razorpay: any;
  }
}

const BookingForm = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { getPropertyById, createBooking, addPayment } = useProperty();
  const { toast } = useToast();
  
  const property = id ? getPropertyById(id) : null;
  
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  if (!property) {
    return (
      <div className="flex min-h-screen flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <Card>
            <CardContent className="py-16 text-center">
              <h2 className="text-2xl font-bold mb-2">Property Not Found</h2>
              <Button onClick={() => navigate("/tenant/browse")}>Browse Properties</Button>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  const calculateTotal = () => {
    if (!startDate || !endDate) return 0;
    const start = new Date(startDate);
    const end = new Date(endDate);
    const months = Math.max(1, Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24 * 30)));
    return property.rent_price * months;
  };

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePayment = async () => {
    if (!user || !startDate || !endDate) {
      toast({
        title: "Missing Information",
        description: "Please select start and end dates",
        variant: "destructive",
      });
      return;
    }

    const total = calculateTotal();
    if (total <= 0) {
      toast({
        title: "Invalid Dates",
        description: "End date must be after start date",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);

    try {
      // Load Razorpay script
      const res = await loadRazorpayScript();
      if (!res) {
        toast({
          title: "Error",
          description: "Razorpay SDK failed to load. Check your internet connection.",
          variant: "destructive",
        });
        setIsProcessing(false);
        return;
      }

      // Create booking first
      const booking = await createBooking({
        property_id: property.id,
        tenant_id: user.uid,
        start_date: startDate,
        end_date: endDate,
        status: "pending",
      });

      // Initialize Razorpay payment
      const options = {
        key: "rzp_test_YOUR_KEY_ID", // Replace with your Razorpay key
        amount: total * 100, // Amount in paise
        currency: "USD",
        name: "RentEazy",
        description: `Booking for ${property.title}`,
        image: "/placeholder.svg",
        handler: async function (response: any) {
          try {
            // Payment successful - create payment record
            await addPayment({
              booking_id: booking.id,
              tenant_id: user.uid,
              amount: total,
              status: "completed",
              razorpay_payment_id: response.razorpay_payment_id,
            });

            toast({
              title: "Payment Successful!",
              description: "Your booking has been confirmed",
            });

            navigate("/tenant/bookings");
          } catch (error) {
            console.error("Error recording payment:", error);
            toast({
              title: "Error",
              description: "Payment received but failed to record. Contact support.",
              variant: "destructive",
            });
          }
        },
        prefill: {
          name: user.name,
          email: user.email,
        },
        theme: {
          color: "#3b82f6",
        },
        modal: {
          ondismiss: function() {
            setIsProcessing(false);
            toast({
              title: "Payment Cancelled",
              description: "You can try again when ready",
            });
          }
        }
      };

      const paymentObject = new window.Razorpay(options);
      paymentObject.open();
      setIsProcessing(false);
    } catch (error) {
      console.error("Payment error:", error);
      toast({
        title: "Error",
        description: "Failed to process payment. Please try again.",
        variant: "destructive",
      });
      setIsProcessing(false);
    }
  };

  const total = calculateTotal();

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1 bg-gradient-to-b from-secondary/20 to-background">
        <div className="container mx-auto px-4 py-8 max-w-3xl">
          <BackButton />

          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-2xl">Book Property</CardTitle>
              <CardDescription>Complete your booking for {property.title}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Property Summary */}
              <div className="p-4 bg-secondary/20 rounded-lg">
                <h3 className="font-semibold mb-2">{property.title}</h3>
                <p className="text-sm text-muted-foreground mb-2">{property.location}</p>
                <div className="flex items-center gap-2 text-lg font-bold text-primary">
                  <DollarSign className="h-5 w-5" />
                  ${property.rent_price}
                  <span className="text-sm font-normal text-muted-foreground">/month</span>
                </div>
              </div>

              {/* Date Selection */}
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="start-date">
                    <Calendar className="inline h-4 w-4 mr-1" />
                    Start Date
                  </Label>
                  <Input
                    id="start-date"
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="end-date">
                    <Calendar className="inline h-4 w-4 mr-1" />
                    End Date
                  </Label>
                  <Input
                    id="end-date"
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    min={startDate || new Date().toISOString().split('T')[0]}
                  />
                </div>
              </div>

              {/* Price Calculation */}
              {startDate && endDate && total > 0 && (
                <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-muted-foreground">Duration</span>
                    <span className="font-semibold">
                      {Math.max(1, Math.ceil((new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24 * 30)))} month(s)
                    </span>
                  </div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-muted-foreground">Monthly Rent</span>
                    <span className="font-semibold">${property.rent_price}</span>
                  </div>
                  <div className="border-t pt-2 mt-2">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-bold">Total Amount</span>
                      <span className="text-2xl font-bold text-primary">${total}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Payment Button */}
              <Button
                className="w-full"
                size="lg"
                onClick={handlePayment}
                disabled={!startDate || !endDate || total <= 0 || isProcessing}
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <DollarSign className="mr-2 h-5 w-5" />
                    Pay ${total} with Razorpay
                  </>
                )}
              </Button>

              <p className="text-xs text-muted-foreground text-center">
                By proceeding, you agree to our terms and conditions. Payment is processed securely through Razorpay.
              </p>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default BookingForm;

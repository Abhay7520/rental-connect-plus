import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useProperty } from "@/contexts/PropertyContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Calendar, DollarSign } from "lucide-react";

declare global {
  interface Window {
    Razorpay: any;
  }
}

const Book = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { getPropertyById, addBooking, updateBooking, addPayment } = useProperty();
  const { toast } = useToast();
  const property = id ? getPropertyById(id) : undefined;

  const [moveInDate, setMoveInDate] = useState("");
  const [moveOutDate, setMoveOutDate] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  const calculateTotalAmount = () => {
    if (!moveInDate || !moveOutDate || !property) return 0;
    
    const start = new Date(moveInDate);
    const end = new Date(moveOutDate);
    const months = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24 * 30));
    
    return property.rent_price * Math.max(1, months);
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
    if (!user || !property || !moveInDate || !moveOutDate) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    const startDate = new Date(moveInDate);
    const endDate = new Date(moveOutDate);

    if (startDate >= endDate) {
      toast({
        title: "Invalid dates",
        description: "Move-out date must be after move-in date",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);

    // Create booking first with pending status
    const bookingId = addBooking({
      tenant_id: user.uid,
      property_id: property.id,
      start_date: moveInDate,
      end_date: moveOutDate,
      status: "pending",
    });

    // Load Razorpay script
    const res = await loadRazorpayScript();

    if (!res) {
      toast({
        title: "Payment failed",
        description: "Failed to load payment gateway",
        variant: "destructive",
      });
      setIsProcessing(false);
      return;
    }

    const amount = calculateTotalAmount();

    const options = {
      key: "rzp_test_1DP5mmOlF5G5ag", // Test key
      amount: amount * 100, // Amount in paise
      currency: "INR",
      name: "RentEazy",
      description: `Booking for ${property.title}`,
      handler: function (response: any) {
        // Payment successful
        updateBooking(bookingId, { status: "confirmed" });
        
        addPayment({
          booking_id: bookingId,
          tenant_id: user.uid,
          amount: amount,
          date: new Date().toISOString(),
          status: "completed",
          razorpay_payment_id: response.razorpay_payment_id,
        });

        toast({
          title: "Booking confirmed!",
          description: "Your payment was successful",
        });

        navigate("/tenant/dashboard");
      },
      modal: {
        ondismiss: function () {
          setIsProcessing(false);
          toast({
            title: "Payment cancelled",
            description: "You cancelled the payment",
            variant: "destructive",
          });
        },
      },
      prefill: {
        name: user.name,
        email: user.email,
      },
      theme: {
        color: "#0EA5E9",
      },
    };

    const razorpay = new window.Razorpay(options);
    razorpay.open();
    setIsProcessing(false);
  };

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

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1 bg-gradient-to-b from-secondary/20 to-background">
        <div className="container mx-auto px-4 py-8 max-w-3xl">
          <Button
            variant="ghost"
            onClick={() => navigate(`/tenant/property/${property.id}`)}
            className="mb-6"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Property
          </Button>

          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Book Property</CardTitle>
                  <CardDescription>Select your move-in and move-out dates</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="move-in">Move-in Date</Label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="move-in"
                        type="date"
                        value={moveInDate}
                        onChange={(e) => setMoveInDate(e.target.value)}
                        min={new Date().toISOString().split("T")[0]}
                        className="pl-10"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="move-out">Move-out Date</Label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="move-out"
                        type="date"
                        value={moveOutDate}
                        onChange={(e) => setMoveOutDate(e.target.value)}
                        min={moveInDate || new Date().toISOString().split("T")[0]}
                        className="pl-10"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="lg:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Booking Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="font-semibold mb-1">{property.title}</p>
                    <p className="text-sm text-muted-foreground">{property.location}</p>
                  </div>

                  <div className="pt-4 border-t space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Monthly Rent</span>
                      <span className="font-medium">${property.rent_price}</span>
                    </div>
                    {moveInDate && moveOutDate && (
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Duration</span>
                        <span className="font-medium">
                          {Math.ceil(
                            (new Date(moveOutDate).getTime() - new Date(moveInDate).getTime()) /
                              (1000 * 60 * 60 * 24 * 30)
                          )}{" "}
                          month(s)
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="pt-4 border-t">
                    <div className="flex items-center justify-between text-lg font-bold">
                      <span>Total Amount</span>
                      <div className="flex items-center gap-1 text-primary">
                        <DollarSign className="h-5 w-5" />
                        {calculateTotalAmount()}
                      </div>
                    </div>
                  </div>

                  <Button
                    className="w-full"
                    size="lg"
                    onClick={handlePayment}
                    disabled={!moveInDate || !moveOutDate || isProcessing}
                  >
                    {isProcessing ? "Processing..." : "Proceed to Payment"}
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Book;

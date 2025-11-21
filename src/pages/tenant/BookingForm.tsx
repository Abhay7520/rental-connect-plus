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
import { Calendar, DollarSign, Loader2, CreditCard, Building2, Wallet, Smartphone } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

const BookingForm = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { getPropertyById, createBooking, addPayment, updateBooking } = useProperty();
  const { toast } = useToast();
  
  const property = id ? getPropertyById(id) : null;
  
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("upi");

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

  const handleProceedToPayment = () => {
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

    setShowPaymentModal(true);
  };

  const handlePayment = async () => {
    if (!user || !startDate || !endDate) return;

    setIsProcessing(true);

    try {
      const total = calculateTotal();

      // Create booking first
      const booking = await createBooking({
        property_id: property.id,
        tenant_id: user.uid,
        start_date: startDate,
        end_date: endDate,
        status: "pending",
        amount: total,
      });

      // DEMO MODE: Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Create payment record
      await addPayment({
        booking_id: booking.id,
        tenant_id: user.uid,
        amount: total,
        status: "completed",
        razorpay_payment_id: `demo_${paymentMethod}_${Date.now()}`,
      });

      // Update booking status to confirmed
      await updateBooking(booking.id, { status: "confirmed" });

      toast({
        title: "Payment Successful!",
        description: `Booking confirmed for ${property.title}`,
      });

      navigate("/tenant/bookings");
    } catch (error) {
      console.error("Payment error:", error);
      toast({
        title: "Payment Failed",
        description: "Failed to process payment. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
      setShowPaymentModal(false);
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
                onClick={handleProceedToPayment}
                disabled={!startDate || !endDate || total <= 0}
              >
                <CreditCard className="mr-2 h-5 w-5" />
                Proceed to Payment
              </Button>

              <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
                <p className="text-xs text-blue-800 dark:text-blue-200 text-center">
                  💡 <strong>Demo Mode:</strong> This is a test payment. No real transaction will occur.
                </p>
              </div>

              <p className="text-xs text-muted-foreground text-center">
                By proceeding, you agree to our terms and conditions.
              </p>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />

      {/* Payment Modal - Razorpay Style */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md max-h-[90vh] overflow-y-auto">
            <CardHeader className="border-b">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Building2 className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{property.title}</CardTitle>
                    <CardDescription className="text-sm">{property.location}</CardDescription>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowPaymentModal(false)}
                  disabled={isProcessing}
                >
                  ✕
                </Button>
              </div>
            </CardHeader>

            <CardContent className="pt-6 space-y-6">
              {/* Amount Display */}
              <div className="text-center pb-4 border-b">
                <p className="text-sm text-muted-foreground mb-1">Amount to Pay</p>
                <p className="text-3xl font-bold text-primary">${total}</p>
              </div>

              {/* Payment Methods */}
              <div className="space-y-4">
                <Label className="text-base font-semibold">Select Payment Method</Label>
                <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
                  {/* UPI */}
                  <div className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-secondary/50 cursor-pointer">
                    <RadioGroupItem value="upi" id="upi" />
                    <Label htmlFor="upi" className="flex items-center gap-3 cursor-pointer flex-1">
                      <Smartphone className="h-5 w-5 text-primary" />
                      <div>
                        <p className="font-medium">UPI</p>
                        <p className="text-xs text-muted-foreground">Pay via UPI apps</p>
                      </div>
                    </Label>
                  </div>

                  {/* Cards */}
                  <div className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-secondary/50 cursor-pointer">
                    <RadioGroupItem value="card" id="card" />
                    <Label htmlFor="card" className="flex items-center gap-3 cursor-pointer flex-1">
                      <CreditCard className="h-5 w-5 text-primary" />
                      <div>
                        <p className="font-medium">Credit/Debit Card</p>
                        <p className="text-xs text-muted-foreground">Visa, Mastercard, Rupay</p>
                      </div>
                    </Label>
                  </div>

                  {/* Wallets */}
                  <div className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-secondary/50 cursor-pointer">
                    <RadioGroupItem value="wallet" id="wallet" />
                    <Label htmlFor="wallet" className="flex items-center gap-3 cursor-pointer flex-1">
                      <Wallet className="h-5 w-5 text-primary" />
                      <div>
                        <p className="font-medium">Wallets</p>
                        <p className="text-xs text-muted-foreground">Paytm, PhonePe, etc.</p>
                      </div>
                    </Label>
                  </div>

                  {/* Net Banking */}
                  <div className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-secondary/50 cursor-pointer">
                    <RadioGroupItem value="netbanking" id="netbanking" />
                    <Label htmlFor="netbanking" className="flex items-center gap-3 cursor-pointer flex-1">
                      <Building2 className="h-5 w-5 text-primary" />
                      <div>
                        <p className="font-medium">Net Banking</p>
                        <p className="text-xs text-muted-foreground">All Indian banks</p>
                      </div>
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              {/* Pay Button */}
              <Button
                className="w-full"
                size="lg"
                onClick={handlePayment}
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Processing Payment...
                  </>
                ) : (
                  <>
                    Pay ${total}
                  </>
                )}
              </Button>

              {/* Security Badge */}
              <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                <span>Secured by 256-bit encryption</span>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default BookingForm;

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { usePayments, Payment } from "@/hooks/usePayments";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import BackButton from "@/components/BackButton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DollarSign, Receipt, Loader2 } from "lucide-react";

const Payments = () => {
  const { user } = useAuth();
  const { getUserPayments, loading } = usePayments();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadPayments = async () => {
      if (user) {
        setIsLoading(true);
        const data = await getUserPayments();
        setPayments(data);
        setIsLoading(false);
      }
    };
    loadPayments();
  }, [user]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (isLoading || loading) {
    return (
      <div className="flex min-h-screen flex-col">
        <Navbar />
        <main className="flex-1 bg-gradient-to-b from-secondary/20 to-background">
          <div className="container mx-auto px-4 py-8">
            <BackButton />
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
                <p className="text-muted-foreground">Loading payments...</p>
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1 bg-gradient-to-b from-secondary/20 to-background">
        <div className="container mx-auto px-4 py-8">
          <BackButton />
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Payment History</h1>
            <p className="text-muted-foreground">View all your payment transactions</p>
          </div>

          {payments.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-16">
                <Receipt className="h-16 w-16 text-muted-foreground mb-4" />
                <h3 className="text-xl font-semibold mb-2">No payments yet</h3>
                <p className="text-muted-foreground">Your payment history will appear here</p>
                <p className="text-sm text-muted-foreground mt-2">
                  Complete a booking to see your payments
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {payments.map((payment) => (
                <Card key={payment.id}>
                  <CardContent className="flex items-center justify-between py-6">
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                        <DollarSign className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <p className="font-semibold">Payment #{payment.id.slice(-8).toUpperCase()}</p>
                        <p className="text-sm text-muted-foreground">{formatDate(payment.date)}</p>
                        {payment.bookingId && (
                          <p className="text-xs text-muted-foreground mt-1">
                            Booking: {payment.bookingId.slice(-8).toUpperCase()}
                          </p>
                        )}
                        {payment.razorpay_payment_id && (
                          <p className="text-xs text-muted-foreground">
                            Payment ID: {payment.razorpay_payment_id}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-primary">${payment.amount}</p>
                      <Badge
                        variant={
                          payment.status === "completed"
                            ? "default"
                            : payment.status === "pending"
                            ? "secondary"
                            : "destructive"
                        }
                        className="mt-2"
                      >
                        {payment.status}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {payments.length > 0 && (
            <Card className="mt-8">
              <CardHeader>
                <CardTitle>Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="text-center p-4 bg-secondary/50 rounded-lg">
                    <p className="text-sm text-muted-foreground mb-1">Total Payments</p>
                    <p className="text-2xl font-bold">{payments.length}</p>
                  </div>
                  <div className="text-center p-4 bg-secondary/50 rounded-lg">
                    <p className="text-sm text-muted-foreground mb-1">Total Amount</p>
                    <p className="text-2xl font-bold text-primary">
                      ${payments.reduce((sum, p) => sum + p.amount, 0).toFixed(2)}
                    </p>
                  </div>
                  <div className="text-center p-4 bg-secondary/50 rounded-lg">
                    <p className="text-sm text-muted-foreground mb-1">Completed</p>
                    <p className="text-2xl font-bold text-accent">
                      {payments.filter((p) => p.status === "completed").length}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Payments;
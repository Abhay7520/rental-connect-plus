import { useAuth } from "@/contexts/AuthContext";
import { useProperty } from "@/contexts/PropertyContext";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import BackButton from "@/components/BackButton";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bell, CreditCard, Calendar, Home } from "lucide-react";

const Reminders = () => {
  const { user } = useAuth();
  const { properties, getTenantBookings, getTenantPayments } = useProperty();
  const navigate = useNavigate();

  // Get tenant's active bookings
  const tenantBookings = user ? getTenantBookings(user.uid) : [];
  const activeBooking = tenantBookings.find(b => b.status === "confirmed");
  
  // Get payment information
  const tenantPayments = user ? getTenantPayments(user.uid) : [];
  const property = activeBooking ? properties.find(p => p.id === activeBooking.property_id) : null;

  // Calculate due date (for demo: 5th of next month)
  const today = new Date();
  const dueDate = new Date(today.getFullYear(), today.getMonth() + 1, 5);
  const daysToDue = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

  // Check if rent is paid this month
  const lastPayment = tenantPayments[tenantPayments.length - 1];
  const isPaidThisMonth = lastPayment && 
    lastPayment.status === "completed" && 
    new Date(lastPayment.date).getMonth() === today.getMonth();

  const getStatusInfo = () => {
    if (isPaidThisMonth) {
      return {
        status: "paid" as const,
        message: "Your rent for this month has been paid. Thank you!",
        color: "text-green-600",
        badge: "default" as const,
      };
    } else if (daysToDue < 0) {
      return {
        status: "overdue" as const,
        message: `Your rent payment is overdue by ${Math.abs(daysToDue)} days. Please pay immediately to avoid late fees.`,
        color: "text-red-600",
        badge: "destructive" as const,
      };
    } else if (daysToDue <= 3) {
      return {
        status: "due_soon" as const,
        message: `Your rent payment is due in ${daysToDue} ${daysToDue === 1 ? 'day' : 'days'}. Please make the payment soon.`,
        color: "text-yellow-600",
        badge: "secondary" as const,
      };
    } else {
      return {
        status: "upcoming" as const,
        message: `Your next rent payment is due in ${daysToDue} days.`,
        color: "text-blue-600",
        badge: "default" as const,
      };
    }
  };

  const statusInfo = getStatusInfo();

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <BackButton />
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
            <Bell className="h-8 w-8" />
            Rent Reminders
          </h1>
          <p className="text-muted-foreground">
            Stay updated on your upcoming rent payments
          </p>
        </div>

        {!activeBooking ? (
          <Card>
            <CardContent className="py-12">
              <div className="text-center text-muted-foreground">
                <Home className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="mb-4">You don't have any active bookings</p>
                <Button onClick={() => navigate("/tenant/browse")}>
                  Browse Properties
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Status Banner */}
            <Card className={`border-l-4 mb-6 ${
              statusInfo.status === "paid" ? "border-l-green-500" :
              statusInfo.status === "overdue" ? "border-l-red-500" :
              statusInfo.status === "due_soon" ? "border-l-yellow-500" :
              "border-l-blue-500"
            }`}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className={`flex items-center gap-2 ${statusInfo.color}`}>
                      <Bell className="h-5 w-5" />
                      Payment Reminder
                    </CardTitle>
                    <CardDescription className="mt-2 text-base">
                      {statusInfo.message}
                    </CardDescription>
                  </div>
                  <Badge variant={statusInfo.badge}>
                    {statusInfo.status.replace('_', ' ').toUpperCase()}
                  </Badge>
                </div>
              </CardHeader>
            </Card>

            {/* Payment Details */}
            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <Card>
                <CardHeader>
                  <CardTitle>Payment Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between py-2 border-b">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Home className="h-4 w-4" />
                      <span>Property</span>
                    </div>
                    <span className="font-medium">{property?.title}</span>
                  </div>
                  
                  <div className="flex items-center justify-between py-2 border-b">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <CreditCard className="h-4 w-4" />
                      <span>Rent Amount</span>
                    </div>
                    <span className="font-medium text-lg">
                      ₹{property?.rent_price.toLocaleString()}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between py-2">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      <span>Due Date</span>
                    </div>
                    <span className="font-medium">
                      {dueDate.toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric'
                      })}
                    </span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Payment History</CardTitle>
                </CardHeader>
                <CardContent>
                  {tenantPayments.length === 0 ? (
                    <p className="text-muted-foreground text-center py-4">
                      No payment history yet
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {tenantPayments.slice(-3).reverse().map((payment) => (
                        <div key={payment.id} className="flex items-center justify-between py-2 border-b last:border-0">
                          <div>
                            <div className="font-medium">₹{payment.amount.toLocaleString()}</div>
                            <div className="text-sm text-muted-foreground">
                              {new Date(payment.date).toLocaleDateString('en-IN')}
                            </div>
                          </div>
                          <Badge variant={payment.status === "completed" ? "default" : "secondary"}>
                            {payment.status}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Action Button */}
            {!isPaidThisMonth && (
              <Card>
                <CardContent className="py-6">
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div>
                      <h3 className="font-semibold text-lg mb-1">
                        Ready to Make Payment?
                      </h3>
                      <p className="text-muted-foreground">
                        Pay your rent securely through our payment portal
                      </p>
                    </div>
                    <Button 
                      size="lg"
                      onClick={() => navigate("/tenant/payments")}
                      className="w-full sm:w-auto"
                    >
                      <CreditCard className="mr-2 h-5 w-5" />
                      Pay Now
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default Reminders;

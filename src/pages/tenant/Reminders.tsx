import { useAuth } from "@/contexts/AuthContext";
import { useProperty } from "@/contexts/PropertyContext";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import BackButton from "@/components/BackButton";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bell, Calendar, DollarSign } from "lucide-react";

const TenantReminders = () => {
  const { user } = useAuth();
  const { getTenantBookings, getTenantPayments, getPropertyById } = useProperty();
  const navigate = useNavigate();

  const tenantBookings = user ? getTenantBookings(user.uid) : [];
  const tenantPayments = user ? getTenantPayments(user.uid) : [];

  // Get confirmed bookings (these have rent due)
  const activeBookings = tenantBookings.filter((b) => b.status === "confirmed");

  // Get pending payments
  const pendingPayments = tenantPayments.filter((p) => p.status === "pending");

  if (!user) return null;

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1 bg-gradient-to-b from-secondary/20 to-background">
        <div className="container mx-auto px-4 py-8">
          <BackButton />

          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Your Reminders</h1>
            <p className="text-muted-foreground">Upcoming payments and important dates</p>
          </div>

          {/* Summary Stats */}
          <div className="grid gap-6 md:grid-cols-2 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Active Bookings
                </CardTitle>
                <Calendar className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{activeBookings.length}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Pending Payments
                </CardTitle>
                <DollarSign className="h-4 w-4 text-accent" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-accent">{pendingPayments.length}</div>
              </CardContent>
            </Card>
          </div>

          {/* Pending Payments */}
          {pendingPayments.length > 0 && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Payments Due</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {pendingPayments.map((payment) => {
                    const booking = tenantBookings.find((b) => b.id === payment.booking_id);
                    const property = booking ? getPropertyById(booking.property_id) : null;

                    if (!property) return null;

                    return (
                      <div key={payment.id} className="flex items-start justify-between p-4 border rounded-lg">
                        <div>
                          <p className="font-semibold">{property.title}</p>
                          <p className="text-sm text-muted-foreground">
                            Due: {new Date(payment.date).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-lg">${payment.amount}</p>
                          <Badge variant="secondary">Pending</Badge>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Active Bookings */}
          {activeBookings.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Active Bookings</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {activeBookings.map((booking) => {
                    const property = getPropertyById(booking.property_id);
                    if (!property) return null;

                    return (
                      <div key={booking.id} className="flex items-start justify-between p-4 border rounded-lg">
                        <div>
                          <p className="font-semibold">{property.title}</p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(booking.start_date).toLocaleDateString()} -{" "}
                            {new Date(booking.end_date).toLocaleDateString()}
                          </p>
                        </div>
                        <Button size="sm" onClick={() => navigate("/tenant/payments")}>
                          Pay Rent
                        </Button>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Empty State */}
          {activeBookings.length === 0 && pendingPayments.length === 0 && (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-16">
                <Bell className="h-16 w-16 text-muted-foreground mb-4 opacity-50" />
                <h3 className="text-xl font-semibold mb-2">No Reminders</h3>
                <p className="text-muted-foreground mb-6">You're all caught up!</p>
                <Button onClick={() => navigate("/tenant/browse")}>Browse Properties</Button>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default TenantReminders;
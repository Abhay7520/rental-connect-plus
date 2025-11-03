import { useAuth } from "@/contexts/AuthContext";
import { useProperty } from "@/contexts/PropertyContext";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Home, CreditCard, FileText, Search, Calendar, DollarSign } from "lucide-react";

const TenantDashboard = () => {
  const { user } = useAuth();
  const { getTenantBookings, getTenantPayments, getPropertyById } = useProperty();
  const navigate = useNavigate();
  
  const bookings = user ? getTenantBookings(user.uid) : [];
  const payments = user ? getTenantPayments(user.uid) : [];
  const recentBookings = bookings.slice(0, 3);
  const totalSpent = payments.reduce((sum, p) => sum + p.amount, 0);
  
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const stats = [
    { label: "Total Bookings", value: bookings.length.toString(), icon: Home, color: "text-primary" },
    { label: "Total Spent", value: `$${totalSpent}`, icon: CreditCard, color: "text-accent" },
    { label: "Active Bookings", value: bookings.filter(b => b.status === "confirmed").length.toString(), icon: FileText, color: "text-primary" },
    { label: "Total Payments", value: payments.length.toString(), icon: DollarSign, color: "text-primary" },
  ];

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1 bg-gradient-to-b from-secondary/20 to-background">
        <div className="container mx-auto px-4 py-8">
          <div className="mb-8 flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold mb-2">Tenant Dashboard</h1>
              <p className="text-muted-foreground">Welcome, {user?.name}! Find your perfect rental</p>
            </div>
            <Button onClick={() => navigate("/tenant/browse")}>
              <Search className="mr-2 h-4 w-4" />
              Browse Properties
            </Button>
          </div>

          <div className="grid gap-6 md:grid-cols-4 mb-8">
            {stats.map((stat) => (
              <Card key={stat.label}>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {stat.label}
                  </CardTitle>
                  <stat.icon className={`h-4 w-4 ${stat.color}`} />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stat.value}</div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Recent Bookings</CardTitle>
                <CardDescription>Your latest property bookings</CardDescription>
              </CardHeader>
              <CardContent>
                {recentBookings.length === 0 ? (
                  <div className="text-center py-8">
                    <Home className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                    <p className="text-muted-foreground mb-4">No bookings yet</p>
                    <Button onClick={() => navigate("/tenant/browse")} size="sm">
                      <Search className="mr-2 h-4 w-4" />
                      Browse Properties
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {recentBookings.map((booking) => {
                      const property = getPropertyById(booking.property_id);
                      return (
                        <div key={booking.id} className="flex items-center justify-between pb-3 border-b last:border-0">
                          <div className="flex items-start gap-3">
                            <Home className="h-5 w-5 text-primary mt-0.5" />
                            <div>
                              <p className="font-medium">{property?.title || "Property"}</p>
                              <p className="text-sm text-muted-foreground">
                                <Calendar className="inline h-3 w-3 mr-1" />
                                {formatDate(booking.start_date)} - {formatDate(booking.end_date)}
                              </p>
                            </div>
                          </div>
                          <Badge
                            variant={
                              booking.status === "confirmed"
                                ? "default"
                                : booking.status === "pending"
                                ? "secondary"
                                : "destructive"
                            }
                          >
                            {booking.status}
                          </Badge>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Payment Summary</CardTitle>
                <CardDescription>Track your rental payments</CardDescription>
              </CardHeader>
              <CardContent>
                {payments.length === 0 ? (
                  <div className="text-center py-8">
                    <CreditCard className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                    <p className="text-muted-foreground">No payments yet</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="p-4 bg-secondary/50 rounded-lg">
                        <p className="text-muted-foreground mb-1">Total Payments</p>
                        <p className="text-2xl font-bold">{payments.length}</p>
                      </div>
                      <div className="p-4 bg-secondary/50 rounded-lg">
                        <p className="text-muted-foreground mb-1">Total Spent</p>
                        <p className="text-2xl font-bold text-primary">${totalSpent}</p>
                      </div>
                    </div>
                    <div className="pt-4 border-t">
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={() => navigate("/tenant/payments")}
                      >
                        View All Payments
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default TenantDashboard;

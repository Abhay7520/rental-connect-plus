import { useAuth } from "@/contexts/AuthContext";
import { useProperty } from "@/contexts/PropertyContext";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Building2,
  DollarSign,
  Users,
  TrendingUp,
  Plus,
  Bell,
  FileText,
  MessageCircle,
  Calendar,
} from "lucide-react";

const OwnerDashboard = () => {
  const { user, getAllUsers } = useAuth();
  const {
    getOwnerProperties,
    getOwnerBookings,
    getOwnerPayments,
    getOwnerIssues,
    getPropertyById,
    loading,
  } = useProperty();
  const navigate = useNavigate();

  const ownerProperties = user ? getOwnerProperties(user.uid) : [];
  const ownerBookings = user ? getOwnerBookings(user.uid) : [];
  const ownerPayments = user ? getOwnerPayments(user.uid) : [];
  const ownerIssues = user ? getOwnerIssues(user.uid) : [];
  const allUsers = getAllUsers();

  const totalProperties = ownerProperties.length;
  const activeProperties = ownerProperties.filter((p) => p.status === "active").length;
  const confirmedBookings = ownerBookings.filter((b) => b.status === "confirmed").length;
  const openIssues = ownerIssues.filter((i) => i.status !== "resolved" && i.status !== "closed").length;

  // Calculate total revenue from confirmed bookings with payments
  const totalRevenue = ownerPayments
    .filter((p) => p.status === "completed")
    .reduce((sum, p) => sum + p.amount, 0);

  // Calculate pending payments
  const pendingPayments = ownerPayments.filter((p) => p.status === "pending");
  const overduePayments = ownerPayments.filter((p) => {
    if (p.status !== "pending") return false;
    const paymentDate = new Date(p.date);
    const now = new Date();
    const diffDays = (now.getTime() - paymentDate.getTime()) / (1000 * 60 * 60 * 24);
    return diffDays > 7;
  });

  const stats = [
    { label: "Total Properties", value: totalProperties.toString(), icon: Building2, color: "text-primary" },
    { label: "Total Revenue", value: `$${totalRevenue.toLocaleString()}`, icon: DollarSign, color: "text-accent" },
    { label: "Active Bookings", value: confirmedBookings.toString(), icon: Users, color: "text-primary" },
    { label: "Open Issues", value: openIssues.toString(), icon: TrendingUp, color: "text-destructive" },
  ];

  const getTenantName = (tenantId: string) => {
    const tenant = allUsers.find((u) => u.uid === tenantId);
    return tenant?.name || "Unknown Tenant";
  };

  // ✅ Show loading state while data is fetching
  if (loading) {
    return (
      <div className="flex min-h-screen flex-col">
        <Navbar />
        <main className="flex-1 bg-gradient-to-b from-secondary/20 to-background flex items-center justify-center">
          <div className="text-center">
            <div className="h-8 w-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading dashboard...</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1 bg-gradient-to-b from-secondary/20 to-background">
        <div className="container mx-auto px-4 py-8">
          <div className="mb-8 flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold mb-2">Property Owner Dashboard</h1>
              <p className="text-muted-foreground">Welcome, {user?.name}! Manage your rental properties</p>
            </div>
            <div className="flex gap-3">
              <Button onClick={() => navigate("/owner/add-property")}>
                <Plus className="mr-2 h-4 w-4" />
                Add Property
              </Button>
              <Button variant="outline" onClick={() => navigate("/owner/manage-properties")}>
                <Building2 className="mr-2 h-4 w-4" />
                Manage Properties
              </Button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid gap-6 md:grid-cols-4 mb-8">
            {stats.map((stat) => (
              <Card key={stat.label}>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">{stat.label}</CardTitle>
                  <stat.icon className={`h-4 w-4 ${stat.color}`} />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stat.value}</div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Quick Actions */}
          <div className="grid gap-6 md:grid-cols-4 mb-6">
            <Card
              className="hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => navigate("/owner/manage-properties")}
            >
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-primary/10 rounded-lg">
                    <Building2 className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold">Properties</p>
                    <p className="text-sm text-muted-foreground">Manage listings</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate("/owner/bookings")}>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-primary/10 rounded-lg">
                    <Calendar className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold">Bookings</p>
                    <p className="text-sm text-muted-foreground">
                      {ownerBookings.filter((b) => b.status === "pending").length > 0
                        ? `${ownerBookings.filter((b) => b.status === "pending").length} pending`
                        : "Manage bookings"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card
              className="hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => navigate("/owner/reminders")}
            >
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-primary/10 rounded-lg">
                    <Bell className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold">Reminders</p>
                    <p className="text-sm text-muted-foreground">
                      {overduePayments.length > 0 ? `${overduePayments.length} overdue` : "No overdue"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate("/owner/issues")}>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-primary/10 rounded-lg">
                    <FileText className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold">Issues</p>
                    <p className="text-sm text-muted-foreground">
                      {openIssues > 0 ? `${openIssues} open` : "No issues"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Secondary Actions */}
          <div className="grid gap-6 md:grid-cols-3 mb-6">
            <Card
              className="hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => navigate("/owner/post-announcement")}
            >
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-primary/10 rounded-lg">
                    <MessageCircle className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold">Announcements</p>
                    <p className="text-sm text-muted-foreground">Post updates</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content Grid */}
          <div className="grid gap-6 md:grid-cols-2 mb-6">
            {/* Recent Bookings */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Bookings</CardTitle>
                <CardDescription>Latest property bookings</CardDescription>
              </CardHeader>
              <CardContent>
                {ownerBookings.length === 0 ? (
                  <div className="text-center py-8">
                    <Users className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                    <p className="text-muted-foreground">No bookings yet</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {ownerBookings
                      .slice(-5)
                      .reverse()
                      .map((booking) => {
                        const property = getPropertyById(booking.property_id);
                        return (
                          <div
                            key={booking.id}
                            className="flex items-start justify-between pb-3 border-b last:border-0"
                          >
                            <div className="flex-1">
                              <p className="font-medium">{property?.title || "Unknown Property"}</p>
                              <p className="text-sm text-muted-foreground">
                                Tenant: {getTenantName(booking.tenant_id)}
                              </p>
                              <p className="text-xs text-muted-foreground mt-1">
                                {new Date(booking.start_date).toLocaleDateString()} -{" "}
                                {new Date(booking.end_date).toLocaleDateString()}
                              </p>
                            </div>
                            <Badge variant={booking.status === "confirmed" ? "default" : "secondary"}>
                              {booking.status}
                            </Badge>
                          </div>
                        );
                      })}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Payment Status */}
            <Card>
              <CardHeader>
                <CardTitle>Payment Status</CardTitle>
                <CardDescription>Rent collection overview</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Total Collected</span>
                    <span className="text-sm font-medium">${totalRevenue.toLocaleString()}</span>
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-4 border-t text-sm">
                    <div>
                      <p className="text-muted-foreground">Pending</p>
                      <p className="font-medium text-accent">{pendingPayments.length} payments</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Overdue</p>
                      <p className="font-medium text-destructive">{overduePayments.length} payments</p>
                    </div>
                  </div>

                  {ownerPayments.length > 0 && (
                    <div className="mt-4 space-y-2">
                      <p className="text-sm font-medium">Recent Payments:</p>
                      {ownerPayments
                        .slice(-3)
                        .reverse()
                        .map((payment) => {
                          const booking = ownerBookings.find((b) => b.id === payment.booking_id);
                          const property = booking ? getPropertyById(booking.property_id) : null;
                          return (
                            <div
                              key={payment.id}
                              className="flex justify-between items-center text-sm py-2 border-b last:border-0"
                            >
                              <span className="text-muted-foreground">{property?.title || "Unknown"}</span>
                              <div className="flex items-center gap-2">
                                <span className="font-medium">${payment.amount}</span>
                                <Badge
                                  variant={payment.status === "completed" ? "default" : "secondary"}
                                  className="text-xs"
                                >
                                  {payment.status}
                                </Badge>
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Issues */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Issues</CardTitle>
              <CardDescription>Property maintenance and issues</CardDescription>
            </CardHeader>
            <CardContent>
              {ownerIssues.length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                  <p className="text-muted-foreground">No issues reported</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {ownerIssues
                    .slice(-5)
                    .reverse()
                    .map((issue) => {
                      const property = getPropertyById(issue.property_id);
                      return (
                        <div key={issue.id} className="flex items-start justify-between pb-3 border-b last:border-0">
                          <div className="flex-1">
                            <p className="font-medium">{issue.title}</p>
                            <p className="text-sm text-muted-foreground">
                              Property: {property?.title || "Unknown"}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                              Reported by: {getTenantName(issue.tenant_id)} •{" "}
                              {new Date(issue.created_at).toLocaleDateString()}
                            </p>
                          </div>
                          <Badge
                            variant={
                              issue.status === "resolved"
                                ? "default"
                                : issue.status === "investigating"
                                  ? "secondary"
                                  : "destructive"
                            }
                          >
                            {issue.status}
                          </Badge>
                        </div>
                      );
                    })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Community Hub */}
          <div className="mt-6">
            <h2 className="text-xl font-semibold mb-4">Community Hub</h2>
            <div className="grid gap-4 md:grid-cols-3">
              <Card
                className="hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => navigate("/community/polls")}
              >
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-primary/10 rounded-lg">
                      <FileText className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <p className="font-semibold">Create Polls</p>
                      <p className="text-sm text-muted-foreground">Survey tenants</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card
                className="hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => navigate("/community/chat")}
              >
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-primary/10 rounded-lg">
                      <MessageCircle className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <p className="font-semibold">Community Chat</p>
                      <p className="text-sm text-muted-foreground">Engage tenants</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card
                className="hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => navigate("/community/events")}
              >
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-primary/10 rounded-lg">
                      <Calendar className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <p className="font-semibold">Post Events</p>
                      <p className="text-sm text-muted-foreground">Organize meetups</p>
                    </div>
                  </div>
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

export default OwnerDashboard;
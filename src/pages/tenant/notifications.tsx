import { useAuth } from "@/contexts/AuthContext";
import { useProperty } from "@/contexts/PropertyContext";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import BackButton from "@/components/BackButton";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Bell, Check, X, Calendar, Clock, Home, AlertCircle } from "lucide-react";

const Notifications = () => {
  const { user, getAllUsers } = useAuth();
  const { getTenantBookings, getPropertyById, getTenantPayments } = useProperty();
  const navigate = useNavigate();

  const tenantBookings = user ? getTenantBookings(user.uid) : [];
  const tenantPayments = user ? getTenantPayments(user.uid) : [];
  const allUsers = getAllUsers();

  // Separate notifications by type
  const confirmedNotifications = tenantBookings.filter((b) => b.status === "confirmed");
  const pendingNotifications = tenantBookings.filter((b) => b.status === "pending");
  const cancelledNotifications = tenantBookings.filter((b) => b.status === "cancelled");

  // Payment notifications
  const pendingPayments = tenantPayments.filter((p) => p.status === "pending");
  const completedPayments = tenantPayments.filter((p) => p.status === "completed");

  const getOwnerName = (propertyId: string) => {
    const property = getPropertyById(propertyId);
    if (!property) return "Unknown Owner";
    const owner = allUsers.find((u) => u.uid === property.owner_id);
    return owner?.name || "Property Owner";
  };

  const getNotificationAge = (date: string) => {
    const notifDate = new Date(date);
    const now = new Date();
    const diffMs = now.getTime() - notifDate.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  const renderBookingNotification = (booking: any, type: "confirmed" | "pending" | "cancelled") => {
    const property = getPropertyById(booking.property_id);

    // ✅ SAFETY CHECK - if property not found, handle gracefully
    if (!property) {
      console.warn(`Property ${booking.property_id} not found for booking ${booking.id}`);
      return (
        <Card key={booking.id} className="mb-4 opacity-50">
          <CardContent className="pt-6">
            <p className="text-muted-foreground">Property data is no longer available</p>
          </CardContent>
        </Card>
      );
    }

    const ownerName = getOwnerName(booking.property_id);

    const config = {
      confirmed: {
        icon: Check,
        iconBg: "bg-green-100 dark:bg-green-900/30",
        iconColor: "text-green-600 dark:text-green-400",
        title: "Booking Confirmed! 🎉",
        message: `Great news! Your booking for ${property?.title || "the property"} has been confirmed by ${ownerName}. You can now proceed with the move-in process.`,
        badge: "default" as const,
        borderColor: "border-l-green-500",
      },
      pending: {
        icon: Clock,
        iconBg: "bg-yellow-100 dark:bg-yellow-900/30",
        iconColor: "text-yellow-600 dark:text-yellow-400",
        title: "Booking Pending Review",
        message: `Your booking request for ${property?.title || "the property"} is being reviewed by ${ownerName}. You'll be notified once they respond.`,
        badge: "secondary" as const,
        borderColor: "border-l-yellow-500",
      },
      cancelled: {
        icon: X,
        iconBg: "bg-red-100 dark:bg-red-900/30",
        iconColor: "text-red-600 dark:text-red-400",
        title: "Booking Not Approved",
        message: `Unfortunately, your booking request for ${property?.title || "the property"} was not approved by ${ownerName}. Please try booking other available properties.`,
        badge: "destructive" as const,
        borderColor: "border-l-red-500",
      },
    };

    const { icon: Icon, iconBg, iconColor, title, message, badge, borderColor } = config[type];

    return (
      <Card key={booking.id} className={`border-l-4 ${borderColor} mb-4`}>
        <CardContent className="pt-6">
          <div className="flex items-start gap-4">
            <div className={`p-3 rounded-full ${iconBg} flex-shrink-0`}>
              <Icon className={`h-6 w-6 ${iconColor}`} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-4 mb-2">
                <div className="flex-1">
                  <h3 className="font-semibold text-lg mb-1">{title}</h3>
                  <p className="text-sm text-muted-foreground line-clamp-2">{message}</p>
                </div>
                <Badge variant={badge} className="flex-shrink-0">
                  {booking.status}
                </Badge>
              </div>

              <div className="flex flex-wrap items-center gap-4 mt-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Home className="h-3 w-3" />
                  {property?.location || "Unknown Location"}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {new Date(booking.start_date).toLocaleDateString()} -{" "}
                  {new Date(booking.end_date).toLocaleDateString()}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {getNotificationAge(booking.createdAt)}
                </span>
              </div>

              {type === "confirmed" && (
                <div className="mt-4 flex gap-3">
                  <Button
                    size="sm"
                    onClick={() => navigate("/tenant/payments")}
                    className="flex-1 sm:flex-none"
                  >
                    Make Payment
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => navigate(`/tenant/property/${property?.id}`)}
                    className="flex-1 sm:flex-none"
                  >
                    View Property
                  </Button>
                </div>
              )}

              {type === "cancelled" && (
                <div className="mt-4">
                  <Button size="sm" variant="outline" onClick={() => navigate("/tenant/browse")}>
                    Browse Other Properties
                  </Button>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderPaymentNotification = (payment: any, isCompleted: boolean) => {
    const booking = tenantBookings.find((b) => b.id === payment.booking_id);

    // ✅ Check if booking exists
    if (!booking) {
      console.warn(`Booking ${payment.booking_id} not found for payment ${payment.id}`);
      return (
        <Card key={payment.id} className="mb-4 opacity-50">
          <CardContent className="pt-6">
            <p className="text-muted-foreground">Booking data is no longer available</p>
          </CardContent>
        </Card>
      );
    }

    const property = getPropertyById(booking.property_id);

    // ✅ Check if property exists
    if (!property) {
      console.warn(`Property ${booking.property_id} not found`);
      return (
        <Card key={payment.id} className="mb-4 opacity-50">
          <CardContent className="pt-6">
            <p className="text-muted-foreground">Property data is no longer available</p>
          </CardContent>
        </Card>
      );
    }

    return (
      <Card
        key={payment.id}
        className={`border-l-4 ${isCompleted ? "border-l-green-500" : "border-l-blue-500"} mb-4`}
      >
        <CardContent className="pt-6">
          <div className="flex items-start gap-4">
            <div
              className={`p-3 rounded-full ${isCompleted ? "bg-green-100 dark:bg-green-900/30" : "bg-blue-100 dark:bg-blue-900/30"} flex-shrink-0`}
            >
              {isCompleted ? (
                <Check className="h-6 w-6 text-green-600 dark:text-green-400" />
              ) : (
                <AlertCircle className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              )}
            </div>
            <div className="flex-1">
              <div className="flex items-start justify-between gap-4 mb-2">
                <div>
                  <h3 className="font-semibold text-lg mb-1">
                    {isCompleted ? "Payment Successful ✓" : "Payment Pending"}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {isCompleted
                      ? `Your payment of ₹${payment.amount.toLocaleString()} for ${property?.title || "the property"} was successful.`
                      : `Payment of ₹${payment.amount.toLocaleString()} for ${property?.title || "the property"} is pending completion.`}
                  </p>
                </div>
                <Badge variant={isCompleted ? "default" : "secondary"}>{payment.status}</Badge>
              </div>

              <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {new Date(payment.date).toLocaleDateString()}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {getNotificationAge(payment.date)}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  const totalNotifications = tenantBookings.length + tenantPayments.length;

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1 bg-gradient-to-b from-secondary/20 to-background">
        <div className="container mx-auto px-4 py-8">
          <BackButton />

          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
                  <Bell className="h-8 w-8" />
                  Notifications
                </h1>
                <p className="text-muted-foreground">Stay updated with your booking and payment status</p>
              </div>
              {totalNotifications > 0 && (
                <Badge variant="secondary" className="text-lg px-4 py-2">
                  {totalNotifications} total
                </Badge>
              )}
            </div>
          </div>

          {/* Summary Cards */}
          <div className="grid gap-6 md:grid-cols-4 mb-8">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Confirmed Bookings
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{confirmedNotifications.length}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Pending Review
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-600">{pendingNotifications.length}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Completed Payments
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-primary">{completedPayments.length}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Notifications
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalNotifications}</div>
              </CardContent>
            </Card>
          </div>

          {/* Notifications List */}
          <div className="space-y-6">
            {/* Confirmed Bookings */}
            {confirmedNotifications.length > 0 && (
              <div>
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <Check className="h-5 w-5 text-green-600" />
                  Confirmed Bookings
                </h2>
                {confirmedNotifications.map((booking) => renderBookingNotification(booking, "confirmed"))}
              </div>
            )}

            {/* Pending Bookings */}
            {pendingNotifications.length > 0 && (
              <div>
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <Clock className="h-5 w-5 text-yellow-600" />
                  Pending Review
                </h2>
                {pendingNotifications.map((booking) => renderBookingNotification(booking, "pending"))}
              </div>
            )}

            {/* Payment Notifications */}
            {completedPayments.length > 0 && (
              <div>
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <Check className="h-5 w-5 text-green-600" />
                  Recent Payments
                </h2>
                {completedPayments
                  .slice(-5)
                  .reverse()
                  .map((payment) => renderPaymentNotification(payment, true))}
              </div>
            )}

            {/* Cancelled Bookings */}
            {cancelledNotifications.length > 0 && (
              <div>
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <X className="h-5 w-5 text-red-600" />
                  Not Approved
                </h2>
                {cancelledNotifications.map((booking) => renderBookingNotification(booking, "cancelled"))}
              </div>
            )}

            {/* Empty State */}
            {totalNotifications === 0 && (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-16">
                  <Bell className="h-16 w-16 text-muted-foreground mb-4 opacity-50" />
                  <h3 className="text-xl font-semibold mb-2">No Notifications Yet</h3>
                  <p className="text-muted-foreground text-center mb-6">
                    When you book a property or make payments, you'll see notifications here.
                  </p>
                  <Button onClick={() => navigate("/tenant/browse")}>Browse Properties</Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Notifications;
import { useAuth } from "@/contexts/AuthContext";
import { useProperty } from "@/contexts/PropertyContext";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import BackButton from "@/components/BackButton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, User, MapPin, DollarSign, Check, X, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

const OwnerBookings = () => {
  const { user, getAllUsers } = useAuth();
  const { getOwnerBookings, getPropertyById, updateBooking } = useProperty();
  const { toast } = useToast();
  const navigate = useNavigate();

  const ownerBookings = user ? getOwnerBookings(user.uid) : [];
  const allUsers = getAllUsers();
  const [processingId, setProcessingId] = useState<string | null>(null);

  const pendingBookings = ownerBookings.filter((b: any) => b.status === "pending");
  const confirmedBookings = ownerBookings.filter((b: any) => b.status === "confirmed");
  const rejectedBookings = ownerBookings.filter((b: any) => b.status === "cancelled");

  const getTenantName = (tenantId: string) => {
    const tenant = allUsers.find((u: any) => u.uid === tenantId);
    return tenant?.name || "Unknown Tenant";
  };

  const getTenantEmail = (tenantId: string) => {
    const tenant = allUsers.find((u: any) => u.uid === tenantId);
    return tenant?.email || "N/A";
  };

  const handleAcceptBooking = async (bookingId: string) => {
    if (processingId) return;
    setProcessingId(bookingId);
    try {
      console.log("🔵 [OwnerBookings] Accepting booking:", bookingId);
      await updateBooking(bookingId, { status: "confirmed" });
      console.log("✅ [OwnerBookings] Booking accepted");
      toast({
        title: "Booking Accepted",
        description: "The booking has been confirmed.",
      });
    } catch (error: any) {
      console.error("❌ [OwnerBookings] Error accepting booking:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to accept booking",
        variant: "destructive",
      });
    } finally {
      setProcessingId(null);
    }
  };

  const handleRejectBooking = async (bookingId: string) => {
    if (processingId) return;
    setProcessingId(bookingId);
    try {
      console.log("🔵 [OwnerBookings] Rejecting booking:", bookingId);
      await updateBooking(bookingId, { status: "cancelled" });
      console.log("✅ [OwnerBookings] Booking rejected");
      toast({
        title: "Booking Rejected",
        description: "The booking has been rejected.",
      });
    } catch (error: any) {
      console.error("❌ [OwnerBookings] Error rejecting booking:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to reject booking",
        variant: "destructive",
      });
    } finally {
      setProcessingId(null);
    }
  };

  const renderBookingCard = (booking: any, isPending: boolean) => {
    const property = getPropertyById(booking.property_id);

    if (!property) {
      return (
        <Card key={booking.id} className="mb-4 opacity-50">
          <CardContent className="pt-6">
            <p className="text-muted-foreground">Property data unavailable</p>
          </CardContent>
        </Card>
      );
    }

    const tenantName = getTenantName(booking.tenant_id);
    const tenantEmail = getTenantEmail(booking.tenant_id);
    const startDate = new Date(booking.start_date).toLocaleDateString();
    const endDate = new Date(booking.end_date).toLocaleDateString();
    const numMonths = Math.ceil(
      (new Date(booking.end_date).getTime() - new Date(booking.start_date).getTime()) / (1000 * 60 * 60 * 24 * 30)
    );
    const totalAmount = (property as any).rent_price * numMonths;

    return (
      <Card key={booking.id} className="mb-4">
        <CardContent className="pt-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h3 className="font-semibold text-lg mb-2">{(property as any).title}</h3>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <User className="h-4 w-4" />
                  <span>{tenantName}</span>
                  <span className="text-xs">({tenantEmail})</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  <span>{(property as any).location}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span>{startDate} to {endDate} ({numMonths} month{numMonths > 1 ? 's' : ''})</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <DollarSign className="h-4 w-4" />
                  <span>${(property as any).rent_price}/month × {numMonths} = ${totalAmount}</span>
                </div>
              </div>
            </div>
            <Badge variant={booking.status === "pending" ? "secondary" : booking.status === "confirmed" ? "default" : "destructive"}>
              {booking.status}
            </Badge>
          </div>

          {isPending && (
            <div className="flex gap-3 pt-4 border-t">
              <Button
                className="flex-1"
                onClick={() => handleAcceptBooking(booking.id)}
                disabled={processingId === booking.id}
              >
                {processingId === booking.id ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Accepting...
                  </>
                ) : (
                  <>
                    <Check className="mr-2 h-4 w-4" />
                    Accept Booking
                  </>
                )}
              </Button>
              <Button
                variant="destructive"
                className="flex-1"
                onClick={() => handleRejectBooking(booking.id)}
                disabled={processingId === booking.id}
              >
                {processingId === booking.id ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Rejecting...
                  </>
                ) : (
                  <>
                    <X className="mr-2 h-4 w-4" />
                    Reject Booking
                  </>
                )}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1 bg-gradient-to-b from-secondary/20 to-background">
        <div className="container mx-auto px-4 py-8">
          <BackButton />

          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Booking Requests</h1>
            <p className="text-muted-foreground">Review and manage tenant booking requests</p>
          </div>

          {/* Summary Stats */}
          <div className="grid gap-6 md:grid-cols-3 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Pending</CardTitle>
                <Calendar className="h-4 w-4 text-accent" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-accent">{pendingBookings.length}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Confirmed</CardTitle>
                <Check className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-primary">{confirmedBookings.length}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Rejected</CardTitle>
                <X className="h-4 w-4 text-destructive" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-destructive">{rejectedBookings.length}</div>
              </CardContent>
            </Card>
          </div>

          {/* Pending Bookings - PRIORITY */}
          {pendingBookings.length > 0 && (
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Calendar className="h-5 w-5 text-accent" />
                Pending Requests ({pendingBookings.length})
              </h2>
              {pendingBookings.map((booking: any) => renderBookingCard(booking, true))}
            </div>
          )}

          {/* Confirmed Bookings */}
          {confirmedBookings.length > 0 && (
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Check className="h-5 w-5 text-primary" />
                Confirmed ({confirmedBookings.length})
              </h2>
              {confirmedBookings.map((booking: any) => renderBookingCard(booking, false))}
            </div>
          )}

          {/* Rejected Bookings */}
          {rejectedBookings.length > 0 && (
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <X className="h-5 w-5 text-destructive" />
                Rejected ({rejectedBookings.length})
              </h2>
              {rejectedBookings.map((booking: any) => renderBookingCard(booking, false))}
            </div>
          )}

          {/* Empty State */}
          {ownerBookings.length === 0 && (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-16">
                <Calendar className="h-16 w-16 text-muted-foreground mb-4" />
                <h3 className="text-xl font-semibold mb-2">No Bookings</h3>
                <p className="text-muted-foreground mb-6">No one has requested to book your properties yet.</p>
                <Button onClick={() => navigate("/owner/dashboard")}>
                  Back to Dashboard
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default OwnerBookings;
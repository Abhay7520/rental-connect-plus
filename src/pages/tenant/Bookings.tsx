import { useAuth } from "@/contexts/AuthContext";
import { useProperty } from "@/contexts/PropertyContext";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import BackButton from "@/components/BackButton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin, DollarSign, Home } from "lucide-react";

const Bookings = () => {
  const { user } = useAuth();
  const { getTenantBookings, getPropertyById } = useProperty();
  const navigate = useNavigate();

  const tenantBookings = user ? getTenantBookings(user.uid) : [];
  const pendingBookings = tenantBookings.filter((b: any) => b.status === "pending");
  const confirmedBookings = tenantBookings.filter((b: any) => b.status === "confirmed");
  const cancelledBookings = tenantBookings.filter((b: any) => b.status === "cancelled");

  const renderBookingCard = (booking: any) => {
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

    const startDate = new Date(booking.start_date).toLocaleDateString();
    const endDate = new Date(booking.end_date).toLocaleDateString();
    const numMonths = Math.ceil(
      (new Date(booking.end_date).getTime() - new Date(booking.start_date).getTime()) / (1000 * 60 * 60 * 24 * 30)
    );
    const totalAmount = (property as any).rent_price * numMonths;

    return (
      <Card key={booking.id} className="mb-4 hover:shadow-lg transition-shadow">
        <CardContent className="pt-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h3 className="font-semibold text-lg mb-2">{(property as any).title}</h3>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  <span>{(property as any).location}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span>{startDate} to {endDate}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <span className="text-xs text-muted-foreground">{numMonths} month{numMonths > 1 ? 's' : ''}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <DollarSign className="h-4 w-4" />
                  <span>${(property as any).rent_price}/month × {numMonths} = ${totalAmount}</span>
                </div>
              </div>
            </div>
            <div className="flex flex-col items-end gap-2">
              <Badge 
                variant={
                  booking.status === "pending" 
                    ? "secondary" 
                    : booking.status === "confirmed" 
                    ? "default" 
                    : "destructive"
                }
              >
                {booking.status}
              </Badge>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate(`/tenant/property/${booking.property_id}`)}
              >
                View Property
              </Button>
            </div>
          </div>
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
            <h1 className="text-3xl font-bold mb-2">My Bookings</h1>
            <p className="text-muted-foreground">View and manage your property bookings</p>
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
                <Home className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-primary">{confirmedBookings.length}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Cancelled</CardTitle>
                <Calendar className="h-4 w-4 text-destructive" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-destructive">{cancelledBookings.length}</div>
              </CardContent>
            </Card>
          </div>

          {/* Pending Bookings */}
          {pendingBookings.length > 0 && (
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Calendar className="h-5 w-5 text-accent" />
                Pending ({pendingBookings.length})
              </h2>
              {pendingBookings.map((booking: any) => renderBookingCard(booking))}
            </div>
          )}

          {/* Confirmed Bookings */}
          {confirmedBookings.length > 0 && (
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Home className="h-5 w-5 text-primary" />
                Confirmed ({confirmedBookings.length})
              </h2>
              {confirmedBookings.map((booking: any) => renderBookingCard(booking))}
            </div>
          )}

          {/* Cancelled Bookings */}
          {cancelledBookings.length > 0 && (
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Calendar className="h-5 w-5 text-destructive" />
                Cancelled ({cancelledBookings.length})
              </h2>
              {cancelledBookings.map((booking: any) => renderBookingCard(booking))}
            </div>
          )}

          {/* Empty State */}
          {tenantBookings.length === 0 && (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-16">
                <Home className="h-16 w-16 text-muted-foreground mb-4" />
                <h3 className="text-xl font-semibold mb-2">No Bookings Yet</h3>
                <p className="text-muted-foreground mb-6">You haven't made any bookings yet.</p>
                <Button onClick={() => navigate("/tenant/browse")}>
                  Browse Properties
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

export default Bookings;

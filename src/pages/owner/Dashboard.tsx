import { useAuth } from "@/contexts/AuthContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, DollarSign, Users, TrendingUp } from "lucide-react";

const OwnerDashboard = () => {
  const { user } = useAuth();

  const stats = [
    { label: "Total Properties", value: "12", icon: Building2, color: "text-primary" },
    { label: "Monthly Revenue", value: "$18,500", icon: DollarSign, color: "text-accent" },
    { label: "Active Tenants", value: "28", icon: Users, color: "text-primary" },
    { label: "Occupancy Rate", value: "95%", icon: TrendingUp, color: "text-primary" },
  ];

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1 bg-gradient-to-b from-secondary/20 to-background">
        <div className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Property Owner Dashboard</h1>
            <p className="text-muted-foreground">Welcome, {user?.name}! Manage your rental properties</p>
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
                <CardTitle>Recent Properties</CardTitle>
                <CardDescription>Your latest listings</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { name: "Sunset Apartments", units: "24 units", revenue: "$4,200/mo" },
                    { name: "Downtown Lofts", units: "18 units", revenue: "$5,800/mo" },
                    { name: "Garden View Condos", units: "12 units", revenue: "$3,600/mo" },
                  ].map((property) => (
                    <div key={property.name} className="flex items-center justify-between pb-3 border-b last:border-0">
                      <div className="flex items-start gap-3">
                        <Building2 className="h-5 w-5 text-primary mt-0.5" />
                        <div>
                          <p className="font-medium">{property.name}</p>
                          <p className="text-sm text-muted-foreground">{property.units}</p>
                        </div>
                      </div>
                      <span className="text-sm font-medium text-accent">{property.revenue}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Payment Status</CardTitle>
                <CardDescription>Rent collection overview</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Collected</span>
                    <span className="text-sm font-medium">$15,200</span>
                  </div>
                  <div className="w-full bg-secondary rounded-full h-2">
                    <div className="bg-primary h-2 rounded-full" style={{ width: "82%" }} />
                  </div>
                  <div className="grid grid-cols-2 gap-4 pt-4 border-t text-sm">
                    <div>
                      <p className="text-muted-foreground">Pending</p>
                      <p className="font-medium text-accent">$2,100</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Overdue</p>
                      <p className="font-medium text-destructive">$1,200</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default OwnerDashboard;

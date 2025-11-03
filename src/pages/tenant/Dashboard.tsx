import { useAuth } from "@/contexts/AuthContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Home, DollarSign, Wrench, Users } from "lucide-react";

const TenantDashboard = () => {
  const { user } = useAuth();

  const stats = [
    { label: "Rent Due", value: "$1,250", icon: DollarSign, color: "text-accent" },
    { label: "Maintenance", value: "2 Active", icon: Wrench, color: "text-primary" },
    { label: "Community", value: "45 Members", icon: Users, color: "text-primary" },
  ];

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1 bg-gradient-to-b from-secondary/20 to-background">
        <div className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Welcome back, {user?.name}!</h1>
            <p className="text-muted-foreground">Here's what's happening with your rental</p>
          </div>

          <div className="grid gap-6 md:grid-cols-3 mb-8">
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
                <CardTitle>My Property</CardTitle>
                <CardDescription>Current rental information</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <Home className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                      <p className="font-medium">Sunset Apartments, Unit 4B</p>
                      <p className="text-sm text-muted-foreground">123 Oak Street, Springfield</p>
                    </div>
                  </div>
                  <div className="pt-4 border-t">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Rent</p>
                        <p className="font-medium">$1,250/month</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Lease End</p>
                        <p className="font-medium">Dec 31, 2025</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Your latest actions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-start gap-3 pb-3 border-b">
                    <div className="h-2 w-2 rounded-full bg-primary mt-2" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">Rent payment processed</p>
                      <p className="text-xs text-muted-foreground">2 days ago</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 pb-3 border-b">
                    <div className="h-2 w-2 rounded-full bg-primary mt-2" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">Maintenance request submitted</p>
                      <p className="text-xs text-muted-foreground">1 week ago</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="h-2 w-2 rounded-full bg-muted mt-2" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">Community event attended</p>
                      <p className="text-xs text-muted-foreground">2 weeks ago</p>
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

export default TenantDashboard;

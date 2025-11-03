import { useAuth } from "@/contexts/AuthContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, Users, Building2, Activity } from "lucide-react";

const AdminDashboard = () => {
  const { user } = useAuth();

  const stats = [
    { label: "Total Users", value: "1,248", icon: Users, color: "text-primary" },
    { label: "Properties", value: "156", icon: Building2, color: "text-primary" },
    { label: "Active Sessions", value: "342", icon: Activity, color: "text-accent" },
    { label: "System Health", value: "98%", icon: Shield, color: "text-primary" },
  ];

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1 bg-gradient-to-b from-secondary/20 to-background">
        <div className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
            <p className="text-muted-foreground">Welcome, {user?.name}! System overview and management</p>
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
                <CardTitle>Recent User Activity</CardTitle>
                <CardDescription>Latest user registrations and activities</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { name: "John Smith", action: "Registered as Tenant", time: "5 min ago" },
                    { name: "Sarah Johnson", action: "Listed new property", time: "12 min ago" },
                    { name: "Mike Wilson", action: "Paid rent", time: "1 hour ago" },
                    { name: "Emma Davis", action: "Updated profile", time: "2 hours ago" },
                  ].map((activity) => (
                    <div key={activity.name} className="flex items-center justify-between pb-3 border-b last:border-0">
                      <div className="flex items-start gap-3">
                        <Users className="h-5 w-5 text-primary mt-0.5" />
                        <div>
                          <p className="font-medium">{activity.name}</p>
                          <p className="text-sm text-muted-foreground">{activity.action}</p>
                        </div>
                      </div>
                      <span className="text-xs text-muted-foreground">{activity.time}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>System Metrics</CardTitle>
                <CardDescription>Platform performance overview</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Server Load</span>
                      <span className="text-sm text-muted-foreground">45%</span>
                    </div>
                    <div className="w-full bg-secondary rounded-full h-2">
                      <div className="bg-primary h-2 rounded-full" style={{ width: "45%" }} />
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Database Usage</span>
                      <span className="text-sm text-muted-foreground">62%</span>
                    </div>
                    <div className="w-full bg-secondary rounded-full h-2">
                      <div className="bg-primary h-2 rounded-full" style={{ width: "62%" }} />
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">API Response Time</span>
                      <span className="text-sm text-muted-foreground">95ms</span>
                    </div>
                    <div className="w-full bg-secondary rounded-full h-2">
                      <div className="bg-primary h-2 rounded-full" style={{ width: "15%" }} />
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

export default AdminDashboard;

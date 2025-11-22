import { useAuth } from "@/contexts/AuthContext";
import { useProperty } from "@/contexts/PropertyContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import BackButton from "@/components/BackButton";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

const Reports = () => {
  const { getAllUsers } = useAuth();
  const { properties, bookings, payments } = useProperty();

  // User role distribution
  const users = getAllUsers();
  const roleData = [
    { name: "Tenants", value: users.filter(u => u.role === "tenant").length, color: "#8884d8" },
    { name: "Owners", value: users.filter(u => u.role === "owner").length, color: "#82ca9d" },
    { name: "Admins", value: users.filter(u => u.role === "admin").length, color: "#ffc658" },
  ];

  // Booking status distribution
  const bookingData = [
    { name: "Pending", value: bookings.filter(b => b.status === "pending").length },
    { name: "Confirmed", value: bookings.filter(b => b.status === "confirmed").length },
    { name: "Cancelled", value: bookings.filter(b => b.status === "cancelled").length },
  ];

  // Monthly revenue (mock data based on payments)
  const monthlyRevenue = payments.reduce((acc, payment) => {
    const month = new Date(payment.date).toLocaleDateString('en-US', { month: 'short' });
    const existing = acc.find(item => item.month === month);
    if (existing) {
      existing.revenue += payment.amount;
    } else {
      acc.push({ month, revenue: payment.amount });
    }
    return acc;
  }, [] as { month: string; revenue: number }[]);

  // Property status
  const propertyData = [
    { status: "Active", count: properties.filter(p => p.status === "active").length },
    { status: "Inactive", count: properties.filter(p => p.status === "inactive").length },
  ];

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-8">
        <BackButton />
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Analytics & Reports</h1>
          <p className="text-muted-foreground">Platform performance and statistics</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 mb-6">
          <Card>
            <CardHeader>
              <CardTitle>User Distribution by Role</CardTitle>
              <CardDescription>Total users: {users.length}</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={roleData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${value}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {roleData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Booking Status</CardTitle>
              <CardDescription>Total bookings: {bookings.length}</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={bookingData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="value" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Monthly Revenue</CardTitle>
              <CardDescription>
                Total: ₹{payments.reduce((sum, p) => sum + p.amount, 0).toLocaleString()}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={monthlyRevenue}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="revenue" stroke="#82ca9d" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Property Status</CardTitle>
              <CardDescription>Total properties: {properties.length}</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={propertyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="status" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="count" fill="#0088FE" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Reports;

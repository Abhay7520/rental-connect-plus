import { useAuth } from "@/contexts/AuthContext";
import { useProperty } from "@/contexts/PropertyContext";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import BackButton from "@/components/BackButton";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bell, DollarSign, Calendar, User, Mail, Phone } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Reminders = () => {
  const { user, getAllUsers } = useAuth();
  const { getOwnerBookings, getOwnerPayments, getPropertyById } = useProperty();
  const { toast } = useToast();
  const navigate = useNavigate();

  const ownerBookings = user ? getOwnerBookings(user.uid) : [];
  const ownerPayments = user ? getOwnerPayments(user.uid) : [];
  const allUsers = getAllUsers();

  // Calculate overdue and pending payments
  const now = new Date();
  const paymentReminders = ownerPayments
    .filter(p => p.status === "pending")
    .map(payment => {
      const booking = ownerBookings.find(b => b.id === payment.booking_id);
      const property = booking ? getPropertyById(booking.property_id) : null;
      const tenant = allUsers.find(u => u.uid === payment.tenant_id);
      const paymentDate = new Date(payment.date);
      const daysOverdue = Math.floor((now.getTime() - paymentDate.getTime()) / (1000 * 60 * 60 * 24));
      
      return {
        payment,
        booking,
        property,
        tenant,
        daysOverdue,
        isOverdue: daysOverdue > 0,
      };
    })
    .sort((a, b) => b.daysOverdue - a.daysOverdue);

  const overdueReminders = paymentReminders.filter(r => r.isOverdue);
  const upcomingReminders = paymentReminders.filter(r => !r.isOverdue);

  const sendReminder = (tenantEmail: string, tenantName: string, propertyTitle: string, amount: number) => {
    // In a real app, this would send an email or SMS
    toast({
      title: "Reminder Sent!",
      description: `Rent reminder sent to ${tenantName} for ${propertyTitle}`,
    });
    
    console.log(`
      Sending reminder to: ${tenantEmail}
      Dear ${tenantName},
      
      This is a friendly reminder that your rent payment of $${amount} for ${propertyTitle} is pending.
      
      Please make the payment at your earliest convenience.
      
      Thank you,
      RentEazy Management
    `);
  };

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1 bg-gradient-to-b from-secondary/20 to-background">
        <div className="container mx-auto px-4 py-8">
          <BackButton />
          
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Rent Reminders</h1>
            <p className="text-muted-foreground">Track and send payment reminders to tenants</p>
          </div>

          {/* Summary Stats */}
          <div className="grid gap-6 md:grid-cols-3 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Overdue Payments
                </CardTitle>
                <Bell className="h-4 w-4 text-destructive" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-destructive">{overdueReminders.length}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Pending Payments
                </CardTitle>
                <Calendar className="h-4 w-4 text-accent" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-accent">{upcomingReminders.length}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Pending Amount
                </CardTitle>
                <DollarSign className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  ${paymentReminders.reduce((sum, r) => sum + r.payment.amount, 0).toLocaleString()}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Overdue Payments */}
          {overdueReminders.length > 0 && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="text-destructive flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  Overdue Payments
                </CardTitle>
                <CardDescription>These payments are past their due date</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {overdueReminders.map((reminder) => (
                    <div
                      key={reminder.payment.id}
                      className="flex items-start justify-between p-4 border border-destructive/20 rounded-lg bg-destructive/5"
                    >
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h3 className="font-semibold text-lg">{reminder.property?.title || "Unknown Property"}</h3>
                            <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                              <User className="h-3 w-3" />
                              {reminder.tenant?.name || "Unknown Tenant"}
                            </p>
                          </div>
                          <Badge variant="destructive">
                            {reminder.daysOverdue} days overdue
                          </Badge>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mt-3 text-sm">
                          <div>
                            <p className="text-muted-foreground">Amount Due</p>
                            <p className="font-semibold text-lg">${reminder.payment.amount.toLocaleString()}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Due Date</p>
                            <p className="font-medium">{new Date(reminder.payment.date).toLocaleDateString()}</p>
                          </div>
                        </div>

                        {reminder.tenant && (
                          <div className="mt-3 flex gap-4 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Mail className="h-3 w-3" />
                              {reminder.tenant.email}
                            </span>
                            {reminder.tenant.phone && (
                              <span className="flex items-center gap-1">
                                <Phone className="h-3 w-3" />
                                {reminder.tenant.phone}
                              </span>
                            )}
                          </div>
                        )}
                      </div>

                      <Button
                        variant="destructive"
                        size="sm"
                        className="ml-4"
                        onClick={() => 
                          sendReminder(
                            reminder.tenant?.email || "",
                            reminder.tenant?.name || "Tenant",
                            reminder.property?.title || "Property",
                            reminder.payment.amount
                          )
                        }
                      >
                        <Bell className="mr-2 h-4 w-4" />
                        Send Reminder
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Upcoming/Pending Payments */}
          {upcomingReminders.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Pending Payments
                </CardTitle>
                <CardDescription>Payments not yet overdue</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {upcomingReminders.map((reminder) => (
                    <div
                      key={reminder.payment.id}
                      className="flex items-start justify-between p-4 border rounded-lg"
                    >
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h3 className="font-semibold">{reminder.property?.title || "Unknown Property"}</h3>
                            <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                              <User className="h-3 w-3" />
                              {reminder.tenant?.name || "Unknown Tenant"}
                            </p>
                          </div>
                          <Badge variant="secondary">
                            Due in {Math.abs(reminder.daysOverdue)} days
                          </Badge>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mt-3 text-sm">
                          <div>
                            <p className="text-muted-foreground">Amount Due</p>
                            <p className="font-semibold text-lg">${reminder.payment.amount.toLocaleString()}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Due Date</p>
                            <p className="font-medium">{new Date(reminder.payment.date).toLocaleDateString()}</p>
                          </div>
                        </div>

                        {reminder.tenant && (
                          <div className="mt-3 flex gap-4 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Mail className="h-3 w-3" />
                              {reminder.tenant.email}
                            </span>
                            {reminder.tenant.phone && (
                              <span className="flex items-center gap-1">
                                <Phone className="h-3 w-3" />
                                {reminder.tenant.phone}
                              </span>
                            )}
                          </div>
                        )}
                      </div>

                      <Button
                        variant="outline"
                        size="sm"
                        className="ml-4"
                        onClick={() => 
                          sendReminder(
                            reminder.tenant?.email || "",
                            reminder.tenant?.name || "Tenant",
                            reminder.property?.title || "Property",
                            reminder.payment.amount
                          )
                        }
                      >
                        <Bell className="mr-2 h-4 w-4" />
                        Send Reminder
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Empty State */}
          {paymentReminders.length === 0 && (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-16">
                <Bell className="h-16 w-16 text-muted-foreground mb-4" />
                <h3 className="text-xl font-semibold mb-2">No Payment Reminders</h3>
                <p className="text-muted-foreground mb-6">All payments are up to date!</p>
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

export default Reminders;

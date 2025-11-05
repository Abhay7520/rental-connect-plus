import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useProperty } from "@/contexts/PropertyContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import BackButton from "@/components/BackButton";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Bell, MessageCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Mock reminder data structure
interface ReminderData {
  tenant_name: string;
  tenant_phone: string;
  property_name: string;
  rent_amount: number;
  due_date: string;
  payment_status: "paid" | "due_soon" | "overdue";
  booking_id: string;
}

const Reminders = () => {
  const { user } = useAuth();
  const { properties, bookings, payments, getOwnerProperties } = useProperty();
  const { toast } = useToast();
  const [sendingReminder, setSendingReminder] = useState<string | null>(null);
  const [sendingBulk, setSendingBulk] = useState(false);

  // Generate reminder data from existing bookings and payments
  const getReminders = (): ReminderData[] => {
    if (!user) return [];

    const ownerProperties = getOwnerProperties(user.uid);
    const ownerPropertyIds = ownerProperties.map(p => p.id);
    
    // Get confirmed bookings for owner's properties
    const ownerBookings = bookings.filter(
      b => ownerPropertyIds.includes(b.property_id) && b.status === "confirmed"
    );

    return ownerBookings.map((booking) => {
      const property = properties.find(p => p.id === booking.property_id);
      const bookingPayments = payments.filter(p => p.booking_id === booking.id);
      
      // Calculate due date (for demo: end of current month)
      const today = new Date();
      const dueDate = new Date(today.getFullYear(), today.getMonth() + 1, 5);
      
      // Check payment status
      const lastPayment = bookingPayments[bookingPayments.length - 1];
      const daysToDue = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      
      let payment_status: "paid" | "due_soon" | "overdue";
      if (lastPayment && lastPayment.status === "completed" && 
          new Date(lastPayment.date).getMonth() === today.getMonth()) {
        payment_status = "paid";
      } else if (daysToDue < 0) {
        payment_status = "overdue";
      } else if (daysToDue <= 3) {
        payment_status = "due_soon";
      } else {
        payment_status = "paid"; // Default for future
      }

      return {
        tenant_name: `Tenant ${booking.tenant_id.slice(-4)}`,
        tenant_phone: `+91 ${Math.floor(Math.random() * 9000000000 + 1000000000)}`,
        property_name: property?.title || "Unknown Property",
        rent_amount: property?.rent_price || 0,
        due_date: dueDate.toISOString().split('T')[0],
        payment_status,
        booking_id: booking.id,
      };
    });
  };

  const reminders = getReminders();

  // Placeholder function for sending WhatsApp reminder
  const sendWhatsAppReminder = async (tenant_name: string, tenant_phone: string, reminder: ReminderData) => {
    setSendingReminder(reminder.booking_id);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Mock WhatsApp message
    const message = `Hi ${tenant_name}, this is a reminder that your rent of ₹${reminder.rent_amount} for ${reminder.property_name} is due on ${new Date(reminder.due_date).toLocaleDateString()}.`;
    
    console.log(`Sending WhatsApp to ${tenant_phone}: ${message}`);
    
    toast({
      title: "✅ Reminder Sent",
      description: `WhatsApp reminder sent to ${tenant_name}`,
    });
    
    setSendingReminder(null);
  };

  // Placeholder function for sending bulk reminders
  const sendBulkReminders = async () => {
    setSendingBulk(true);
    
    const dueReminders = reminders.filter(r => r.payment_status !== "paid");
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    console.log(`Sending ${dueReminders.length} bulk reminders`);
    
    toast({
      title: "✅ Bulk Reminders Sent",
      description: `${dueReminders.length} WhatsApp reminders sent successfully`,
    });
    
    setSendingBulk(false);
  };

  const getStatusBadge = (status: "paid" | "due_soon" | "overdue") => {
    const variants: Record<typeof status, { variant: "default" | "secondary" | "destructive", label: string }> = {
      paid: { variant: "default", label: "Paid" },
      due_soon: { variant: "secondary", label: "Due Soon" },
      overdue: { variant: "destructive", label: "Overdue" },
    };
    
    const config = variants[status];
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const dueCount = reminders.filter(r => r.payment_status !== "paid").length;

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <BackButton />
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
              <Bell className="h-8 w-8" />
              Rent Reminders
            </h1>
            <p className="text-muted-foreground">
              Manage and send rent payment reminders to your tenants
            </p>
          </div>
          
          {dueCount > 0 && (
            <Button 
              size="lg" 
              onClick={sendBulkReminders}
              disabled={sendingBulk}
              className="mt-4 md:mt-0"
            >
              <MessageCircle className="mr-2 h-5 w-5" />
              {sendingBulk ? "Sending..." : `Send All Due Reminders (${dueCount})`}
            </Button>
          )}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Tenant Payment Status</CardTitle>
            <CardDescription>
              Track rent payments and send reminders to tenants
            </CardDescription>
          </CardHeader>
          <CardContent>
            {reminders.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Bell className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No active bookings found</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Tenant Name</TableHead>
                      <TableHead>Property</TableHead>
                      <TableHead>Rent Amount</TableHead>
                      <TableHead>Due Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {reminders.map((reminder) => (
                      <TableRow key={reminder.booking_id}>
                        <TableCell className="font-medium">
                          {reminder.tenant_name}
                        </TableCell>
                        <TableCell>{reminder.property_name}</TableCell>
                        <TableCell>₹{reminder.rent_amount.toLocaleString()}</TableCell>
                        <TableCell>
                          {new Date(reminder.due_date).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric'
                          })}
                        </TableCell>
                        <TableCell>
                          {getStatusBadge(reminder.payment_status)}
                        </TableCell>
                        <TableCell className="text-right">
                          {reminder.payment_status !== "paid" && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => sendWhatsAppReminder(
                                reminder.tenant_name,
                                reminder.tenant_phone,
                                reminder
                              )}
                              disabled={sendingReminder === reminder.booking_id}
                            >
                              <MessageCircle className="mr-2 h-4 w-4" />
                              {sendingReminder === reminder.booking_id ? "Sending..." : "Send Reminder"}
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 border rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  {reminders.filter(r => r.payment_status === "paid").length}
                </div>
                <div className="text-sm text-muted-foreground">Paid This Month</div>
              </div>
              <div className="p-4 border rounded-lg">
                <div className="text-2xl font-bold text-yellow-600">
                  {reminders.filter(r => r.payment_status === "due_soon").length}
                </div>
                <div className="text-sm text-muted-foreground">Due in 3 Days</div>
              </div>
              <div className="p-4 border rounded-lg">
                <div className="text-2xl font-bold text-red-600">
                  {reminders.filter(r => r.payment_status === "overdue").length}
                </div>
                <div className="text-sm text-muted-foreground">Overdue</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>

      <Footer />
    </div>
  );
};

export default Reminders;

import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { PropertyProvider } from "@/contexts/PropertyContext";
import { CommunityProvider } from "@/contexts/CommunityContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Chatbot from "./pages/Chatbot";
import TenantDashboard from "./pages/tenant/Dashboard";
import Browse from "./pages/tenant/Browse";
import PropertyDetails from "./pages/tenant/PropertyDetails";
import Bookings from "./pages/tenant/Bookings";
import BookingForm from "./pages/tenant/BookingForm";
import Payments from "./pages/tenant/Payments";
import TenantIssues from "./pages/tenant/Issues";
import TenantReminders from "./pages/tenant/Reminders";
import TenantNotifications from "./pages/tenant/notifications";
import OwnerDashboard from "./pages/owner/Dashboard";
import AddProperty from "./pages/owner/AddProperty";
import OwnerManageProperties from "./pages/owner/ManageProperties";
import OwnerBookings from "./pages/owner/bookings";
import OwnerIssues from "./pages/owner/Issues";
import OwnerReminders from "./pages/owner/Reminders";
import AdminDashboard from "./pages/admin/Dashboard";
import ManageUsers from "./pages/admin/ManageUsers";
import AdminManageProperties from "./pages/admin/ManageProperties";
import Reports from "./pages/admin/Reports";
import MigrateRoles from "./pages/admin/MigrateRoles";
import CreateUserRoles from "./pages/admin/CreateUserRoles";
import Announcements from "./pages/Announcements";
import PostAnnouncement from "./pages/owner/PostAnnouncement";
import Polls from "./pages/community/Polls";
import Chat from "./pages/community/Chat";
import NewChat from "./pages/community/NewChat";
import Events from "./pages/community/Events";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <PropertyProvider>
          <CommunityProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
                <Route path="/create-user-role" element={<CreateUserRoles />} />
                <Route 
                  path="/chatbot" 
                  element={
                    <ProtectedRoute>
                      <Chatbot />
                    </ProtectedRoute>
                  } 
                />

                {/* Tenant Routes */}
                <Route
                  path="/tenant/dashboard"
                  element={
                    <ProtectedRoute allowedRoles={["tenant"]}>
                      <TenantDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/tenant/browse"
                  element={
                    <ProtectedRoute allowedRoles={["tenant"]}>
                      <Browse />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/tenant/property/:id"
                  element={
                    <ProtectedRoute allowedRoles={["tenant"]}>
                      <PropertyDetails />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/tenant/book/:id"
                  element={
                    <ProtectedRoute allowedRoles={["tenant"]}>
                      <BookingForm />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/tenant/bookings"
                  element={
                    <ProtectedRoute allowedRoles={["tenant"]}>
                      <Bookings />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/tenant/payments"
                  element={
                    <ProtectedRoute allowedRoles={["tenant"]}>
                      <Payments />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/tenant/issues"
                  element={
                    <ProtectedRoute allowedRoles={["tenant"]}>
                      <TenantIssues />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/tenant/reminders"
                  element={
                    <ProtectedRoute allowedRoles={["tenant"]}>
                      <TenantReminders />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/tenant/notifications"
                  element={
                    <ProtectedRoute allowedRoles={["tenant"]}>
                      <TenantNotifications />
                    </ProtectedRoute>
                  }
                />

                {/* Owner Routes */}
                <Route
                  path="/owner/dashboard"
                  element={
                    <ProtectedRoute allowedRoles={["owner"]}>
                      <OwnerDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/owner/add-property"
                  element={
                    <ProtectedRoute allowedRoles={["owner"]}>
                      <AddProperty />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/owner/manage-properties"
                  element={
                    <ProtectedRoute allowedRoles={["owner"]}>
                      <OwnerManageProperties />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/owner/bookings"
                  element={
                    <ProtectedRoute allowedRoles={["owner"]}>
                      <OwnerBookings />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/owner/issues"
                  element={
                    <ProtectedRoute allowedRoles={["owner"]}>
                      <OwnerIssues />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/owner/reminders"
                  element={
                    <ProtectedRoute allowedRoles={["owner"]}>
                      <OwnerReminders />
                    </ProtectedRoute>
                  }
                />

                {/* Admin Routes */}
                <Route
                  path="/admin/dashboard"
                  element={
                    <ProtectedRoute allowedRoles={["admin"]}>
                      <AdminDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/manage-users"
                  element={
                    <ProtectedRoute allowedRoles={["admin"]}>
                      <ManageUsers />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/manage-properties"
                  element={
                    <ProtectedRoute allowedRoles={["admin"]}>
                      <AdminManageProperties />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/reports"
                  element={
                    <ProtectedRoute allowedRoles={["admin"]}>
                      <Reports />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/migrate-roles"
                  element={
                    <ProtectedRoute allowedRoles={["admin"]}>
                      <MigrateRoles />
                    </ProtectedRoute>
                  }
                />

                {/* Community Routes */}
                <Route
                  path="/announcements"
                  element={
                    <ProtectedRoute>
                      <Announcements />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/owner/post-announcement"
                  element={
                    <ProtectedRoute allowedRoles={["owner", "admin"]}>
                      <PostAnnouncement />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/community/polls"
                  element={
                    <ProtectedRoute>
                      <Polls />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/community/chat"
                  element={
                    <ProtectedRoute>
                      <NewChat />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/community/chat/global"
                  element={
                    <ProtectedRoute>
                      <Chat />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/community/events"
                  element={
                    <ProtectedRoute>
                      <Events />
                    </ProtectedRoute>
                  }
                />

                {/* 404 */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </CommunityProvider>
        </PropertyProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

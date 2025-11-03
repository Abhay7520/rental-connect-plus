import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { PropertyProvider } from "@/contexts/PropertyContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import TenantDashboard from "./pages/tenant/Dashboard";
import Browse from "./pages/tenant/Browse";
import PropertyDetails from "./pages/tenant/PropertyDetails";
import Book from "./pages/tenant/Book";
import Payments from "./pages/tenant/Payments";
import TenantIssues from "./pages/tenant/Issues";
import OwnerDashboard from "./pages/owner/Dashboard";
import AddProperty from "./pages/owner/AddProperty";
import ManageProperties from "./pages/owner/ManageProperties";
import OwnerIssues from "./pages/owner/Issues";
import AdminDashboard from "./pages/admin/Dashboard";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <PropertyProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
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
                    <Book />
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
                    <ManageProperties />
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
                path="/admin/dashboard"
                element={
                  <ProtectedRoute allowedRoles={["admin"]}>
                    <AdminDashboard />
                  </ProtectedRoute>
                }
              />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </PropertyProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

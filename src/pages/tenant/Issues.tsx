import { useAuth } from "@/contexts/AuthContext";
import { useProperty } from "@/contexts/PropertyContext";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import BackButton from "@/components/BackButton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileText, AlertCircle, CheckCircle, Clock, User, MapPin, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

const RaiseIssueDialog = ({ open, onClose, propertyOptions, userId, addIssue }) => {
  const [propertyId, setPropertyId] = useState(propertyOptions?.[0]?.id || "");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  if (!open) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!propertyId || !title || !description) {
      alert("Please fill in all fields");
      return;
    }
    setLoading(true);
    try {
      await addIssue({
        property_id: propertyId,
        tenant_id: userId,
        title,
        description,
        attachments: [],
        status: "reported",
      });

      setTitle("");
      setDescription("");
      setPropertyId(propertyOptions?.[0]?.id || "");
      onClose();
      alert("Issue raised successfully!");
    } catch (e) {
      console.error("Error:", e);
      alert("Failed to submit issue: " + e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center">
      <div className="bg-background rounded-lg shadow-lg p-6 w-full max-w-md">
        <h2 className="text-lg font-bold mb-4">Raise New Issue</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block mb-1 font-medium">Property *</label>
            <select
              className="w-full p-2 border rounded bg-white dark:bg-slate-900"
              value={propertyId}
              onChange={(e) => setPropertyId(e.target.value)}
              required
            >
              <option value="">Select a property</option>
              {propertyOptions && propertyOptions.map((p) => (
                <option value={p.id} key={p.id}>{p.title}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block mb-1 font-medium">Title *</label>
            <input
              className="w-full p-2 border rounded"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              placeholder="e.g. Leakage in bathroom"
            />
          </div>
          <div>
            <label className="block mb-1 font-medium">Description *</label>
            <textarea
              className="w-full p-2 border rounded"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              required
              placeholder="Describe the issue in detail..."
            />
          </div>
          <Button type="submit" disabled={loading} className="w-full">
            {loading ? "Submitting..." : "Submit Issue"}
          </Button>
          <Button variant="outline" className="w-full" type="button" onClick={onClose}>
            Cancel
          </Button>
        </form>
      </div>
    </div>
  );
};

const Issues = () => {
  const { user, getAllUsers } = useAuth();
  const { getTenantIssues, getPropertyById, addIssue, updateIssue, properties } = useProperty();
  const { toast } = useToast();
  const navigate = useNavigate();

  const allUsers = getAllUsers();
  const [showDialog, setShowDialog] = useState(false);

  // ✅ FIX: Tenants see their raised issues
  const tenantIssues = user?.role === "tenant" ? getTenantIssues(user.uid) : [];
  const issues = tenantIssues;

  const reportedIssues = issues.filter((i) => i.status === "reported");
  const investigatingIssues = issues.filter((i) => i.status === "investigating");
  const resolvedIssues = issues.filter((i) => i.status === "resolved" || i.status === "closed");

  // ✅ FIX: Show ALL properties tenant can raise issues for (not just confirmed bookings)
  const propertyOptions = properties.filter((p) => p.owner_id); // Any property with owner

  const handleStatusChange = (issueId, newStatus) => {
    try {
      updateIssue(issueId, { status: newStatus });
      toast({
        title: "Status Updated",
        description: `Issue status changed to ${newStatus}`,
      });
    } catch (e) {
      console.error("Error updating issue:", e);
      toast({
        title: "Error",
        description: "Failed to update issue status",
        variant: "destructive",
      });
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "reported":
        return <AlertCircle className="h-4 w-4" />;
      case "investigating":
        return <Clock className="h-4 w-4" />;
      case "resolved":
      case "closed":
        return <CheckCircle className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "reported":
        return "destructive";
      case "investigating":
        return "secondary";
      case "resolved":
      case "closed":
        return "default";
      default:
        return "outline";
    }
  };

  const renderIssueCard = (issue) => {
    const property = getPropertyById(issue.property_id);
    const tenant = allUsers.find((u) => u.uid === issue.tenant_id);

    if (!property) {
      return (
        <Card key={issue.id} className="mb-4 opacity-50">
          <CardContent className="pt-6">
            <p className="text-muted-foreground">Property data unavailable</p>
          </CardContent>
        </Card>
      );
    }

    return (
      <Card key={issue.id} className="mb-4">
        <CardContent className="pt-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-start gap-3 mb-3">
                <div
                  className={`p-2 rounded-lg ${
                    issue.status === "reported"
                      ? "bg-destructive/10"
                      : issue.status === "investigating"
                        ? "bg-secondary/50"
                        : "bg-primary/10"
                  }`}
                >
                  {getStatusIcon(issue.status)}
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-lg mb-1">{issue.title}</h3>
                  <p className="text-sm text-muted-foreground mb-2">{issue.description}</p>
                  <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {property?.title || "Unknown Property"}
                    </span>
                    <span className="flex items-center gap-1">
                      <User className="h-3 w-3" />
                      {tenant?.name || "Unknown Tenant"}
                    </span>
                    <span>Reported: {new Date(issue.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            </div>
            <Badge variant={getStatusColor(issue.status)}>{issue.status}</Badge>
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
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">Issue Tracking</h1>
              <p className="text-muted-foreground">Report property maintenance issues</p>
            </div>
            {/* ✅ ALWAYS VISIBLE BUTTON FOR TENANT */}
            {user?.role === "tenant" && propertyOptions.length > 0 && (
              <Button onClick={() => setShowDialog(true)} className="flex items-center gap-2 bg-primary hover:bg-primary/90">
                <Plus className="h-4 w-4" />
                Raise Issue
              </Button>
            )}
          </div>
          
          <RaiseIssueDialog
            open={showDialog}
            onClose={() => setShowDialog(false)}
            propertyOptions={propertyOptions}
            userId={user?.uid}
            addIssue={addIssue}
          />

          {/* Summary Stats */}
          <div className="grid gap-6 md:grid-cols-4 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Issues</CardTitle>
                <FileText className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{issues.length}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Reported</CardTitle>
                <AlertCircle className="h-4 w-4 text-destructive" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-destructive">{reportedIssues.length}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Investigating</CardTitle>
                <Clock className="h-4 w-4 text-accent" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-accent">{investigatingIssues.length}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Resolved</CardTitle>
                <CheckCircle className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-primary">{resolvedIssues.length}</div>
              </CardContent>
            </Card>
          </div>

          {/* Issues by Status */}
          {reportedIssues.length > 0 && (
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-destructive" />
                Newly Reported Issues
              </h2>
              {reportedIssues.map(renderIssueCard)}
            </div>
          )}
          {investigatingIssues.length > 0 && (
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Clock className="h-5 w-5 text-accent" />
                Under Investigation
              </h2>
              {investigatingIssues.map(renderIssueCard)}
            </div>
          )}
          {resolvedIssues.length > 0 && (
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-primary" />
                Resolved Issues
              </h2>
              {resolvedIssues.map(renderIssueCard)}
            </div>
          )}

          {/* Empty State */}
          {issues.length === 0 && (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-16">
                <FileText className="h-16 w-16 text-muted-foreground mb-4" />
                <h3 className="text-xl font-semibold mb-2">No Issues Reported</h3>
                <p className="text-muted-foreground mb-6">You haven't raised any issues yet.</p>
                <Button onClick={() => navigate("/tenant/dashboard")}>
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

export default Issues;
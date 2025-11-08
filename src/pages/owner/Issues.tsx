import { useAuth } from "@/contexts/AuthContext";
import { useProperty } from "@/contexts/PropertyContext";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import BackButton from "@/components/BackButton";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileText, AlertCircle, CheckCircle, Clock, User, MapPin } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Issues = () => {
  const { user, getAllUsers } = useAuth();
  const { getOwnerIssues, getPropertyById, updateIssue } = useProperty();
  const { toast } = useToast();
  const navigate = useNavigate();

  const ownerIssues = user ? getOwnerIssues(user.uid) : [];
  const allUsers = getAllUsers();

  const reportedIssues = ownerIssues.filter(i => i.status === "reported");
  const investigatingIssues = ownerIssues.filter(i => i.status === "investigating");
  const resolvedIssues = ownerIssues.filter(i => i.status === "resolved" || i.status === "closed");

  const handleStatusChange = (issueId: string, newStatus: string) => {
    updateIssue(issueId, { status: newStatus as any });
    toast({
      title: "Status Updated",
      description: `Issue status changed to ${newStatus}`,
    });
  };

  const getStatusIcon = (status: string) => {
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

  const getStatusColor = (status: string) => {
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

  const getTenantName = (tenantId: string) => {
    const tenant = allUsers.find(u => u.uid === tenantId);
    return tenant?.name || "Unknown Tenant";
  };

  const renderIssueCard = (issue: any) => {
    const property = getPropertyById(issue.property_id);
    const tenant = allUsers.find(u => u.uid === issue.tenant_id);

    return (
      <Card key={issue.id} className="mb-4">
        <CardContent className="pt-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-start gap-3 mb-3">
                <div className={`p-2 rounded-lg ${
                  issue.status === "reported" ? "bg-destructive/10" :
                  issue.status === "investigating" ? "bg-secondary/50" :
                  "bg-primary/10"
                }`}>
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
                    <span>
                      Reported: {new Date(issue.created_at).toLocaleDateString()}
                    </span>
                  </div>

                  {issue.attachments && issue.attachments.length > 0 && (
                    <div className="mt-3 flex gap-2">
                      {issue.attachments.map((attachment: string, idx: number) => (
                        <img
                          key={idx}
                          src={attachment}
                          alt={`Attachment ${idx + 1}`}
                          className="w-20 h-20 object-cover rounded border"
                        />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="ml-4 flex flex-col gap-2 items-end">
              <Badge variant={getStatusColor(issue.status) as any}>
                {issue.status}
              </Badge>
              
              <Select
                value={issue.status}
                onValueChange={(value) => handleStatusChange(issue.id, value)}
              >
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="reported">Reported</SelectItem>
                  <SelectItem value="investigating">Investigating</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                  <SelectItem value="closed">Closed</SelectItem>
                </SelectContent>
              </Select>
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
            <h1 className="text-3xl font-bold mb-2">Issue Tracking</h1>
            <p className="text-muted-foreground">Manage property maintenance and tenant issues</p>
          </div>

          {/* Summary Stats */}
          <div className="grid gap-6 md:grid-cols-4 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Issues
                </CardTitle>
                <FileText className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{ownerIssues.length}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Reported
                </CardTitle>
                <AlertCircle className="h-4 w-4 text-destructive" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-destructive">{reportedIssues.length}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Investigating
                </CardTitle>
                <Clock className="h-4 w-4 text-accent" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-accent">{investigatingIssues.length}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Resolved
                </CardTitle>
                <CheckCircle className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-primary">{resolvedIssues.length}</div>
              </CardContent>
            </Card>
          </div>

          {/* Reported Issues */}
          {reportedIssues.length > 0 && (
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-destructive" />
                Newly Reported Issues
              </h2>
              {reportedIssues.map(renderIssueCard)}
            </div>
          )}

          {/* Investigating Issues */}
          {investigatingIssues.length > 0 && (
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Clock className="h-5 w-5 text-accent" />
                Under Investigation
              </h2>
              {investigatingIssues.map(renderIssueCard)}
            </div>
          )}

          {/* Resolved Issues */}
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
          {ownerIssues.length === 0 && (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-16">
                <FileText className="h-16 w-16 text-muted-foreground mb-4" />
                <h3 className="text-xl font-semibold mb-2">No Issues Reported</h3>
                <p className="text-muted-foreground mb-6">Great! All your properties are running smoothly.</p>
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

export default Issues;

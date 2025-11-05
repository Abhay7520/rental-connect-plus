import { useAuth } from "@/contexts/AuthContext";
import { useProperty } from "@/contexts/PropertyContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import BackButton from "@/components/BackButton";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { AlertCircle } from "lucide-react";

const Issues = () => {
  const { user } = useAuth();
  const { properties, getOwnerIssues, updateIssue } = useProperty();

  const ownerIssues = user ? getOwnerIssues(user.uid) : [];

  const handleStatusChange = (issueId: string, newStatus: string) => {
    updateIssue(issueId, { 
      status: newStatus as "reported" | "investigating" | "resolved" | "closed" 
    });
    toast({
      title: "Status updated",
      description: `Issue status changed to ${newStatus}`,
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "reported":
        return "bg-red-500";
      case "investigating":
        return "bg-yellow-500";
      case "resolved":
        return "bg-green-500";
      case "closed":
        return "bg-gray-500";
      default:
        return "bg-gray-500";
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-8">
        <BackButton />
        <div className="flex items-center gap-3 mb-8">
          <AlertCircle className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold">Property Issues</h1>
        </div>

        {ownerIssues.length === 0 ? (
          <Card>
            <CardContent className="pt-6 text-center text-muted-foreground">
              <p>No issues reported for your properties</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6">
            {ownerIssues
              .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
              .map((issue) => {
                const property = properties.find((p) => p.id === issue.property_id);
                return (
                  <Card key={issue.id}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="space-y-1 flex-1">
                          <div className="flex items-center gap-3">
                            <CardTitle className="text-xl">{issue.title}</CardTitle>
                            <Badge className={getStatusColor(issue.status)}>{issue.status}</Badge>
                          </div>
                          <CardDescription className="text-base">
                            Property: {property?.title || "Unknown Property"}
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <p className="text-sm font-medium mb-1">Description:</p>
                        <p className="text-sm text-muted-foreground">{issue.description}</p>
                      </div>

                      {issue.attachments.length > 0 && (
                        <div>
                          <p className="text-sm font-medium mb-2">Attachments:</p>
                          <div className="flex gap-2 flex-wrap">
                            {issue.attachments.map((img, idx) => (
                              <img
                                key={idx}
                                src={img}
                                alt={`Attachment ${idx + 1}`}
                                className="h-24 w-24 object-cover rounded-md border"
                              />
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="flex items-center gap-4 pt-4 border-t">
                        <div className="flex-1">
                          <Label htmlFor={`status-${issue.id}`}>Update Status</Label>
                          <Select
                            value={issue.status}
                            onValueChange={(value) => handleStatusChange(issue.id, value)}
                          >
                            <SelectTrigger id={`status-${issue.id}`}>
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
                        <div className="text-xs text-muted-foreground">
                          Reported: {new Date(issue.created_at).toLocaleDateString()}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default Issues;

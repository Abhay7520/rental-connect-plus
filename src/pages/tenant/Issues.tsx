import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useProperty } from "@/contexts/PropertyContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { Upload, AlertCircle } from "lucide-react";

const Issues = () => {
  const { user } = useAuth();
  const { properties, bookings, addIssue, getTenantIssues } = useProperty();
  const [formData, setFormData] = useState({
    property_id: "",
    title: "",
    description: "",
    attachments: [] as string[],
  });

  // Get properties tenant has bookings for
  const tenantBookings = bookings.filter((b) => b.tenant_id === user?.uid);
  const bookedPropertyIds = [...new Set(tenantBookings.map((b) => b.property_id))];
  const bookedProperties = properties.filter((p) => bookedPropertyIds.includes(p.id));

  const tenantIssues = user ? getTenantIssues(user.uid) : [];

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const imageUrls = Array.from(files).map((file) => URL.createObjectURL(file));
      setFormData({ ...formData, attachments: [...formData.attachments, ...imageUrls] });
      toast({
        title: "Images uploaded",
        description: `${files.length} image(s) uploaded successfully`,
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to report issues",
        variant: "destructive",
      });
      return;
    }

    if (!formData.property_id || !formData.title || !formData.description) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    addIssue({
      tenant_id: user.uid,
      property_id: formData.property_id,
      title: formData.title,
      description: formData.description,
      attachments: formData.attachments,
      status: "reported",
    });

    toast({
      title: "Issue reported",
      description: "Your issue has been submitted successfully",
    });

    setFormData({
      property_id: "",
      title: "",
      description: "",
      attachments: [],
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
        <h1 className="text-3xl font-bold mb-8">Report & Track Issues</h1>

        <div className="grid gap-8 md:grid-cols-2">
          {/* Report Issue Form */}
          <Card>
            <CardHeader>
              <CardTitle>Report New Issue</CardTitle>
              <CardDescription>Submit a maintenance or property issue</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="property">Property *</Label>
                  <Select
                    value={formData.property_id}
                    onValueChange={(value) => setFormData({ ...formData, property_id: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select property" />
                    </SelectTrigger>
                    <SelectContent>
                      {bookedProperties.map((property) => (
                        <SelectItem key={property.id} value={property.id}>
                          {property.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="title">Issue Title *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Brief description of the issue"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description *</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Detailed description of the issue"
                    required
                    rows={4}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="images">Upload Images</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="images"
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleImageUpload}
                      className="flex-1"
                    />
                    <Upload className="h-5 w-5 text-muted-foreground" />
                  </div>
                  {formData.attachments.length > 0 && (
                    <p className="text-sm text-muted-foreground">
                      {formData.attachments.length} image(s) selected
                    </p>
                  )}
                </div>

                <Button type="submit" className="w-full">
                  <AlertCircle className="mr-2 h-4 w-4" />
                  Submit Issue
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Issues List */}
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold">Your Reported Issues</h2>
            {tenantIssues.length === 0 ? (
              <Card>
                <CardContent className="pt-6 text-center text-muted-foreground">
                  No issues reported yet
                </CardContent>
              </Card>
            ) : (
              tenantIssues
                .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
                .map((issue) => {
                  const property = properties.find((p) => p.id === issue.property_id);
                  return (
                    <Card key={issue.id}>
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="space-y-1">
                            <CardTitle className="text-lg">{issue.title}</CardTitle>
                            <CardDescription>{property?.title}</CardDescription>
                          </div>
                          <Badge className={getStatusColor(issue.status)}>{issue.status}</Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground mb-2">{issue.description}</p>
                        <p className="text-xs text-muted-foreground">
                          Reported: {new Date(issue.created_at).toLocaleDateString()}
                        </p>
                        {issue.attachments.length > 0 && (
                          <div className="mt-4 flex gap-2 flex-wrap">
                            {issue.attachments.map((img, idx) => (
                              <img
                                key={idx}
                                src={img}
                                alt={`Attachment ${idx + 1}`}
                                className="h-20 w-20 object-cover rounded-md"
                              />
                            ))}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  );
                })
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Issues;

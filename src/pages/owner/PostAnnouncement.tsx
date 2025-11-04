import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useProperty } from "@/contexts/PropertyContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

const PostAnnouncement = () => {
  const { user } = useAuth();
  const { addAnnouncement } = useProperty();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [message, setMessage] = useState("");
  const [type, setType] = useState<'festival' | 'maintenance' | 'event'>('event');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!message.trim()) {
      toast({
        title: "Error",
        description: "Please enter a message",
        variant: "destructive",
      });
      return;
    }

    if (!user) return;

    addAnnouncement({
      posted_by: user.uid,
      message: message.trim(),
      type,
    });

    toast({
      title: "Success",
      description: "Announcement posted successfully",
    });

    navigate("/announcements");
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>Post Announcement</CardTitle>
              <CardDescription>
                Share important updates with all tenants
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="type">Announcement Type</Label>
                  <Select value={type} onValueChange={(value: any) => setType(value)}>
                    <SelectTrigger id="type">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="festival">Festival</SelectItem>
                      <SelectItem value="maintenance">Maintenance</SelectItem>
                      <SelectItem value="event">Event</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="message">Message</Label>
                  <Textarea
                    id="message"
                    placeholder="Enter your announcement message..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    rows={6}
                    required
                  />
                </div>

                <div className="flex gap-4">
                  <Button type="submit" className="flex-1">
                    Post Announcement
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate("/announcements")}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default PostAnnouncement;

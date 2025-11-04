import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useProperty } from "@/contexts/PropertyContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Calendar, Megaphone } from "lucide-react";

const Announcements = () => {
  const { user } = useAuth();
  const { getAnnouncements } = useProperty();
  const navigate = useNavigate();
  const [filter, setFilter] = useState<'all' | 'festival' | 'maintenance' | 'event'>('all');

  const announcements = getAnnouncements();
  const filteredAnnouncements = filter === 'all' 
    ? announcements 
    : announcements.filter(a => a.type === filter);

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'festival':
        return 'bg-gradient-to-r from-pink-500 to-purple-500 text-white border-0';
      case 'maintenance':
        return 'bg-gradient-to-r from-orange-500 to-red-500 text-white border-0';
      case 'event':
        return 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white border-0';
      default:
        return '';
    }
  };

  const getTypeBadgeVariant = (type: string): "default" | "secondary" | "destructive" => {
    switch (type) {
      case 'festival':
        return 'default';
      case 'maintenance':
        return 'destructive';
      case 'event':
        return 'secondary';
      default:
        return 'default';
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <Megaphone className="h-8 w-8 text-primary" />
              <h1 className="text-3xl font-bold">Announcements</h1>
            </div>
            {user?.role === 'owner' || user?.role === 'admin' ? (
              <Button onClick={() => navigate("/owner/post-announcement")}>
                Post Announcement
              </Button>
            ) : null}
          </div>

          <div className="mb-6">
            <Select value={filter} onValueChange={(value: any) => setFilter(value)}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="festival">Festival</SelectItem>
                <SelectItem value="maintenance">Maintenance</SelectItem>
                <SelectItem value="event">Event</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-4">
            {filteredAnnouncements.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center text-muted-foreground">
                  No announcements to display
                </CardContent>
              </Card>
            ) : (
              filteredAnnouncements.map((announcement) => (
                <Card key={announcement.id} className={getTypeColor(announcement.type)}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant={getTypeBadgeVariant(announcement.type)} className="capitalize">
                            {announcement.type}
                          </Badge>
                        </div>
                        <CardTitle className="text-lg">{announcement.message}</CardTitle>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-2 text-sm opacity-90">
                      <Calendar className="h-4 w-4" />
                      <span>
                        {new Date(announcement.date).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Announcements;

import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useCommunity } from "@/contexts/CommunityContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Calendar, Plus, Users, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Events = () => {
  const { user } = useAuth();
  const { events, addEvent, rsvpEvent, getEvents } = useCommunity();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");
  const [image, setImage] = useState("");

  const allEvents = getEvents();
  const isOwnerOrAdmin = user?.role === "owner" || user?.role === "admin";

  const handleCreateEvent = () => {
    if (!title.trim() || !description.trim() || !date) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    addEvent({
      title,
      description,
      date,
      image: image || "https://images.unsplash.com/photo-1492684223066-81342ee5ff30",
    });

    toast({
      title: "✅ Event Created",
      description: "Your event has been posted to the community",
    });

    setTitle("");
    setDescription("");
    setDate("");
    setImage("");
    setOpen(false);
  };

  const handleRSVP = (eventId: string, status: "yes" | "no") => {
    rsvpEvent(eventId, status);
    
    toast({
      title: status === "yes" ? "✅ RSVP Confirmed" : "RSVP Updated",
      description: status === "yes" 
        ? "We look forward to seeing you!" 
        : "Your response has been recorded",
    });
  };

  const getUserRSVP = (event: typeof allEvents[0]) => {
    if (!user) return null;
    return event.rsvps.find(r => r.user_id === user.uid);
  };

  const getAttendeeCount = (event: typeof allEvents[0]) => {
    return event.rsvps.filter(r => r.status === "yes").length;
  };

  const isEventPast = (eventDate: string) => {
    return new Date(eventDate) < new Date();
  };

  const formatEventDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const upcomingEvents = allEvents.filter(e => !isEventPast(e.date));
  const pastEvents = allEvents.filter(e => isEventPast(e.date));

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
              <Calendar className="h-8 w-8" />
              Community Events & Meetups
            </h1>
            <p className="text-muted-foreground">
              Join community events and connect with your neighbors
            </p>
          </div>
          
          {isOwnerOrAdmin && (
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button size="lg" className="mt-4 md:mt-0">
                  <Plus className="mr-2 h-5 w-5" />
                  Create Event
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Create New Event</DialogTitle>
                  <DialogDescription>
                    Post a community event or meetup
                  </DialogDescription>
                </DialogHeader>
                
                <div className="space-y-4 mt-4">
                  <div>
                    <Label htmlFor="title">Event Title *</Label>
                    <Input
                      id="title"
                      placeholder="e.g., Community BBQ Night"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="description">Description *</Label>
                    <Textarea
                      id="description"
                      placeholder="Describe your event..."
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      rows={4}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="date">Event Date & Time *</Label>
                    <Input
                      id="date"
                      type="datetime-local"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="image">Image URL (optional)</Label>
                    <Input
                      id="image"
                      placeholder="https://example.com/image.jpg"
                      value={image}
                      onChange={(e) => setImage(e.target.value)}
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Leave blank to use default image
                    </p>
                  </div>
                  
                  <Button onClick={handleCreateEvent} className="w-full">
                    Create Event
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>

        {allEvents.length === 0 ? (
          <Card>
            <CardContent className="py-12">
              <div className="text-center text-muted-foreground">
                <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="mb-4">No events yet</p>
                {isOwnerOrAdmin && (
                  <Button onClick={() => setOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Create First Event
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-8">
            {upcomingEvents.length > 0 && (
              <div>
                <h2 className="text-2xl font-bold mb-4">Upcoming Events</h2>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {upcomingEvents.map((event) => {
                    const userRsvp = getUserRSVP(event);
                    const attendeeCount = getAttendeeCount(event);

                    return (
                      <Card key={event.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                        <div className="aspect-video w-full overflow-hidden bg-muted">
                          <img 
                            src={event.image} 
                            alt={event.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <CardHeader>
                          <div className="flex items-start justify-between mb-2">
                            <Badge>Upcoming</Badge>
                            <div className="flex items-center gap-1 text-sm text-muted-foreground">
                              <Users className="h-4 w-4" />
                              <span>{attendeeCount}</span>
                            </div>
                          </div>
                          <CardTitle>{event.title}</CardTitle>
                          <CardDescription className="flex items-center gap-2">
                            <Clock className="h-4 w-4" />
                            {formatEventDate(event.date)}
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                            {event.description}
                          </p>
                          
                          <div className="flex gap-2">
                            {userRsvp?.status === "yes" ? (
                              <>
                                <Button variant="default" className="flex-1" disabled>
                                  ✓ Going
                                </Button>
                                <Button 
                                  variant="outline" 
                                  onClick={() => handleRSVP(event.id, "no")}
                                >
                                  Cancel
                                </Button>
                              </>
                            ) : (
                              <Button 
                                className="flex-1"
                                onClick={() => handleRSVP(event.id, "yes")}
                              >
                                RSVP
                              </Button>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>
            )}

            {pastEvents.length > 0 && (
              <div>
                <h2 className="text-2xl font-bold mb-4">Past Events</h2>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {pastEvents.map((event) => {
                    const attendeeCount = getAttendeeCount(event);

                    return (
                      <Card key={event.id} className="overflow-hidden opacity-75">
                        <div className="aspect-video w-full overflow-hidden bg-muted">
                          <img 
                            src={event.image} 
                            alt={event.title}
                            className="w-full h-full object-cover grayscale"
                          />
                        </div>
                        <CardHeader>
                          <div className="flex items-start justify-between mb-2">
                            <Badge variant="secondary">Past</Badge>
                            <div className="flex items-center gap-1 text-sm text-muted-foreground">
                              <Users className="h-4 w-4" />
                              <span>{attendeeCount} attended</span>
                            </div>
                          </div>
                          <CardTitle>{event.title}</CardTitle>
                          <CardDescription className="flex items-center gap-2">
                            <Clock className="h-4 w-4" />
                            {formatEventDate(event.date)}
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {event.description}
                          </p>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default Events;

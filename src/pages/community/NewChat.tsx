import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useCommunity } from "@/contexts/CommunityContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import BackButton from "@/components/BackButton";
import ChatRoom from "@/components/ChatRoom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MessageCircle, Plus, LogIn } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const NewChat = () => {
  const { user } = useAuth();
  const { createChatRoom, joinChatRoom, addMessageToRoom, getChatRoomMessages, leaveChatRoom } = useCommunity();
  const { toast } = useToast();
  const [currentRoom, setCurrentRoom] = useState<string | null>(null);
  const [inviteCode, setInviteCode] = useState("");

  const handleCreateRoom = () => {
    if (!user) return;
    
    const roomCode = createChatRoom();
    setCurrentRoom(roomCode);
    
    toast({
      title: "Room Created!",
      description: `Share invite code: ${roomCode}`,
    });
  };

  const handleJoinRoom = () => {
    if (!user || !inviteCode.trim()) {
      toast({
        title: "Error",
        description: "Please enter a valid room code",
        variant: "destructive",
      });
      return;
    }
    
    const success = joinChatRoom(inviteCode.trim().toUpperCase());
    if (success) {
      setCurrentRoom(inviteCode.trim().toUpperCase());
      toast({
        title: "Joined Room!",
        description: "You can now chat with others",
      });
    } else {
      toast({
        title: "Error",
        description: "Invalid room code. Please check and try again.",
        variant: "destructive",
      });
    }
  };

  const handleSendMessage = (message: string) => {
    if (currentRoom) {
      addMessageToRoom(currentRoom, message);
    }
  };

  const handleLeaveRoom = () => {
    if (currentRoom) {
      leaveChatRoom(currentRoom);
      setCurrentRoom(null);
      toast({
        title: "Left Room",
        description: "You have left the chat room",
      });
    }
  };

  if (currentRoom) {
    const messages = getChatRoomMessages(currentRoom);
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        
        <main className="flex-1 container mx-auto px-4 py-8">
          <BackButton />
          <div className="mb-6">
            <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
              <MessageCircle className="h-8 w-8" />
              Community Chat
            </h1>
            <p className="text-muted-foreground">
              Secure chat room with invite code
            </p>
          </div>

          <ChatRoom
            roomCode={currentRoom}
            messages={messages}
            onSendMessage={handleSendMessage}
            onLeave={handleLeaveRoom}
          />
        </main>

        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 py-8 flex items-center justify-center">
        <div className="max-w-2xl w-full space-y-6">
          <div className="text-center mb-8">
            <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
              <MessageCircle className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-3xl font-bold mb-2">Community Chat Rooms</h1>
            <p className="text-muted-foreground">
              Create or join secure chat rooms with invite codes
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Create Room */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plus className="h-5 w-5" />
                  Create Room
                </CardTitle>
                <CardDescription>
                  Start a new chat room and invite others
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button onClick={handleCreateRoom} className="w-full" size="lg">
                  <Plus className="mr-2 h-5 w-5" />
                  Create New Room
                </Button>
                <p className="text-xs text-muted-foreground mt-3 text-center">
                  You'll get a unique code to share with others
                </p>
              </CardContent>
            </Card>

            {/* Join Room */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <LogIn className="h-5 w-5" />
                  Join Room
                </CardTitle>
                <CardDescription>
                  Enter an invite code to join a room
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="invite-code">Invite Code</Label>
                  <Input
                    id="invite-code"
                    placeholder="Enter 6-digit code"
                    value={inviteCode}
                    onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                    maxLength={6}
                    className="font-mono text-center text-lg tracking-wider"
                  />
                </div>
                <Button 
                  onClick={handleJoinRoom} 
                  className="w-full" 
                  size="lg"
                  disabled={inviteCode.length !== 6}
                >
                  <LogIn className="mr-2 h-5 w-5" />
                  Join Room
                </Button>
              </CardContent>
            </Card>
          </div>

          <Card className="bg-secondary/20">
            <CardContent className="pt-6">
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                🔒 Privacy & Security
              </h3>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Each room has a unique 6-digit invite code</li>
                <li>• Only users with the code can join</li>
                <li>• Messages are private to room members</li>
                <li>• You can leave any room at any time</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default NewChat;

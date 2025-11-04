import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useCommunity } from "@/contexts/CommunityContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { MessageCircle, Send } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Chat = () => {
  const { user } = useAuth();
  const { messages, addMessage, getMessages } = useCommunity();
  const { toast } = useToast();
  const [messageText, setMessageText] = useState("");
  const [hasJoined, setHasJoined] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const allMessages = getMessages();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleJoinChat = () => {
    setHasJoined(true);
    toast({
      title: "Welcome!",
      description: "You've joined the community chat",
    });
  };

  const handleSendMessage = () => {
    if (!messageText.trim()) return;

    addMessage({ message: messageText });
    setMessageText("");
    
    setTimeout(scrollToBottom, 100);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case "admin":
        return "destructive" as const;
      case "owner":
        return "default" as const;
      default:
        return "secondary" as const;
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  if (!hasJoined && allMessages.length === 1) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        
        <main className="flex-1 container mx-auto px-4 py-8 flex items-center justify-center">
          <Card className="max-w-md w-full">
            <CardHeader className="text-center">
              <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                <MessageCircle className="h-8 w-8 text-primary" />
              </div>
              <CardTitle>Join Community Chat</CardTitle>
              <CardDescription>
                Connect with your neighbors and stay updated with community discussions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={handleJoinChat} className="w-full" size="lg">
                <MessageCircle className="mr-2 h-5 w-5" />
                Join Chat
              </Button>
            </CardContent>
          </Card>
        </main>

        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
            <MessageCircle className="h-8 w-8" />
            Community Chat
          </h1>
          <p className="text-muted-foreground">
            Connect with neighbors and stay updated
          </p>
        </div>

        <Card className="h-[600px] flex flex-col">
          <CardHeader className="border-b">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>General Chat</CardTitle>
                <CardDescription>Community Discussion Room</CardDescription>
              </div>
              <Badge variant="outline">
                {allMessages.length} {allMessages.length === 1 ? 'message' : 'messages'}
              </Badge>
            </div>
          </CardHeader>
          
          <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
            {allMessages.map((msg) => {
              const isOwnMessage = user?.uid === msg.sender_id;
              
              return (
                <div
                  key={msg.id}
                  className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[70%] ${isOwnMessage ? 'order-2' : 'order-1'}`}>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-semibold">
                        {msg.sender_name}
                      </span>
                      <Badge variant={getRoleBadgeVariant(msg.sender_role)} className="text-xs">
                        {msg.sender_role}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {formatTime(msg.timestamp)}
                      </span>
                    </div>
                    <div
                      className={`rounded-lg p-3 ${
                        isOwnMessage
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted'
                      }`}
                    >
                      <p className="text-sm break-words">{msg.message}</p>
                    </div>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </CardContent>

          <div className="border-t p-4">
            <div className="flex gap-2">
              <Input
                placeholder="Type your message..."
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                onKeyPress={handleKeyPress}
                className="flex-1"
              />
              <Button onClick={handleSendMessage} disabled={!messageText.trim()}>
                <Send className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Press Enter to send, Shift+Enter for new line
            </p>
          </div>
        </Card>
      </main>

      <Footer />
    </div>
  );
};

export default Chat;

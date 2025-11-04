import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useAuth } from "./AuthContext";

export interface Poll {
  id: string;
  question: string;
  options: string[];
  votes: number[];
  createdBy: string;
  createdAt: string;
  voters: string[];
}

export interface ChatMessage {
  id: string;
  sender_id: string;
  sender_name: string;
  sender_role: string;
  message: string;
  timestamp: string;
}

export interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  image: string;
  createdBy: string;
  createdAt: string;
  rsvps: {
    user_id: string;
    status: "yes" | "no";
  }[];
}

interface CommunityContextType {
  polls: Poll[];
  messages: ChatMessage[];
  events: Event[];
  addPoll: (poll: Omit<Poll, "id" | "createdBy" | "createdAt" | "voters">) => void;
  votePoll: (pollId: string, optionIndex: number) => boolean;
  addMessage: (message: Omit<ChatMessage, "id" | "sender_id" | "sender_name" | "sender_role" | "timestamp">) => void;
  addEvent: (event: Omit<Event, "id" | "createdBy" | "createdAt" | "rsvps">) => void;
  rsvpEvent: (eventId: string, status: "yes" | "no") => void;
  getPolls: () => Poll[];
  getMessages: () => ChatMessage[];
  getEvents: () => Event[];
}

const CommunityContext = createContext<CommunityContextType | undefined>(undefined);

export const CommunityProvider = ({ children }: { children: ReactNode }) => {
  const [polls, setPolls] = useState<Poll[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const { user } = useAuth();

  useEffect(() => {
    const storedPolls = localStorage.getItem("renteazy_polls");
    if (storedPolls) {
      setPolls(JSON.parse(storedPolls));
    }
    
    const storedMessages = localStorage.getItem("renteazy_messages");
    if (storedMessages) {
      setMessages(JSON.parse(storedMessages));
    } else {
      // Initialize with some mock messages
      const mockMessages: ChatMessage[] = [
        {
          id: "msg_1",
          sender_id: "system",
          sender_name: "System",
          sender_role: "admin",
          message: "Welcome to the RentEazy Community Chat! Feel free to connect with your neighbors.",
          timestamp: new Date(Date.now() - 86400000).toISOString(),
        },
      ];
      setMessages(mockMessages);
      localStorage.setItem("renteazy_messages", JSON.stringify(mockMessages));
    }
    
    const storedEvents = localStorage.getItem("renteazy_events");
    if (storedEvents) {
      setEvents(JSON.parse(storedEvents));
    }
  }, []);

  const addPoll = (poll: Omit<Poll, "id" | "createdBy" | "createdAt" | "voters">) => {
    if (!user) return;
    
    const newPoll: Poll = {
      ...poll,
      id: `poll_${Date.now()}`,
      createdBy: user.uid,
      createdAt: new Date().toISOString(),
      voters: [],
    };

    const updated = [...polls, newPoll];
    localStorage.setItem("renteazy_polls", JSON.stringify(updated));
    setPolls(updated);
  };

  const votePoll = (pollId: string, optionIndex: number): boolean => {
    if (!user) return false;
    
    const poll = polls.find(p => p.id === pollId);
    if (!poll) return false;
    
    // Check if user has already voted
    if (poll.voters.includes(user.uid)) {
      return false;
    }

    const updated = polls.map(p => {
      if (p.id === pollId) {
        const newVotes = [...p.votes];
        newVotes[optionIndex]++;
        return {
          ...p,
          votes: newVotes,
          voters: [...p.voters, user.uid],
        };
      }
      return p;
    });

    localStorage.setItem("renteazy_polls", JSON.stringify(updated));
    setPolls(updated);
    return true;
  };

  const addMessage = (message: Omit<ChatMessage, "id" | "sender_id" | "sender_name" | "sender_role" | "timestamp">) => {
    if (!user) return;
    
    const newMessage: ChatMessage = {
      ...message,
      id: `msg_${Date.now()}`,
      sender_id: user.uid,
      sender_name: user.name,
      sender_role: user.role,
      timestamp: new Date().toISOString(),
    };

    const updated = [...messages, newMessage];
    localStorage.setItem("renteazy_messages", JSON.stringify(updated));
    setMessages(updated);
  };

  const addEvent = (event: Omit<Event, "id" | "createdBy" | "createdAt" | "rsvps">) => {
    if (!user) return;
    
    const newEvent: Event = {
      ...event,
      id: `event_${Date.now()}`,
      createdBy: user.uid,
      createdAt: new Date().toISOString(),
      rsvps: [],
    };

    const updated = [...events, newEvent];
    localStorage.setItem("renteazy_events", JSON.stringify(updated));
    setEvents(updated);
  };

  const rsvpEvent = (eventId: string, status: "yes" | "no") => {
    if (!user) return;

    const updated = events.map(e => {
      if (e.id === eventId) {
        const existingRsvpIndex = e.rsvps.findIndex(r => r.user_id === user.uid);
        let newRsvps = [...e.rsvps];
        
        if (existingRsvpIndex >= 0) {
          newRsvps[existingRsvpIndex] = { user_id: user.uid, status };
        } else {
          newRsvps.push({ user_id: user.uid, status });
        }
        
        return { ...e, rsvps: newRsvps };
      }
      return e;
    });

    localStorage.setItem("renteazy_events", JSON.stringify(updated));
    setEvents(updated);
  };

  const getPolls = () => {
    return [...polls].sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  };

  const getMessages = () => {
    return [...messages].sort((a, b) => 
      new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );
  };

  const getEvents = () => {
    return [...events].sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  };

  return (
    <CommunityContext.Provider
      value={{
        polls,
        messages,
        events,
        addPoll,
        votePoll,
        addMessage,
        addEvent,
        rsvpEvent,
        getPolls,
        getMessages,
        getEvents,
      }}
    >
      {children}
    </CommunityContext.Provider>
  );
};

export const useCommunity = () => {
  const context = useContext(CommunityContext);
  if (context === undefined) {
    throw new Error("useCommunity must be used within a CommunityProvider");
  }
  return context;
};

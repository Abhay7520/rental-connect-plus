import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useAuth } from "./AuthContext";
import { PollService, EventService } from "@/services/apiService";

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

interface ChatRoom {
  code: string;
  messages: ChatMessage[];
  members: string[];
  createdAt: string;
}

interface CommunityContextType {
  polls: Poll[];
  messages: ChatMessage[];
  events: Event[];
  chatRooms: Record<string, ChatRoom>;
  addPoll: (poll: Omit<Poll, "id" | "createdBy" | "createdAt" | "voters">) => void;
  votePoll: (pollId: string, optionIndex: number) => Promise<boolean>;
  addMessage: (message: Omit<ChatMessage, "id" | "sender_id" | "sender_name" | "sender_role" | "timestamp">) => void;
  addEvent: (event: Omit<Event, "id" | "createdBy" | "createdAt" | "rsvps">) => void;
  rsvpEvent: (eventId: string, status: "yes" | "no") => Promise<void>;
  getPolls: () => Poll[];
  getMessages: () => ChatMessage[];
  getEvents: () => Event[];
  createChatRoom: () => string;
  joinChatRoom: (code: string) => boolean;
  leaveChatRoom: (code: string) => void;
  addMessageToRoom: (roomCode: string, message: string) => void;
  getChatRoomMessages: (roomCode: string) => ChatMessage[];
}

const CommunityContext = createContext<CommunityContextType | undefined>(undefined);

export const CommunityProvider = ({ children }: { children: ReactNode }) => {
  const [polls, setPolls] = useState<Poll[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [chatRooms, setChatRooms] = useState<Record<string, ChatRoom>>({});
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    let unsubPolls: (() => void) | undefined;
    let unsubEvents: (() => void) | undefined;

    // Load Polls
    PollService.getAll().then((data) => setPolls(data as Poll[]));
    unsubPolls = PollService.onSnapshot((data) => setPolls(data as Poll[]));

    // Load Events
    EventService.getAll().then((data) => setEvents(data as Event[]));
    unsubEvents = EventService.onSnapshot((data) => setEvents(data as Event[]));

    // Load Chat (Local Storage for now)
    const storedMessages = localStorage.getItem("renteazy_messages");
    if (storedMessages) {
      setMessages(JSON.parse(storedMessages));
    } else {
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

    const storedRooms = localStorage.getItem("renteazy_chat_rooms");
    if (storedRooms) {
      setChatRooms(JSON.parse(storedRooms));
    }

    return () => {
      if (unsubPolls) unsubPolls();
      if (unsubEvents) unsubEvents();
    };
  }, [user]);

  const addPoll = async (poll: Omit<Poll, "id" | "createdBy" | "createdAt" | "voters">) => {
    if (!user) return;

    const newPoll = {
      ...poll,
      createdBy: user.uid,
      createdAt: new Date().toISOString(),
      voters: [],
      votes: new Array(poll.options.length).fill(0),
    };

    await PollService.create(newPoll);
    // State updates via onSnapshot/getAll
  };

  const votePoll = async (pollId: string, optionIndex: number): Promise<boolean> => {
    if (!user) return false;

    try {
      await PollService.vote(pollId, optionIndex, user.uid);
      return true;
    } catch (error) {
      console.error("Error voting:", error);
      return false;
    }
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

  const addEvent = async (event: Omit<Event, "id" | "createdBy" | "createdAt" | "rsvps">) => {
    if (!user) return;

    const newEvent = {
      ...event,
      createdBy: user.uid,
      createdAt: new Date().toISOString(),
      rsvps: [],
    };

    await EventService.create(newEvent);
  };

  const rsvpEvent = async (eventId: string, status: "yes" | "no") => {
    if (!user) return;
    await EventService.rsvp(eventId, user.uid, status);
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

  // Chat Room Functions
  const generateRoomCode = (): string => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  };

  const createChatRoom = (): string => {
    if (!user) return "";

    let code = generateRoomCode();
    while (chatRooms[code]) {
      code = generateRoomCode();
    }

    const newRoom: ChatRoom = {
      code,
      messages: [],
      members: [user.uid],
      createdAt: new Date().toISOString(),
    };

    const updated = { ...chatRooms, [code]: newRoom };
    localStorage.setItem("renteazy_chat_rooms", JSON.stringify(updated));
    setChatRooms(updated);

    return code;
  };

  const joinChatRoom = (code: string): boolean => {
    if (!user || !chatRooms[code]) return false;

    const room = chatRooms[code];
    if (!room.members.includes(user.uid)) {
      const updated = {
        ...chatRooms,
        [code]: {
          ...room,
          members: [...room.members, user.uid],
        },
      };
      localStorage.setItem("renteazy_chat_rooms", JSON.stringify(updated));
      setChatRooms(updated);
    }

    return true;
  };

  const leaveChatRoom = (code: string) => {
    if (!user || !chatRooms[code]) return;

    const room = chatRooms[code];
    const updated = {
      ...chatRooms,
      [code]: {
        ...room,
        members: room.members.filter(id => id !== user.uid),
      },
    };
    localStorage.setItem("renteazy_chat_rooms", JSON.stringify(updated));
    setChatRooms(updated);
  };

  const addMessageToRoom = (roomCode: string, message: string) => {
    if (!user || !chatRooms[roomCode]) return;

    const newMessage: ChatMessage = {
      id: `msg_${Date.now()}_${Math.random()}`,
      sender_id: user.uid,
      sender_name: user.name,
      sender_role: user.role,
      message,
      timestamp: new Date().toISOString(),
    };

    const room = chatRooms[roomCode];
    const updated = {
      ...chatRooms,
      [roomCode]: {
        ...room,
        messages: [...room.messages, newMessage],
      },
    };
    localStorage.setItem("renteazy_chat_rooms", JSON.stringify(updated));
    setChatRooms(updated);
  };

  const getChatRoomMessages = (roomCode: string): ChatMessage[] => {
    if (!chatRooms[roomCode]) return [];
    return chatRooms[roomCode].messages;
  };

  return (
    <CommunityContext.Provider
      value={{
        polls,
        messages,
        events,
        chatRooms,
        addPoll,
        votePoll,
        addMessage,
        addEvent,
        rsvpEvent,
        getPolls,
        getMessages,
        getEvents,
        createChatRoom,
        joinChatRoom,
        leaveChatRoom,
        addMessageToRoom,
        getChatRoomMessages,
      }}
    >
      {children}
    </CommunityContext.Provider>
  );
};

export const useCommunity = () => {
  const context = useContext(CommunityContext);
  if (!context) {
    throw new Error("useCommunity must be used within CommunityProvider");
  }
  return context;
};

export default CommunityProvider;

import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

export interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  action?: {
    type: 'redirect';
    label: string;
    path: string;
  };
}

interface RoleResponse {
  text: string;
  path?: string;
}

const getRoleSpecificResponse = (query: string, role: 'tenant' | 'owner' | 'admin'): RoleResponse | null => {
  const lowerQuery = query.toLowerCase();
  
  // Tenant-specific responses
  if (role === 'tenant') {
    if (lowerQuery.includes('pay') || lowerQuery.includes('payment') || lowerQuery.includes('rent')) {
      return {
        text: 'I can help you with payments! Would you like me to redirect you to the Payments page where you can view your payment history and make new payments?',
        path: '/tenant/payments'
      };
    }
    if (lowerQuery.includes('browse') || lowerQuery.includes('find') || lowerQuery.includes('search') || lowerQuery.includes('property') || lowerQuery.includes('properties')) {
      return {
        text: 'Looking for properties? Let me redirect you to the Browse page where you can explore all available properties with filters for location, price, and amenities.',
        path: '/tenant/browse'
      };
    }
    if (lowerQuery.includes('book') || lowerQuery.includes('booking')) {
      return {
        text: 'To book a property, first browse available properties, then click on one to view details. Would you like me to take you to the Browse page?',
        path: '/tenant/browse'
      };
    }
    if (lowerQuery.includes('my booking') || lowerQuery.includes('bookings')) {
      return {
        text: 'I can show you all your bookings! Shall I redirect you to the Bookings page where you can see your booking history and status?',
        path: '/tenant/bookings'
      };
    }
    if (lowerQuery.includes('issue') || lowerQuery.includes('problem') || lowerQuery.includes('complaint') || lowerQuery.includes('report')) {
      return {
        text: 'Need to report an issue? I can take you to the Issues page where you can submit new issues and track existing ones.',
        path: '/tenant/issues'
      };
    }
    if (lowerQuery.includes('reminder')) {
      return {
        text: 'Want to set up reminders for rent payments? Let me redirect you to the Reminders page.',
        path: '/tenant/reminders'
      };
    }
    if (lowerQuery.includes('notification')) {
      return {
        text: 'Check your notifications! Shall I take you to the Notifications page?',
        path: '/tenant/notifications'
      };
    }
  }
  
  // Owner-specific responses
  if (role === 'owner') {
    if (lowerQuery.includes('add property') || lowerQuery.includes('new property') || lowerQuery.includes('list property')) {
      return {
        text: 'Ready to list a new property? I can redirect you to the Add Property page where you can fill in all the details and upload images.',
        path: '/owner/add-property'
      };
    }
    if (lowerQuery.includes('manage') || lowerQuery.includes('edit') || lowerQuery.includes('my propert')) {
      return {
        text: 'Let me take you to Manage Properties where you can view, edit, or delete your property listings.',
        path: '/owner/manage-properties'
      };
    }
    if (lowerQuery.includes('booking') || lowerQuery.includes('request')) {
      return {
        text: 'Want to see booking requests? I can redirect you to the Bookings page where you can approve or reject tenant requests.',
        path: '/owner/bookings'
      };
    }
    if (lowerQuery.includes('issue') || lowerQuery.includes('tenant issue')) {
      return {
        text: 'Check tenant issues! Shall I take you to the Issues page where you can view and respond to reported problems?',
        path: '/owner/issues'
      };
    }
    if (lowerQuery.includes('announcement') || lowerQuery.includes('post') || lowerQuery.includes('notify')) {
      return {
        text: 'Want to post an announcement? Let me redirect you to the Post Announcement page.',
        path: '/owner/post-announcement'
      };
    }
    if (lowerQuery.includes('reminder')) {
      return {
        text: 'Manage your reminders! Shall I take you to the Reminders page?',
        path: '/owner/reminders'
      };
    }
  }
  
  // Admin-specific responses
  if (role === 'admin') {
    if (lowerQuery.includes('user') || lowerQuery.includes('manage user')) {
      return {
        text: 'Need to manage users? I can redirect you to the Manage Users page where you can view, edit roles, and delete users.',
        path: '/admin/manage-users'
      };
    }
    if (lowerQuery.includes('property') || lowerQuery.includes('properties') || lowerQuery.includes('manage propert')) {
      return {
        text: 'Let me take you to Manage Properties where you can oversee all properties in the system.',
        path: '/admin/manage-properties'
      };
    }
    if (lowerQuery.includes('report') || lowerQuery.includes('analytics') || lowerQuery.includes('statistics')) {
      return {
        text: 'Want to view reports and analytics? I can redirect you to the Reports page.',
        path: '/admin/reports'
      };
    }
  }
  
  // Common responses for all roles
  if (lowerQuery.includes('announcement')) {
    return {
      text: 'Check the latest announcements! Shall I redirect you to the Announcements page?',
      path: '/announcements'
    };
  }
  if (lowerQuery.includes('poll') || lowerQuery.includes('vote')) {
    return {
      text: 'Participate in community polls! Let me take you to the Polls page.',
      path: '/community/polls'
    };
  }
  if (lowerQuery.includes('chat') || lowerQuery.includes('community') || lowerQuery.includes('message')) {
    return {
      text: 'Want to chat with the community? I can redirect you to the Community Chat.',
      path: '/community/chat'
    };
  }
  if (lowerQuery.includes('event')) {
    return {
      text: 'Check out community events! Shall I take you to the Events page?',
      path: '/community/events'
    };
  }
  if (lowerQuery.includes('dashboard') || lowerQuery.includes('home')) {
    return {
      text: 'Let me take you to your dashboard where you can see an overview of everything.',
      path: `/${role}/dashboard`
    };
  }
  
  return null;
};

export const useChatbot = (userRole?: 'tenant' | 'owner' | 'admin') => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: userRole 
        ? `Hello! I'm the RentEazy assistant for ${userRole}s. I can help you navigate the platform and redirect you to the right pages. What would you like to do?`
        : 'Hello! I\'m the RentEazy assistant. I can help you with navigating the platform. What would you like to know?',
      sender: 'bot',
      timestamp: new Date(),
    },
  ]);
  const [isTyping, setIsTyping] = useState(false);

  const sendMessage = useCallback((text: string) => {
    const userMessage: Message = {
      id: Date.now().toString(),
      text,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setIsTyping(true);

    setTimeout(() => {
      let botResponse: string;
      let redirectPath: string | undefined;
      
      // Try role-specific response first
      if (userRole) {
        const roleResponse = getRoleSpecificResponse(text, userRole);
        if (roleResponse) {
          botResponse = roleResponse.text;
          redirectPath = roleResponse.path;
        } else {
          botResponse = `I can help you navigate the platform! Try asking about:\n${
            userRole === 'tenant' 
              ? '• Payments and rent\n• Browsing properties\n• My bookings\n• Reporting issues\n• Reminders\n• Notifications'
              : userRole === 'owner'
              ? '• Adding properties\n• Managing properties\n• Booking requests\n• Tenant issues\n• Posting announcements\n• Reminders'
              : '• Managing users\n• Managing properties\n• Viewing reports\n• System analytics'
          }\n• Announcements\n• Community features (polls, chat, events)\n• Dashboard`;
        }
      } else {
        botResponse = 'Please login to get personalized assistance based on your role.';
      }
      
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: botResponse,
        sender: 'bot',
        timestamp: new Date(),
        action: redirectPath ? {
          type: 'redirect',
          label: 'Take me there',
          path: redirectPath
        } : undefined
      };
      
      setMessages(prev => [...prev, botMessage]);
      setIsTyping(false);
    }, 1000);
  }, [userRole]);

  return { messages, sendMessage, isTyping };
};

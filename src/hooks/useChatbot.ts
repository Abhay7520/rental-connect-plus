import { useState, useCallback } from 'react';

export interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

const FAQ_RESPONSES: Record<string, string> = {
  'pay rent': 'To pay rent, go to your Tenant Dashboard and click on the "Payments" section. You can view your payment history and make payments there.',
  'report issue': 'To report an issue, navigate to "Issues" from your dashboard. Click "Report New Issue" and fill in the details. Owners will be notified immediately.',
  'browse properties': 'Visit the "Browse Properties" page from the tenant menu to see all available properties. You can filter by location, price, and other criteria.',
  'book property': 'After browsing properties, click on any property to view details. Then click "Book Property" to submit a booking request to the owner.',
  'announcements': 'Check the "Announcements" page to see important updates about festivals, maintenance schedules, and events from property owners.',
  'add property': 'As an owner, go to "Add Property" from your dashboard. Fill in all property details, upload images, and submit for listing.',
  'manage properties': 'Owners can manage their properties from "Manage Properties" in their dashboard. You can edit details, mark as rented, or delete listings.',
  'view bookings': 'Owners can see all booking requests in their dashboard. You can approve or reject tenant requests.',
  'contact': 'For additional support, you can reach out through the issues page or contact property owners directly through their listed contact information.',
  'login': 'Click the "Login" button in the top navigation bar. Enter your email and password to access your account.',
  'signup': 'Click "Sign Up" in the navigation bar. Choose your role (Tenant, Owner, or Admin) and fill in your details to create an account.',
  'dashboard': 'After logging in, you\'ll be automatically redirected to your role-specific dashboard with personalized features and statistics.',
  'help': 'I can help you with: paying rent, reporting issues, browsing/booking properties, managing properties, viewing announcements, and navigating the platform. Just ask!'
};

export const useChatbot = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Hello! I\'m the RentEazy assistant. I can help you with paying rent, reporting issues, browsing properties, managing bookings, and more. What would you like to know?',
      sender: 'bot',
      timestamp: new Date(),
    },
  ]);
  const [isTyping, setIsTyping] = useState(false);

  const findBestResponse = (query: string): string => {
    const lowerQuery = query.toLowerCase();
    
    for (const [keyword, response] of Object.entries(FAQ_RESPONSES)) {
      if (lowerQuery.includes(keyword)) {
        return response;
      }
    }
    
    return 'I\'m not sure about that. I can help you with: paying rent, reporting issues, browsing properties, booking properties, managing properties, viewing announcements, login/signup, and general navigation. Please try rephrasing your question.';
  };

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
      const botResponse = findBestResponse(text);
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: botResponse,
        sender: 'bot',
        timestamp: new Date(),
      };
      
      setMessages(prev => [...prev, botMessage]);
      setIsTyping(false);
    }, 1000);
  }, []);

  return { messages, sendMessage, isTyping };
};

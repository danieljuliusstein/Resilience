import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { MessageCircle, X, Send, User, Headphones } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import type { ChatMessage, ChatSession } from "@shared/schema";

interface ChatState {
  isOpen: boolean;
  sessionId: string | null;
  messages: ChatMessage[];
  visitorName: string;
  visitorEmail: string;
}

export default function LiveChat() {
  const [chatState, setChatState] = useState<ChatState>({
    isOpen: false,
    sessionId: null,
    messages: [],
    visitorName: "",
    visitorEmail: ""
  });
  const [currentMessage, setCurrentMessage] = useState("");
  const [hasIntroduced, setHasIntroduced] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();

  // Generate session ID
  const generateSessionId = () => {
    return `chat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  };

  // Create chat session mutation
  const createSessionMutation = useMutation({
    mutationFn: async (sessionData: { sessionId: string; visitorName?: string; visitorEmail?: string }) => {
      const response = await fetch(`/api/chat/sessions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(sessionData)
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/chat/sessions"] });
    }
  });

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async (messageData: { sessionId: string; senderType: 'visitor' | 'admin'; senderName?: string; message: string }) => {
      const response = await fetch(`/api/chat/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(messageData)
      });
      return response.json();
    },
    onSuccess: (newMessage: ChatMessage) => {
      setChatState(prev => ({
        ...prev,
        messages: [...prev.messages, newMessage]
      }));
      queryClient.invalidateQueries({ queryKey: [`/api/chat/messages/${chatState.sessionId}`] });
    }
  });

  // Fetch messages for current session
  const { data: messages } = useQuery<ChatMessage[]>({
    queryKey: [`/api/chat/messages/${chatState.sessionId}`],
    enabled: !!chatState.sessionId,
    refetchInterval: 2000, // Poll every 2 seconds for new messages
  });

  // Update messages when new ones arrive
  useEffect(() => {
    if (messages) {
      setChatState(prev => ({ ...prev, messages }));
    }
  }, [messages]);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatState.messages]);

  const toggleChat = () => {
    setChatState(prev => {
      if (!prev.isOpen && !prev.sessionId) {
        // Create new session when opening chat for first time
        const newSessionId = generateSessionId();
        createSessionMutation.mutate({ sessionId: newSessionId });
        return {
          ...prev,
          isOpen: true,
          sessionId: newSessionId
        };
      }
      return { ...prev, isOpen: !prev.isOpen };
    });
  };

  const sendMessage = async () => {
    if (!currentMessage.trim() || !chatState.sessionId) return;

    const messageData = {
      sessionId: chatState.sessionId,
      senderType: 'visitor' as const,
      senderName: chatState.visitorName || 'Visitor',
      message: currentMessage.trim()
    };

    sendMessageMutation.mutate(messageData);
    setCurrentMessage("");
  };

  const handleIntroSubmit = () => {
    if (chatState.visitorName.trim()) {
      setHasIntroduced(true);
      // Send welcome message
      const welcomeMessage = {
        sessionId: chatState.sessionId!,
        senderType: 'visitor' as const,
        senderName: chatState.visitorName,
        message: `Hi! I'm ${chatState.visitorName}. I'd like to learn more about your remodeling services.`
      };
      sendMessageMutation.mutate(welcomeMessage);
      
      // Update session with visitor info
      if (chatState.visitorEmail) {
        createSessionMutation.mutate({
          sessionId: chatState.sessionId!,
          visitorName: chatState.visitorName,
          visitorEmail: chatState.visitorEmail
        });
      }
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (hasIntroduced) {
        sendMessage();
      } else {
        handleIntroSubmit();
      }
    }
  };

  return (
    <>
      {/* Chat Toggle Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <Button
          onClick={toggleChat}
          className={`w-14 h-14 rounded-full shadow-lg transition-all duration-300 ${
            chatState.isOpen 
              ? 'bg-gray-500 hover:bg-gray-600' 
              : 'bg-brand-orange hover:bg-brand-orange/90 hover:shadow-xl'
          }`}
        >
          {chatState.isOpen ? (
            <X className="h-6 w-6 text-white" />
          ) : (
            <MessageCircle className="h-6 w-6 text-white" />
          )}
        </Button>
      </div>

      {/* Chat Window */}
      {chatState.isOpen && (
        <div className="fixed bottom-24 right-6 w-80 h-96 z-50 animate-in slide-in-from-bottom-5 duration-300">
          <Card className="h-full flex flex-col shadow-2xl border border-gray-200">
            <CardHeader className="bg-brand-navy text-white p-4 rounded-t-lg">
              <CardTitle className="flex items-center gap-2 text-sm">
                <Headphones className="h-4 w-4" />
                Live Chat Support
                <div className="ml-auto flex items-center gap-1">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-xs">Online</span>
                </div>
              </CardTitle>
            </CardHeader>
            
            <CardContent className="flex-1 flex flex-col p-0">
              {!hasIntroduced ? (
                // Introduction Form
                <div className="flex-1 p-4 flex flex-col justify-center">
                  <div className="text-center mb-4">
                    <div className="w-12 h-12 bg-brand-orange rounded-full flex items-center justify-center mx-auto mb-2">
                      <User className="h-6 w-6 text-white" />
                    </div>
                    <h3 className="font-semibold text-brand-navy">Welcome to Resilience Solutions!</h3>
                    <p className="text-sm text-gray-600 mt-1">How can we help you today?</p>
                  </div>
                  
                  <div className="space-y-3">
                    <Input
                      placeholder="Your name *"
                      value={chatState.visitorName}
                      onChange={(e) => setChatState(prev => ({ ...prev, visitorName: e.target.value }))}
                      onKeyPress={handleKeyPress}
                      className="border-gray-300"
                    />
                    <Input
                      placeholder="Email (optional)"
                      type="email"
                      value={chatState.visitorEmail}
                      onChange={(e) => setChatState(prev => ({ ...prev, visitorEmail: e.target.value }))}
                      onKeyPress={handleKeyPress}
                      className="border-gray-300"
                    />
                    <Button
                      onClick={handleIntroSubmit}
                      disabled={!chatState.visitorName.trim()}
                      className="w-full bg-brand-orange hover:bg-brand-orange/90"
                    >
                      Start Chatting
                    </Button>
                  </div>
                </div>
              ) : (
                // Chat Interface
                <>
                  {/* Messages Area */}
                  <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-gray-50">
                    {chatState.messages.length === 0 && (
                      <div className="text-center text-gray-500 text-sm py-8">
                        <Headphones className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                        <p>Thanks for reaching out! We'll respond shortly.</p>
                        <p className="text-xs mt-1">Typical response time: under 5 minutes</p>
                      </div>
                    )}
                    
                    {chatState.messages.map((message, index) => (
                      <div
                        key={index}
                        className={`flex ${message.senderType === 'visitor' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-xs px-3 py-2 rounded-lg text-sm ${
                            message.senderType === 'visitor'
                              ? 'bg-brand-orange text-white'
                              : 'bg-white text-gray-800 border'
                          }`}
                        >
                          {message.senderType === 'admin' && (
                            <div className="text-xs text-gray-600 mb-1 font-medium">
                              Support Team
                            </div>
                          )}
                          <p>{message.message}</p>
                          <div className={`text-xs mt-1 ${
                            message.senderType === 'visitor' ? 'text-orange-100' : 'text-gray-500'
                          }`}>
                            {new Date(message.timestamp).toLocaleTimeString([], { 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            })}
                          </div>
                        </div>
                      </div>
                    ))}
                    <div ref={messagesEndRef} />
                  </div>

                  {/* Message Input */}
                  <div className="p-4 border-t bg-white">
                    <div className="flex gap-2">
                      <Input
                        placeholder="Type your message..."
                        value={currentMessage}
                        onChange={(e) => setCurrentMessage(e.target.value)}
                        onKeyPress={handleKeyPress}
                        className="flex-1"
                        disabled={sendMessageMutation.isPending}
                      />
                      <Button
                        onClick={sendMessage}
                        disabled={!currentMessage.trim() || sendMessageMutation.isPending}
                        className="bg-brand-orange hover:bg-brand-orange/90 px-3"
                      >
                        <Send className="h-4 w-4" />
                      </Button>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      We typically respond within 5 minutes during business hours.
                    </p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </>
  );
}
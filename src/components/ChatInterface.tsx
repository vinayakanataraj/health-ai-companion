
import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { geminiService, ChatMessage } from "@/services/geminiService";
import { toast } from "sonner";
import { Send, Trash, Loader2, KeyRound, ExternalLink } from "lucide-react";

const ChatInterface: React.FC = () => {
  const [messageText, setMessageText] = useState<string>("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [apiKey, setApiKey] = useState<string>("");
  const [apiKeySet, setApiKeySet] = useState<boolean>(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Load messages from history when component mounts
  useEffect(() => {
    setMessages(geminiService.getChatHistory());
    
    // Check if API key is already set in the gemini service
    setApiKeySet(geminiService.hasApiKey());
  }, []);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSendMessage = async () => {
    if (!messageText.trim()) return;
    
    // Check if API key has been set
    if (!apiKeySet && !apiKey) {
      toast.warning("Please enter your Google Gemini API key first");
      return;
    }
    
    // Set API key if needed
    if (!apiKeySet && apiKey) {
      geminiService.setApiKey(apiKey);
      setApiKeySet(true);
      toast.success("API key set successfully");
    }
    
    const trimmedMessage = messageText.trim();
    setMessageText("");
    setIsLoading(true);
    
    try {
      // Optimistically add user message to UI
      const userMessage: ChatMessage = {
        id: crypto.randomUUID(),
        content: trimmedMessage,
        role: "user",
        timestamp: new Date()
      };
      
      setMessages((prev) => [...prev, userMessage]);
      
      // Send message to Gemini API and get response
      const response = await geminiService.sendMessage(trimmedMessage);
      
      // Add AI response to UI
      const aiMessage: ChatMessage = {
        id: crypto.randomUUID(),
        content: response,
        role: "model",
        timestamp: new Date()
      };
      
      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("Failed to send message. Please try again.");
    } finally {
      setIsLoading(false);
      if (textareaRef.current) {
        textareaRef.current.focus();
      }
    }
  };

  const handleClearChat = () => {
    geminiService.clearChatHistory();
    setMessages([]);
    toast.info("Chat history cleared");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Send message on Enter (but not with Shift+Enter for new lines)
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Format the message content with proper line breaks for display
  const formatMessageContent = (content: string) => {
    return content.split('\n').map((line, i) => (
      <React.Fragment key={i}>
        {line}
        {i < content.split('\n').length - 1 && <br />}
      </React.Fragment>
    ));
  };

  return (
    <div className="flex flex-col h-full">
      {/* API Key input if not set */}
      {!apiKeySet && (
        <div className="mb-4 p-4 bg-blue-50 rounded-lg">
          <h3 className="font-medium text-sm mb-2">Enter your Google Gemini API Key</h3>
          <div className="flex gap-2 flex-col">
            <div className="flex items-center gap-2">
              <KeyRound className="h-4 w-4 text-blue-500" /> 
              <a 
                href="https://aistudio.google.com/app/apikey" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-xs text-blue-500 hover:underline flex items-center"
              >
                Get your API key from Google AI Studio <ExternalLink className="h-3 w-3 ml-1" />
              </a>
            </div>
            <div className="flex gap-2">
              <input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm"
                placeholder="Paste your API key here"
              />
              <Button onClick={() => {
                if (apiKey) {
                  geminiService.setApiKey(apiKey);
                  setApiKeySet(true);
                  toast.success("API key set successfully");
                } else {
                  toast.error("Please enter a valid API key");
                }
              }}>
                Set Key
              </Button>
            </div>
          </div>
        </div>
      )}
      
      {/* Chat messages */}
      <ScrollArea className="chat-container flex-1 px-4">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center p-6 max-w-md">
              <div className="bg-blue-100 rounded-full p-3 inline-block mb-4">
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  className="h-8 w-8 text-health-primary"
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" 
                  />
                </svg>
              </div>
              <h3 className="text-lg font-semibold mb-2">Welcome to Health Assistant</h3>
              <p className="text-muted-foreground mb-4">
                I can help you with health questions, interpret common symptoms, and provide general health advice.
              </p>
              <div className="text-sm text-left space-y-2">
                <p className="bg-gray-100 p-2 rounded-md">✓ "What are common symptoms of the flu?"</p>
                <p className="bg-gray-100 p-2 rounded-md">✓ "How can I manage my allergies during spring?"</p>
                <p className="bg-gray-100 p-2 rounded-md">✓ "What should I do for a mild headache?"</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="py-4 space-y-4">
            {messages.map((message) => (
              <div 
                key={message.id} 
                className={message.role === "user" ? "flex justify-end" : "flex justify-start"}
              >
                <div 
                  className={message.role === "user" ? "chat-message-user" : "chat-message-ai"}
                >
                  {formatMessageContent(message.content)}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="chat-message-ai flex items-center">
                  <div className="typing-indicator">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </ScrollArea>
      
      {/* Message input */}
      <div className="p-4 border-t border-border">
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="icon" 
            onClick={handleClearChat}
            title="Clear chat"
          >
            <Trash className="h-4 w-4" />
          </Button>
          <Textarea
            ref={textareaRef}
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type your health question here..."
            className="min-h-[60px] flex-1 resize-none"
            maxLength={500}
            disabled={isLoading}
          />
          <Button 
            onClick={handleSendMessage} 
            disabled={!messageText.trim() || isLoading}
            title="Send message"
          >
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </Button>
        </div>
        <div className="mt-2 text-xs text-muted-foreground text-right">
          {messageText.length}/500
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;

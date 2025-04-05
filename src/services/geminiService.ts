
import { toast } from "sonner";

// Define types for our Gemini API service
export interface GeminiRequest {
  contents: {
    parts: {
      text: string;
    }[];
    role?: string;
  }[];
  generationConfig: {
    temperature: number;
    topP: number;
    topK: number;
    maxOutputTokens: number;
  };
  safetySettings: {
    category: string;
    threshold: string;
  }[];
}

export interface GeminiResponse {
  candidates: {
    content: {
      parts: {
        text: string;
      }[];
      role: string;
    };
    finishReason: string;
    safetyRatings: {
      category: string;
      probability: string;
    }[];
  }[];
  promptFeedback: {
    safetyRatings: {
      category: string;
      probability: string;
    }[];
  };
}

export interface ChatMessage {
  id: string;
  content: string;
  role: "user" | "model";
  timestamp: Date;
}

// Use an empty string as default - this forces users to input their API key
const GEMINI_API_KEY = ""; 
// Updated API URL to use the correct model name (gemini-1.5-flash)
const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent";

// The system prompt to instruct Gemini on how to behave
const HEALTHCARE_SYSTEM_PROMPT = `
You are an AI healthcare assistant designed to provide health advice, medication suggestions, and general healthcare guidance. Follow these guidelines:

1. Always provide evidence-based information from reputable medical sources.
2. Never diagnose specific medical conditions - only provide general information.
3. For severe or concerning symptoms, always advise users to seek professional medical help.
4. Include appropriate disclaimers when giving health information.
5. Provide general health advice based on best practices from trusted organizations.
6. Only suggest over-the-counter medications for minor ailments.
7. Be transparent about your limitations as an AI system.
8. Focus on being helpful while prioritizing patient safety.
9. Maintain a professional, compassionate tone.
10. When asked about symptoms that could indicate a medical emergency, emphasize the importance of seeking immediate medical attention.
11. Do not interpret specific lab results or medical test reports with definitive conclusions.
12. Respect user privacy and remind them not to share highly personal medical details.

Most importantly, always include a disclaimer that you are not a replacement for professional medical care.
`;

class GeminiService {
  private apiKey: string;
  private apiUrl: string;
  private chatHistory: ChatMessage[];
  private systemPrompt: string;

  constructor(apiKey: string = GEMINI_API_KEY) {
    this.apiKey = apiKey;
    this.apiUrl = GEMINI_API_URL;
    this.chatHistory = [];
    this.systemPrompt = HEALTHCARE_SYSTEM_PROMPT;
  }

  // Set API key (useful if user provides their own key)
  public setApiKey(apiKey: string): void {
    this.apiKey = apiKey;
    console.log("API key set successfully");
  }

  // Get API key status (to check if key is set)
  public hasApiKey(): boolean {
    return this.apiKey !== undefined && this.apiKey.trim() !== "";
  }

  // Prepare the chat history in the format Gemini expects
  private prepareChatRequest(userMessage: string): GeminiRequest {
    const messages = [];
    
    // Add a first user message containing the system prompt 
    // This is a workaround since Gemini doesn't support system role
    messages.push({
      parts: [{ text: `${this.systemPrompt}\n\nNow, please respond to the user's question:` }],
      role: "user"
    });

    // Add the conversation history
    this.chatHistory.forEach(msg => {
      messages.push({
        parts: [{ text: msg.content }],
        role: msg.role === "user" ? "user" : "model"
      });
    });

    // Add the new user message
    messages.push({
      parts: [{ text: userMessage }],
      role: "user"
    });

    return {
      contents: messages,
      generationConfig: {
        temperature: 0.3, // Lower temperature for more conservative/factual responses
        topP: 0.8,
        topK: 40,
        maxOutputTokens: 2048
      },
      safetySettings: [
        {
          category: "HARM_CATEGORY_DANGEROUS_CONTENT",
          threshold: "BLOCK_MEDIUM_AND_ABOVE"
        },
        {
          category: "HARM_CATEGORY_HARASSMENT",
          threshold: "BLOCK_MEDIUM_AND_ABOVE"
        },
        {
          category: "HARM_CATEGORY_HATE_SPEECH",
          threshold: "BLOCK_MEDIUM_AND_ABOVE"
        },
        {
          category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
          threshold: "BLOCK_MEDIUM_AND_ABOVE"
        }
      ]
    };
  }

  // Add a new message to the chat history
  public addMessageToHistory(message: ChatMessage): void {
    this.chatHistory.push(message);
    
    // Keep history to a reasonable size (last 10 messages)
    if (this.chatHistory.length > 10) {
      this.chatHistory = this.chatHistory.slice(-10);
    }
  }

  // Get the current chat history
  public getChatHistory(): ChatMessage[] {
    return [...this.chatHistory];
  }

  // Clear the chat history
  public clearChatHistory(): void {
    this.chatHistory = [];
  }

  // Submit a message to the Gemini API
  public async sendMessage(userMessage: string): Promise<string> {
    try {
      // Validate API key is present
      if (!this.hasApiKey()) {
        throw new Error("No API key provided. Please set your Google Gemini API key first.");
      }

      // Create a unique ID for this message
      const messageId = crypto.randomUUID();
      
      // Add the user message to history
      this.addMessageToHistory({
        id: messageId,
        content: userMessage,
        role: "user",
        timestamp: new Date()
      });

      // Prepare the request to Gemini API
      const requestBody = this.prepareChatRequest(userMessage);
      console.log("Sending request to Gemini API...", this.apiUrl);
      
      const response = await fetch(`${this.apiUrl}?key=${this.apiKey}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(requestBody)
      });

      // Check for HTTP errors
      if (!response.ok) {
        const errorData = await response.json();
        console.error("Gemini API Error:", errorData);
        const errorMessage = errorData.error?.message || `API returned status ${response.status}`;
        
        // Check specifically for model availability issues
        if (errorMessage.includes("not found") || errorMessage.includes("not supported")) {
          throw new Error(`API Error: ${errorMessage}. Try using a different model like gemini-1.5-flash or gemini-1.0-pro.`);
        }
        
        throw new Error(`API Error: ${errorMessage}`);
      }

      const data: GeminiResponse = await response.json();
      console.log("Received response from Gemini API");
      
      // Check if we have valid candidates in the response
      if (!data.candidates || data.candidates.length === 0) {
        throw new Error("No response candidates returned from the API");
      }
      
      // Extract the response text
      const responseText = data.candidates[0]?.content?.parts[0]?.text || "Sorry, I couldn't generate a response.";
      
      // Add the AI response to history
      this.addMessageToHistory({
        id: crypto.randomUUID(),
        content: responseText,
        role: "model",
        timestamp: new Date()
      });

      return responseText;
    } catch (error) {
      console.error("Error calling Gemini API:", error);
      // Show more detailed error message to the user
      let errorMessage = "Failed to get a response. ";
      
      if (error instanceof Error) {
        // Include the actual error message for better debugging
        toast.error(`${errorMessage} ${error.message}`);
        return `I'm having trouble connecting to my knowledge base right now: ${error.message}. Please check your API key and try again.`;
      } else {
        toast.error(errorMessage + "Please try again later.");
        return "I'm having trouble connecting to my knowledge base right now. Please try again in a moment.";
      }
    }
  }
}

// Export a singleton instance
export const geminiService = new GeminiService();
export default GeminiService;

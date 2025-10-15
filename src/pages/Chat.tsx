import { useState, useEffect, useRef } from 'react';
import { Send, Sparkles } from 'lucide-react';
import { ChatMessage, User } from '../types';
import { storage } from '../utils/storage';

interface ChatProps {
  user: User;
}

export default function Chat({ user }: ChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadMessages();
  }, [user.id]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadMessages = () => {
    const chatMessages = storage.getChatMessages(user.id);
    if (chatMessages.length === 0) {
      const welcomeMessage: ChatMessage = {
        id: crypto.randomUUID(),
        userId: user.id,
        role: 'assistant',
        content: `Hi ${user.username}, I'm Bloom, your emotional wellness companion. I'm here to listen and support you. How are you feeling today?`,
        createdAt: new Date().toISOString(),
      };
      storage.addChatMessage(welcomeMessage);
      setMessages([welcomeMessage]);
    } else {
      setMessages(chatMessages);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const generateBloomResponse = (userMessage: string): string => {
    const lowerMessage = userMessage.toLowerCase();

    const responses = {
      sad: [
        "I hear you. It sounds like today has been quite intense — would you like to tell me more?",
        "It's okay to feel this way. Your emotions are valid, and I'm here to listen without judgment.",
        "Thank you for sharing that with me. Sometimes just expressing how we feel can bring a bit of relief.",
      ],
      anxious: [
        "Anxiety can feel overwhelming. Let's take this one step at a time. What's weighing on your mind right now?",
        "It's completely normal to feel anxious. Would it help to talk through what's making you feel this way?",
        "I'm here with you. Remember, every feeling passes, even the difficult ones.",
      ],
      happy: [
        "That's wonderful to hear! What's bringing you joy today?",
        "I'm so glad you're feeling good. These moments are precious — savor them!",
        "Your positive energy is beautiful. Keep nurturing what makes you feel this way.",
      ],
      tired: [
        "It sounds like you've been carrying a lot. Rest is not a luxury, it's a necessity.",
        "Your body and mind are asking for care. What would help you feel more rested?",
        "Being tired is your system's way of telling you it needs attention. Listen to it.",
      ],
      default: [
        "I appreciate you sharing that with me. Every step you take to understand your feelings is a form of courage.",
        "Thank you for opening up. How does it feel to express these thoughts?",
        "I'm listening. Would you like to explore this feeling a bit more?",
        "That must be a lot to carry. You're doing your best, and that's what matters.",
        "Your awareness of your emotions shows real strength. Keep being honest with yourself.",
      ],
    };

    if (lowerMessage.includes('sad') || lowerMessage.includes('down') || lowerMessage.includes('depressed')) {
      return responses.sad[Math.floor(Math.random() * responses.sad.length)];
    }
    if (lowerMessage.includes('anxious') || lowerMessage.includes('worried') || lowerMessage.includes('stress')) {
      return responses.anxious[Math.floor(Math.random() * responses.anxious.length)];
    }
    if (lowerMessage.includes('happy') || lowerMessage.includes('good') || lowerMessage.includes('great')) {
      return responses.happy[Math.floor(Math.random() * responses.happy.length)];
    }
    if (lowerMessage.includes('tired') || lowerMessage.includes('exhausted') || lowerMessage.includes('drained')) {
      return responses.tired[Math.floor(Math.random() * responses.tired.length)];
    }

    return responses.default[Math.floor(Math.random() * responses.default.length)];
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      userId: user.id,
      role: 'user',
      content: input.trim(),
      createdAt: new Date().toISOString(),
    };

    storage.addChatMessage(userMessage);
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    setTimeout(() => {
      const bloomResponse = generateBloomResponse(input);
      const assistantMessage: ChatMessage = {
        id: crypto.randomUUID(),
        userId: user.id,
        role: 'assistant',
        content: bloomResponse,
        createdAt: new Date().toISOString(),
      };

      storage.addChatMessage(assistantMessage);
      setMessages((prev) => [...prev, assistantMessage]);
      setIsTyping(false);
    }, 1000 + Math.random() * 1000);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-pink-50 pb-32 flex flex-col">
      <div className="bg-white shadow-sm border-b border-gray-200 p-4">
        <div className="max-w-2xl mx-auto flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-blue-400 rounded-full flex items-center justify-center">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-gray-800">Bloom</h1>
            <p className="text-sm text-gray-600">Your AI Companion</p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-6">
        <div className="max-w-2xl mx-auto space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] px-5 py-3 rounded-3xl ${
                  message.role === 'user'
                    ? 'bg-gradient-to-r from-green-400 to-green-500 text-white'
                    : 'bg-white shadow-md text-gray-800'
                }`}
              >
                <p className="text-sm leading-relaxed">{message.content}</p>
                <p
                  className={`text-xs mt-2 ${
                    message.role === 'user' ? 'text-green-100' : 'text-gray-500'
                  }`}
                >
                  {new Date(message.createdAt).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-white shadow-md px-5 py-3 rounded-3xl">
                <div className="flex gap-2">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      <div className="fixed bottom-20 left-0 right-0 bg-white border-t border-gray-200 p-4">
        <div className="max-w-2xl mx-auto flex gap-3">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Share your thoughts with Bloom..."
            className="flex-1 px-4 py-3 rounded-2xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-400 resize-none"
            rows={1}
            style={{ minHeight: '48px', maxHeight: '120px' }}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim()}
            className="bg-gradient-to-r from-green-400 to-green-500 text-white px-6 rounded-2xl hover:from-green-500 hover:to-green-600 transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}

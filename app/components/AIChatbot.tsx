'use client';
import { useState, useRef, useEffect } from 'react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export default function AIChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: 'Hello! I\'m here to help you find the perfect products. Ask me anything about our food items, household products, or delivery!' }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const quickQuestions = [
    "What hot meals do you have?",
    "Do you have ice cream?",
    "What are your delivery times?",
    "Tell me about your rewards program"
  ];

  const getAIResponse = (userMessage: string): string => {
    const lowerMessage = userMessage.toLowerCase();
    
    // Product queries
    if (lowerMessage.includes('hot meal') || lowerMessage.includes('food')) {
      return "We have delicious hot meals including Chips Masala, Pilau, Biriyani, Viazi Karai, and Chapati! All freshly prepared. Would you like to see our full menu?";
    }
    if (lowerMessage.includes('ice cream')) {
      return "Yes! We have Vanilla Ice Cream 500ml and many other flavors. Perfect for a sweet treat! 🍦";
    }
    if (lowerMessage.includes('pizza')) {
      return "Our Margherita Pizza (Medium) is very popular! Fresh and delicious. We also have other varieties in the Cakes & Pizza category.";
    }
    if (lowerMessage.includes('plastic') || lowerMessage.includes('household')) {
      return "We offer quality household items including buckets, chairs, brooms, spoons sets, and baby potties. All durable and affordable!";
    }
    
    // Delivery & Services
    if (lowerMessage.includes('delivery')) {
      return "We offer FREE delivery on all orders! 🚚 We typically deliver within 2-4 hours. You can also choose pick-up if you prefer.";
    }
    if (lowerMessage.includes('reward') || lowerMessage.includes('receipt')) {
      return "Keep your receipts! Bring them back and earn rewards and exclusive discounts. The more you shop, the more you save! 🎁";
    }
    if (lowerMessage.includes('payment') || lowerMessage.includes('pay')) {
      return "We accept multiple payment methods including M-Pesa, Cash on Delivery, and card payments. Very convenient!";
    }
    if (lowerMessage.includes('price') || lowerMessage.includes('cheap') || lowerMessage.includes('affordable')) {
      return "We guarantee the best prices in town! All our products are competitively priced with no hidden fees. Plus free delivery!";
    }
    
    // General
    if (lowerMessage.includes('hello') || lowerMessage.includes('hi')) {
      return "Hello! How can I help you today? Feel free to ask about our products, delivery, or anything else!";
    }
    if (lowerMessage.includes('thank')) {
      return "You're welcome! Happy to help. Is there anything else you'd like to know?";
    }
    
    // Default response
    return "I'd be happy to help! You can ask me about our products, delivery times, pricing, or our rewards program. What would you like to know?";
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsTyping(true);

    // Simulate AI thinking
    setTimeout(() => {
      const response = getAIResponse(userMessage);
      setMessages(prev => [...prev, { role: 'assistant', content: response }]);
      setIsTyping(false);
    }, 800);
  };

  return (
    <>
      {/* Chat Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-50 bg-brand-primary text-white p-4 rounded-full shadow-2xl hover:bg-brand-secondary transition-all hover:scale-110"
      >
        {isOpen ? (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <div className="relative">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center animate-pulse">
              AI
            </span>
          </div>
        )}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 z-50 w-96 max-w-[calc(100vw-3rem)] bg-white rounded-2xl shadow-2xl border border-brand-accent/30 flex flex-col max-h-[600px]">
          {/* Header */}
          <div className="bg-gradient-to-r from-brand-primary to-brand-secondary text-white p-4 rounded-t-2xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <div className="font-bold">AI Shopping Assistant</div>
                <div className="text-xs text-white/80">Online • Instant replies</div>
              </div>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-brand-light">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] p-3 rounded-2xl ${
                  msg.role === 'user' 
                    ? 'bg-brand-primary text-white rounded-br-none' 
                    : 'bg-white text-brand-dark rounded-bl-none shadow-sm'
                }`}>
                  {msg.content}
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-white p-3 rounded-2xl rounded-bl-none shadow-sm">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 bg-brand-secondary rounded-full animate-bounce"></span>
                    <span className="w-2 h-2 bg-brand-secondary rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></span>
                    <span className="w-2 h-2 bg-brand-secondary rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Questions */}
          {messages.length === 1 && (
            <div className="px-4 py-2 border-t border-brand-accent/20 bg-white">
              <div className="text-xs text-brand-secondary mb-2">Quick questions:</div>
              <div className="flex flex-wrap gap-2">
                {quickQuestions.map((q, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setInput(q);
                      handleSend();
                    }}
                    className="text-xs px-3 py-1.5 bg-brand-light border border-brand-accent/30 rounded-full hover:bg-brand-accent/20 transition-colors"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input */}
          <div className="p-4 border-t border-brand-accent/20 bg-white rounded-b-2xl">
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Ask me anything..."
                className="flex-1 px-4 py-2 border border-brand-accent/30 rounded-xl focus:outline-none focus:border-brand-primary"
              />
              <button
                onClick={handleSend}
                className="px-4 py-2 bg-brand-primary text-white rounded-xl hover:bg-brand-secondary transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

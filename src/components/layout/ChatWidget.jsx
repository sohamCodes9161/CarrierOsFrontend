import { useState, useRef, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import {api} from '../../services/api/client.js'; // Adjust if your api instance is exported differently
import Icon from '../ui/Icon.jsx';
import { cn } from '../../utils/cn.js';

export default function ChatWidget() {
  const { user } = useAuth();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'assistant', content: `Hi ${user?.name?.split(' ')[0] || 'there'}! I'm your CareerOS AI Mentor. Ask me any coding, resume, or career questions!` }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  async function handleSend(e) {
    e?.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = { role: 'user', content: input.trim() };
    const updatedMessages = [...messages, userMessage];
    
    setMessages(updatedMessages);
    setInput('');
    setIsLoading(true);

    try {
      // Send the request with the context of where the user is
      const response = await api.post('/chat', {
        messages: updatedMessages.filter(m => m.role !== 'system'), // Send only user/assistant history
        context: {
          userName: user?.name,
          page: location.pathname
        }
      });

      const aiReply = response.data?.data?.reply || response.data?.reply;
      if (aiReply) {
        setMessages(prev => [...prev, aiReply]);
      }
    } catch (error) {
      console.error('Chat error:', error);
      // If rate limited, show the error message in the chat!
      const errorMsg = error.response?.data?.message || 'Sorry, I ran into an issue connecting to the server.';
      setMessages(prev => [...prev, { role: 'assistant', content: `⚠️ ${errorMsg}` }]);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      
      {/* Chat Window */}
      {isOpen && (
        <div className="mb-4 flex h-[450px] w-[350px] flex-col overflow-hidden rounded-2xl border border-base-300 bg-surface-1 shadow-2xl transition-all sm:w-[400px]">
          
          {/* Header */}
          <div className="flex items-center justify-between border-b border-base-300 bg-surface-2 px-4 py-3">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/20 text-primary">
                <Icon name="sparkles" className="h-4 w-4" />
              </div>
              <span className="font-semibold text-white">CareerOS Mentor</span>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-muted hover:text-white transition-colors">
              <Icon name="x" className="h-5 w-5" />
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-surface-1">
            {messages.map((msg, idx) => (
              <div key={idx} className={cn("flex w-full", msg.role === 'user' ? "justify-end" : "justify-start")}>
                <div className={cn(
                  "max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed",
                  msg.role === 'user' 
                    ? "bg-primary text-primary-content rounded-tr-sm" 
                    : "bg-surface-3 border border-base-300 text-base-content rounded-tl-sm whitespace-pre-wrap"
                )}>
                  {msg.content}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex w-full justify-start">
                <div className="bg-surface-3 border border-base-300 rounded-2xl rounded-tl-sm px-4 py-3">
                  <span className="loading loading-dots loading-sm text-muted"></span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <form onSubmit={handleSend} className="border-t border-base-300 bg-surface-2 p-3">
            <div className="relative flex items-center">
              <input
                type="text"
                placeholder="Ask a technical or career question..."
                className="w-full rounded-full border border-base-300 bg-surface-1 pl-4 pr-12 py-2.5 text-sm text-white placeholder:text-muted focus:border-primary focus:outline-none"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                disabled={isLoading}
              />
              <button 
                type="submit" 
                disabled={!input.trim() || isLoading}
                className="absolute right-2 flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-content transition-transform hover:scale-105 disabled:opacity-50 disabled:hover:scale-100"
              >
                <Icon name="arrow-up" className="h-4 w-4" />
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Floating Action Button (FAB) */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-content shadow-pop shadow-primary/25 transition-transform hover:scale-110 active:scale-95"
      >
        <Icon name={isOpen ? "x" : "sparkles"} className="h-6 w-6" />
      </button>
    </div>
  );
}
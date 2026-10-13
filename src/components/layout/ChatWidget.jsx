import { useState, useRef, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import api from '../../services/api/client.js';
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

  // Auto-scroll to bottom
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
      const response = await api.post('/chat', {
        messages: updatedMessages.filter(m => m.role !== 'system'),
        context: {
          userName: user?.name,
          page: location.pathname
        }
      });

      // Safely extract just the string content, handling both object replies or raw strings
      const rawReply = response.data?.data?.reply || response.data?.reply;
      const contentString = typeof rawReply === 'object' ? rawReply?.content : rawReply;

      if (contentString) {
        setMessages(prev => [...prev, { role: 'assistant', content: contentString }]);
      }
    } catch (error) {
      console.error('Chat error:', error);
      const errorMsg = error.response?.data?.message || 'Sorry, I ran into an issue connecting to the server.';
      setMessages(prev => [...prev, { role: 'assistant', content: `⚠️ ${errorMsg}` }]);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      
      {/* Premium Glass-Morphism Chat Window */}
      {isOpen && (
        <div className="mb-4 flex h-[520px] w-[360px] flex-col overflow-hidden rounded-[24px] border border-white/10 bg-[#0d0d0d]/95 shadow-[0_12px_40px_rgba(0,0,0,0.6)] backdrop-blur-xl transition-all sm:w-[400px]">
          
          {/* Header */}
          <div className="flex items-center justify-between border-b border-white/10 bg-white/[0.03] px-5 py-4">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary/20 text-primary shadow-inner">
                <Icon name="sparkles" className="h-4 w-4" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-white tracking-wide">CareerOS Mentor</h3>
                <p className="text-[10px] text-emerald-400 flex items-center gap-1.5 font-medium">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  Online & Context-Aware
                </p>
              </div>
            </div>
            <button 
              onClick={() => setIsOpen(false)} 
              className="rounded-lg p-1.5 text-muted hover:bg-white/10 hover:text-white transition-colors"
            >
              <Icon name="x" className="h-4 w-4" />
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
            {messages.map((msg, idx) => (
              <div key={idx} className={cn("flex w-full", msg.role === 'user' ? "justify-end" : "justify-start")}>
                <div className={cn(
                  "max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm",
                  msg.role === 'user' 
                    ? "bg-primary text-primary-content rounded-br-xs font-normal" 
                    : "bg-white/[0.06] border border-white/10 text-gray-200 rounded-bl-xs whitespace-pre-wrap"
                )}>
                  {msg.content}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex w-full justify-start">
                <div className="bg-white/[0.06] border border-white/10 rounded-2xl rounded-bl-xs px-4 py-3">
                  <div className="flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-primary animate-bounce"></span>
                    <span className="h-1.5 w-1.5 rounded-full bg-primary animate-bounce [animation-delay:0.2s]"></span>
                    <span className="h-1.5 w-1.5 rounded-full bg-primary animate-bounce [animation-delay:0.4s]"></span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <form onSubmit={handleSend} className="border-t border-white/10 bg-white/[0.02] p-3">
            <div className="relative flex items-center">
              <input
                type="text"
                placeholder="Ask coding or career questions..."
                className="w-full rounded-full border border-white/10 bg-black/40 pl-4 pr-12 py-3 text-sm text-white placeholder:text-muted/70 focus:border-primary focus:bg-black/60 focus:outline-none transition-all shadow-inner"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                disabled={isLoading}
              />
              <button 
                type="submit" 
                disabled={!input.trim() || isLoading}
                className="absolute right-1.5 flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-content shadow-md transition-all hover:scale-105 active:scale-95 disabled:opacity-40 disabled:hover:scale-100"
              >
                <Icon name="arrow-up" className="h-4 w-4" />
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Floating Action Button (FAB) with Glow Effect */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="group relative flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-content shadow-[0_0_25px_rgba(var(--primary),0.4)] transition-all duration-300 hover:scale-105 hover:shadow-[0_0_35px_rgba(var(--primary),0.6)] active:scale-95"
      >
        <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-emerald-500 ring-2 ring-[#0d0d0d]"></span>
        <Icon name={isOpen ? "x" : "sparkles"} className="h-6 w-6 transition-transform duration-300 group-hover:rotate-12" />
      </button>
    </div>
  );
}
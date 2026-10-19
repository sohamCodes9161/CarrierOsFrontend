import { useState, useRef, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { api } from '../../services/api/client.js';
import Icon from '../ui/Icon.jsx';
import { cn } from '../../utils/cn.js';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

// Helper component for Code Blocks with Copy button
function CodeBlock({ children }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    const codeText = children?.props?.children || children;
    const textToCopy = typeof codeText === 'string' ? codeText : String(codeText);

    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative group my-3 rounded-xl border border-white/10 bg-black/80 overflow-hidden">
      <div className="flex items-center justify-between bg-white/5 px-3 py-1.5 border-b border-white/10 text-[10px] font-mono text-muted">
        <span>code</span>
        <button
          type="button"
          onClick={handleCopy}
          className="flex items-center gap-1 text-[10px] text-muted hover:text-white transition-colors bg-white/10 px-2 py-0.5 rounded-md"
        >
          <Icon name={copied ? 'check' : 'copy'} className="h-3 w-3" />
          {copied ? 'Copied!' : 'Copy'}
        </button>
      </div>
      <pre className="p-3 max-w-full overflow-x-auto font-mono text-xs text-emerald-400 custom-scrollbar leading-relaxed">
        {children}
      </pre>
    </div>
  );
}

export default function ChatWidget() {
  const { user } = useAuth();
  const location = useLocation();

  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: `Hi ${
        user?.name?.split(' ')[0] || 'there'
      }! I'm your CareerOS AI Mentor. Ask me any coding, resume, or career questions!`,
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: 'smooth',
    });
  }, [messages, isOpen]);

  async function handleSend(e) {
    e?.preventDefault();

    const messageText = input.trim();
    if (!messageText || isLoading) return;

    const userMessage = {
      role: 'user',
      content: messageText,
    };

    const updatedMessages = [...messages, userMessage];

    setMessages(updatedMessages);
    setInput('');
    setIsLoading(true);

    try {
      const response = await api.post('/chat', {
        messages: updatedMessages
          .filter((message) => message.role !== 'system')
          .map(({ role, content }) => ({ role, content })),

        context: {
          userName: user?.name,
          page: location.pathname,
        },
      });

      const rawReply = response?.reply;
      let textContent = '';

      if (typeof rawReply === 'string') {
        textContent = rawReply;
      } else if (rawReply && typeof rawReply === 'object') {
        if (typeof rawReply.content === 'string') {
          textContent = rawReply.content;
        } else if (typeof rawReply.message === 'string') {
          textContent = rawReply.message;
        }
      }

      if (textContent.trim()) {
        setMessages((previousMessages) => [
          ...previousMessages,
          {
            role: 'assistant',
            content: textContent,
          },
        ]);
      } else {
        setMessages((previousMessages) => [
          ...previousMessages,
          {
            role: 'assistant',
            content:
              '⚠️ The AI returned an empty or unexpected response. Please try again.',
          },
        ]);
      }
    } catch (error) {
      const errorMessage =
        error?.message ||
        'Sorry, I ran into an issue connecting to the server.';

      setMessages((previousMessages) => [
        ...previousMessages,
        {
          role: 'assistant',
          content: `⚠️ ${errorMessage}`,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  }

  // Custom Markdown Renderers with formatted tables and copy button
  const MarkdownComponents = {
    p({ children }) {
      return <p className="mb-2 last:mb-0 leading-relaxed">{children}</p>;
    },
    pre({ children }) {
      return <CodeBlock>{children}</CodeBlock>;
    },
    code({ inline, className, children, ...props }) {
      if (inline) {
        return (
          <code
            className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-xs text-primary"
            {...props}
          >
            {children}
          </code>
        );
      }
      return <code className="font-mono text-xs" {...props}>{children}</code>;
    },
    table({ children }) {
      return (
        <div className="my-3 max-w-full overflow-x-auto rounded-xl border border-white/15 bg-black/40">
          <table className="w-full text-left text-xs text-gray-200 border-collapse">
            {children}
          </table>
        </div>
      );
    },
    thead({ children }) {
      return <thead className="bg-white/10 text-white font-semibold">{children}</thead>;
    },
    tbody({ children }) {
      return <tbody className="divide-y divide-white/10">{children}</tbody>;
    },
    tr({ children }) {
      return <tr className="hover:bg-white/5 transition-colors">{children}</tr>;
    },
    th({ children }) {
      return <th className="p-2.5 font-semibold text-white border-b border-white/15 whitespace-nowrap">{children}</th>;
    },
    td({ children }) {
      return <td className="p-2.5 text-gray-300">{children}</td>;
    },
    ul({ children }) {
      return <ul className="mb-2 list-disc pl-4 space-y-1">{children}</ul>;
    },
    ol({ children }) {
      return <ol className="mb-2 list-decimal pl-4 space-y-1">{children}</ol>;
    },
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {/* Chat window */}
      {isOpen && (
        <div className="mb-4 flex h-[520px] w-[360px] flex-col overflow-hidden rounded-[24px] border border-white/10 bg-[#0d0d0d]/95 shadow-[0_12px_40px_rgba(0,0,0,0.6)] backdrop-blur-xl transition-all sm:w-[420px]">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-white/10 bg-white/[0.03] px-5 py-4">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary/20 text-primary shadow-inner">
                <Icon name="sparkles" className="h-4 w-4" />
              </div>

              <div>
                <h3 className="text-sm font-semibold tracking-wide text-white">
                  CareerOS Mentor
                </h3>

                <p className="flex items-center gap-1.5 text-[10px] font-medium text-emerald-400">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
                  Online & Context-Aware
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsOpen(false)}
              aria-label="Close chat"
              className="rounded-lg p-1.5 text-muted transition-colors hover:bg-white/15 hover:text-white"
            >
              <Icon name="x" className="h-4 w-4" />
            </button>
          </div>

          {/* Messages */}
          <div className="custom-scrollbar flex-1 space-y-4 overflow-y-auto p-4">
            {messages.map((message, index) => (
              <div
                key={index}
                className={cn(
                  'flex w-full',
                  message.role === 'user' ? 'justify-end' : 'justify-start'
                )}
              >
                <div
                  className={cn(
                    'max-w-[88%] rounded-2xl px-4 py-3 text-sm shadow-sm break-words overflow-hidden',
                    message.role === 'user'
                      ? 'rounded-br-xs bg-primary font-normal text-primary-content'
                      : 'rounded-bl-xs border border-white/10 bg-white/[0.06] text-gray-200'
                  )}
                >
                  {typeof message.content === 'string' ? (
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      components={MarkdownComponents}
                    >
                      {message.content}
                    </ReactMarkdown>
                  ) : (
                    JSON.stringify(message.content)
                  )}
                </div>
              </div>
            ))}

            {/* Loading indicator */}
            {isLoading && (
              <div className="flex w-full justify-start">
                <div className="rounded-2xl rounded-bl-xs border border-white/10 bg-white/[0.06] px-4 py-3">
                  <div className="flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-primary" />
                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-primary [animation-delay:0.2s]" />
                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-primary [animation-delay:0.4s]" />
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <form
            onSubmit={handleSend}
            className="border-t border-white/10 bg-white/[0.02] p-3"
          >
            <div className="relative flex items-center">
              <input
                type="text"
                placeholder="Ask coding or career questions..."
                className="w-full rounded-full border border-white/10 bg-black/40 py-3 pl-4 pr-12 text-sm text-white shadow-inner transition-all placeholder:text-muted/70 focus:border-primary focus:bg-black/60 focus:outline-none"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                disabled={isLoading}
              />

              <button
                type="submit"
                aria-label="Send message"
                disabled={!input.trim() || isLoading}
                className="absolute right-1.5 flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-content shadow-md transition-all hover:scale-105 active:scale-95 disabled:opacity-40 disabled:hover:scale-100"
              >
                <Icon name="arrow-up" className="h-4 w-4" />
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Floating chat button */}
      <button
        type="button"
        onClick={() => setIsOpen((previous) => !previous)}
        aria-label={isOpen ? 'Close chat' : 'Open chat'}
        aria-expanded={isOpen}
        className="group relative flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-content shadow-[0_0_25px_rgba(var(--primary),0.4)] transition-all duration-300 hover:scale-105 hover:shadow-[0_0_35px_rgba(var(--primary),0.6)] active:scale-95"
      >
        <span className="absolute -right-1 -top-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-emerald-500 ring-2 ring-[#0d0d0d]" />

        <Icon
          name={isOpen ? 'x' : 'sparkles'}
          className="h-6 w-6 transition-transform duration-300 group-hover:rotate-12"
        />
      </button>
    </div>
  );
}
import { useState, useRef, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { api } from '../../services/api/client.js';
import Icon from '../ui/Icon.jsx';
import { cn } from '../../utils/cn.js';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';

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
    <div className="relative group my-3 rounded-xl border border-base-content/10 bg-base-200 overflow-hidden">
      <div className="flex items-center justify-between bg-base-content/5 px-3 py-1.5 border-b border-base-content/10 text-[10px] font-mono text-muted">
        <span>code</span>
        <button
          type="button"
          onClick={handleCopy}
          className="flex items-center gap-1 text-[10px] text-muted hover:text-base-content transition-colors bg-base-content/10 px-2 py-0.5 rounded-md"
        >
          <Icon name={copied ? 'check' : 'copy'} className="h-3 w-3" />
          {copied ? 'Copied!' : 'Copy'}
        </button>
      </div>
      {/* UPDATED: Changed text-base-content to text-success for dynamic green code */}
    <pre className="p-3 max-w-full overflow-x-auto font-mono text-xs text-warning custom-scrollbar leading-relaxed">
        {children}
      </pre>
    </div>
  );
}

function TableBlock({ children }) {
  const [copied, setCopied] = useState(false);
  const tableRef = useRef(null);

  const handleCopy = () => {
    if (tableRef.current) {
      navigator.clipboard.writeText(tableRef.current.innerText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="relative group my-3 max-w-full overflow-hidden rounded-xl border border-base-content/15 bg-base-200">
      <div className="flex items-center justify-between bg-base-content/5 px-3 py-1.5 border-b border-base-content/10 text-[10px] font-mono text-muted">
        <span>table</span>
        <button
          type="button"
          onClick={handleCopy}
          className="flex items-center gap-1 text-[10px] text-muted hover:text-base-content transition-colors bg-base-content/10 px-2 py-0.5 rounded-md"
        >
          <Icon name={copied ? 'check' : 'copy'} className="h-3 w-3" />
          {copied ? 'Copied!' : 'Copy'}
        </button>
      </div>
      <div className="overflow-x-auto custom-scrollbar" ref={tableRef}>
        <table className="w-full text-left text-xs text-base-content border-collapse">
          {children}
        </table>
      </div>
    </div>
  );
}

function MessageCopyButton({ content }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="mt-3 flex justify-end border-t border-base-content/10 pt-2">
      <button
        type="button"
        onClick={handleCopy}
        className="flex items-center gap-1.5 text-[10px] font-medium text-muted hover:text-base-content transition-colors"
      >
        <Icon name={copied ? 'check' : 'copy'} className="h-3 w-3" />
        {copied ? 'Full response copied!' : 'Copy full response'}
      </button>
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
            className="rounded bg-base-content/10 px-1.5 py-0.5 font-mono text-xs text-warning"
            {...props}
          >
            {children}
          </code>
        );
      }
      return <code className="font-mono text-xs text-warning" {...props}>{children}</code>;
    },
    table({ children }) {
      return <TableBlock>{children}</TableBlock>;
    },
    thead({ children }) {
      return <thead className="bg-base-content/10 text-base-content font-semibold">{children}</thead>;
    },
    tbody({ children }) {
      return <tbody className="divide-y divide-base-content/10">{children}</tbody>;
    },
    tr({ children }) {
      return <tr className="hover:bg-base-content/5 transition-colors">{children}</tr>;
    },
    th({ children }) {
      return <th className="p-2.5 font-semibold text-base-content border-b border-base-content/15 whitespace-nowrap">{children}</th>;
    },
    td({ children }) {
      return <td className="p-2.5 text-base-content/80 align-top">{children}</td>;
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
      {isOpen && (
        <div className="mb-4 flex h-[520px] w-[360px] flex-col overflow-hidden rounded-[24px] border border-base-content/10 bg-base-100/95 shadow-pop backdrop-blur-xl transition-all sm:w-[420px]">
          <div className="flex items-center justify-between border-b border-base-content/10 bg-base-content/5 px-5 py-4">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary/20 text-primary shadow-inner">
                <Icon name="sparkles" className="h-4 w-4" />
              </div>
              <div>
                <h3 className="text-sm font-semibold tracking-wide text-base-content">
                  CareerOS Mentor
                </h3>
                <p className="flex items-center gap-1.5 text-[10px] font-medium text-success">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-success" />
                  Online & Context-Aware
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="rounded-lg p-1.5 text-muted transition-colors hover:bg-base-content/15 hover:text-base-content"
            >
              <Icon name="x" className="h-4 w-4" />
            </button>
          </div>

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
                    'max-w-[90%] rounded-2xl px-4 py-3 text-sm shadow-sm break-words overflow-hidden',
                    message.role === 'user'
                      ? 'rounded-br-xs bg-primary font-normal text-primary-content'
                      : 'rounded-bl-xs border border-base-content/10 bg-base-content/5 text-base-content/90'
                  )}
                >
                  {typeof message.content === 'string' ? (
                    <>
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        rehypePlugins={[rehypeRaw]}
                        components={MarkdownComponents}
                      >
                        {message.content}
                      </ReactMarkdown>
                      
                      {message.role === 'assistant' && (
                        <MessageCopyButton content={message.content} />
                      )}
                    </>
                  ) : (
                    JSON.stringify(message.content)
                  )}
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex w-full justify-start">
                <div className="rounded-2xl rounded-bl-xs border border-base-content/10 bg-base-content/5 px-4 py-3">
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

          <form onSubmit={handleSend} className="border-t border-base-content/10 bg-base-content/5 p-3">
            <div className="relative flex items-center">
              <input
                type="text"
                placeholder="Ask coding or career questions..."
                className="w-full rounded-full border border-base-content/10 bg-base-200 py-3 pl-4 pr-12 text-sm text-base-content shadow-inner transition-all placeholder:text-muted focus:border-primary focus:bg-base-100 focus:outline-none"
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

      <button
        type="button"
        onClick={() => setIsOpen((previous) => !previous)}
        className="group relative flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-content shadow-[0_0_25px_rgba(var(--primary),0.4)] transition-all duration-300 hover:scale-105 hover:shadow-[0_0_35px_rgba(var(--primary),0.6)] active:scale-95"
      >
        <span className="absolute -right-1 -top-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-success ring-2 ring-page" />
        <Icon
          name={isOpen ? 'x' : 'sparkles'}
          className="h-6 w-6 transition-transform duration-300 group-hover:rotate-12"
        />
      </button>
    </div>
  );
}
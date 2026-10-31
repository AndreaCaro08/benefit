
import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Bot } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import ReactMarkdown from 'react-markdown';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const Chatbot = () => {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content:
        "Hello! I'm your Serve Sahayak assistant.\n\nI can help you browse scheme records and manage your document wallet. Draft records may not have verified eligibility or document requirements.",
    },
  ]);
  const [input, setInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, open]);

  const getReply = (text: string) => {
    const lower = text.toLowerCase();

    if (lower.includes('pudhumai') || lower.includes('women') || lower.includes('education')) {
      return 'The scheme record is currently a draft. Its eligibility, benefits, and required documents have not been verified for matching yet. Open the record and check its official source before acting.';
    }

    if (lower.includes('health') || lower.includes('medical')) {
      return 'Health scheme eligibility and document requirements are not verified in the current catalogue. Please check the official scheme source; this app will not guess required documents.';
    }

    if (lower.includes('document') || lower.includes('wallet') || lower.includes('aadhaar')) {
      return 'Upload only the files requested by an official scheme source. Files in your wallet are stored for your use; this app does not submit them to a government department.';
    }

    if (lower.includes('apply') || lower.includes('scheme')) {
      return 'Explore schemes to review published eligibility rules and compare them with your profile and wallet documents. Use the official source or application link on each scheme record to apply.';
    }

    if (lower.includes('housing') || lower.includes('home')) {
      return 'Housing scheme requirements are not verified in the current catalogue. Review the official source for eligibility and document details.';
    }

    return 'I can help you browse scheme records and manage wallet documents. Compare only published criteria, and confirm draft or unverified information through its official source.';
  };

  const send = () => {
    if (!input.trim()) return;
    const userMsg: Message = { role: 'user', content: input.trim() };
    const nextMessages = [...messages, userMsg];
    setMessages(nextMessages);
    setInput('');

    setTimeout(() => {
      setMessages((current) => [...current, { role: 'assistant', content: getReply(userMsg.content) }]);
    }, 180);
  };

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-6 left-6 z-50 w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-secondary text-primary-foreground shadow-elevated flex items-center justify-center hover:scale-105 transition-transform"
      >
        <MessageCircle className="w-7 h-7" />
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 left-6 z-50 w-[380px] max-w-[calc(100vw-2rem)] h-[520px] bg-card rounded-2xl shadow-elevated border flex flex-col overflow-hidden">
      <div className="flex items-center justify-between p-4 bg-gradient-primary">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-primary-foreground/10 flex items-center justify-center">
            <Bot className="w-4 h-4 text-primary-foreground" />
          </div>
          <div>
            <h3 className="font-bold text-primary-foreground text-sm font-display">Benefit Assistant</h3>
            <p className="text-primary-foreground/60 text-[10px]">Local guidance</p>
          </div>
        </div>
        <button onClick={() => setOpen(false)} className="text-primary-foreground/50 hover:text-primary-foreground transition-colors">
          <X className="w-5 h-5" />
        </button>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((msg, index) => (
          <div key={`${msg.role}-${index}`} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm ${msg.role === 'user' ? 'bg-primary text-primary-foreground rounded-br-md' : 'bg-muted text-foreground rounded-bl-md'}`}>
              {msg.role === 'assistant' ? (
                <div className="prose prose-sm max-w-none [&>p]:m-0 [&>ul]:m-0 [&>ul]:pl-4">
                  <ReactMarkdown>{msg.content}</ReactMarkdown>
                </div>
              ) : (
                msg.content
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="p-3 border-t bg-card">
        <form
          onSubmit={(event) => {
            event.preventDefault();
            send();
          }}
          className="flex gap-2"
        >
          <Input value={input} onChange={(event) => setInput(event.target.value)} placeholder="Ask about schemes..." className="flex-1 rounded-xl border-0 bg-muted h-10" />
          <Button type="submit" size="icon" disabled={!input.trim()} className="rounded-xl h-10 w-10">
            <Send className="w-4 h-4" />
          </Button>
        </form>
      </div>
    </div>
  );
};

export default Chatbot;

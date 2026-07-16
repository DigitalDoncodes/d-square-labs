import { useState, useRef, useEffect, useCallback } from 'react';
import { Sparkles, Send, X, Lightbulb, Target, ChevronDown, Loader2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { sendMessage } from '../../api/chat';
import ChatBubble from '../common/ChatBubble';
import TypingIndicator from '../common/TypingIndicator';

const GREETING_TEMPLATES = {
  morning: [
    'Ready to make today count.',
    'A fresh start — let\'s see what\'s on deck.',
    'Morning clarity is your superpower.',
  ],
  afternoon: [
    'Good momentum is still momentum.',
    'Keep going — you\'re in the flow.',
    'The afternoon push is real.',
  ],
  evening: [
    'Wind down or power through — your call.',
    'Evening reflection is where growth lands.',
    'Good things happen when you show up consistently.',
  ],
};

const CONTEXTUAL_CHIPS = [
  { label: 'What should I focus on?', icon: Target },
  { label: 'Explain my goal progress', icon: Lightbulb },
  { label: 'How do I improve readiness?', icon: Sparkles },
  { label: 'Quick study strategy', icon: Lightbulb },
];

function getGreeting() {
  const h = new Date().getHours();
  const period = h < 12 ? 'morning' : h < 17 ? 'afternoon' : 'evening';
  const templates = GREETING_TEMPLATES[period];
  return {
    period: period.charAt(0).toUpperCase() + period.slice(1),
    line: templates[Math.floor(Math.random() * templates.length)],
  };
}

export default function AICoach({ mission, readiness, name }) {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [chatStarted, setChatStarted] = useState(false);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  const firstName = name || user?.name?.split(' ')[0] || 'there';
  const greeting = getGreeting();

  const welcomeMessage = `Hi ${firstName}! ${greeting.line}\n\n${mission ? `Your mission today: ${mission.goal}` : 'Your dashboard is ready when you are.'}\n\nWhat would you like to explore?`;

  useEffect(() => {
    if (!open) return;
    if (messages.length === 0) {
      setMessages([{ role: 'assistant', content: welcomeMessage }]);
    }
  }, [open, messages.length, welcomeMessage]);

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 200);
    }
  }, [open]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSend = useCallback(async () => {
    const text = input.trim();
    if (!text || loading) return;
    setInput('');
    setChatStarted(true);
    setMessages((prev) => [...prev, { role: 'user', content: text }]);
    setLoading(true);
    try {
      const res = await sendMessage(text);
      setMessages((prev) => [...prev, { role: 'assistant', content: res.data.reply }]);
    } catch {
      setMessages((prev) => [...prev, { role: 'assistant', content: 'I hit a snag. Want to try again?' }]);
    } finally {
      setLoading(false);
    }
  }, [input, loading]);

  const handleChip = (chip) => {
    setInput(chip);
    setChatStarted(true);
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  const onKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="group relative flex w-full items-center gap-3 rounded-2xl border border-indigo-200/60 bg-gradient-to-r from-indigo-50 to-white p-4 text-left transition-all hover:border-indigo-300 hover:shadow-sm dark:border-indigo-800/40 dark:from-indigo-950/30 dark:to-gray-900 dark:hover:border-indigo-700/60"
      >
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-100 dark:bg-indigo-900/50">
          <Sparkles className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-gray-800 dark:text-gray-100">
            {greeting.period}, {firstName}
          </p>
          <p className="mt-0.5 truncate text-xs text-gray-500 dark:text-gray-400">
            {greeting.line}
          </p>
        </div>
        <ChevronDown className="h-4 w-4 shrink-0 text-gray-400 transition-transform group-hover:translate-y-0.5" />
      </button>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200/80 bg-white shadow-sm dark:border-gray-800/80 dark:bg-gray-900">
      {/* Header */}
      <div className="flex items-center justify-between bg-gradient-to-r from-indigo-600 to-indigo-500 px-4 py-3">
        <div className="flex items-center gap-2.5">
          <Sparkles className="h-4 w-4 text-white/90" />
          <div>
            <p className="text-sm font-semibold text-white">Your AI Coach</p>
            <p className="text-[10px] text-indigo-200">{firstName}'s companion</p>
          </div>
        </div>
        <button
          onClick={() => setOpen(false)}
          className="rounded-lg p-1.5 text-white/70 hover:bg-white/10 hover:text-white"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Messages */}
      <div className="h-64 space-y-3 overflow-y-auto px-4 py-4">
        {messages.map((m, i) => (
          <ChatBubble key={i} role={m.role} content={m.content} />
        ))}
        {!chatStarted && !loading && (
          <div className="flex flex-wrap gap-2 pt-1">
            {CONTEXTUAL_CHIPS.map((chip) => {
              const Icon = chip.icon;
              return (
                <button
                  key={chip.label}
                  onClick={() => handleChip(chip.label)}
                  className="flex items-center gap-1.5 rounded-xl border border-indigo-200 bg-indigo-50 px-3 py-1.5 text-xs font-medium text-indigo-700 hover:bg-indigo-100 dark:border-indigo-800/50 dark:bg-indigo-900/30 dark:text-indigo-300 dark:hover:bg-indigo-900/50"
                >
                  <Icon className="h-3 w-3" />
                  {chip.label}
                </button>
              );
            })}
          </div>
        )}
        {loading && <TypingIndicator />}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="border-t border-gray-100 p-3 dark:border-gray-800">
        <div className="flex items-end gap-2 rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 focus-within:border-indigo-400 dark:border-gray-700 dark:bg-gray-900">
          <textarea
            ref={inputRef}
            rows={1}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={onKey}
            placeholder="Ask your coach anything…"
            maxLength={2000}
            disabled={loading}
            className="flex-1 resize-none bg-transparent text-sm leading-relaxed text-gray-800 placeholder-gray-400 focus:outline-none dark:text-gray-100 max-h-20"
            onInput={(e) => {
              e.target.style.height = 'auto';
              e.target.style.height = e.target.scrollHeight + 'px';
            }}
          />
          <button
            onClick={handleSend}
            disabled={loading || !input.trim()}
            className="shrink-0 rounded-lg bg-indigo-600 p-1.5 text-white hover:bg-indigo-700 disabled:opacity-40"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </button>
        </div>
      </div>
    </div>
  );
}

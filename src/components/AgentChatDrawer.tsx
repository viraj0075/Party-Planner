import React, { useState, useRef, useEffect } from 'react';
import { PartyPlan, ChatMessage, ShoppingItem } from '../types';
import {
  MessageSquare,
  X,
  Send,
  Sparkles,
  Bot,
  User,
  PlusCircle,
  HelpCircle,
  Zap,
} from 'lucide-react';

interface AgentChatDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  plan: PartyPlan | null;
  onAddItemsFromChat: (items: Partial<ShoppingItem>[]) => void;
  onUpdateBudgetFromChat: (budget: number) => void;
}

export const AgentChatDrawer: React.FC<AgentChatDrawerProps> = ({
  isOpen,
  onClose,
  plan,
  onAddItemsFromChat,
  onUpdateBudgetFromChat,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: `Hello! I'm your CymbalMart Assistant 🟡. I can help you find items in our store departments, calculate food & drink amounts for your guests, recommend budget-saving alternatives, add dietary options (vegan, gluten-free, nut-free), or suggest custom drink recipes. How can I help you today?`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  if (!isOpen) return null;

  const quickPrompts = [
    '🥗 Add 3 easy party appetizers',
    '🧊 How much ice & drinks do I need?',
    '💰 How can I trim $30 from my total?',
    '🥑 Add vegan & gluten-free options',
    '🍹 Suggest a batch party drink recipe',
    '📍 Which aisle are party cups and plates in?',
  ];

  const handleSend = async (userText: string) => {
    const text = userText.trim();
    if (!text || isLoading) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setInput('');
    setIsLoading(true);

    try {
      // Send previous messages for conversational context
      const chatHistory = updatedMessages.slice(-6).map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const response = await fetch('/api/agent-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          partyPlan: plan,
          history: chatHistory,
        }),
      });

      const data = await response.json();

      const assistantMsg: ChatMessage = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: data.content || "I've checked our store catalog and updated your request! Let me know if you need anything else.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        actionPayload: data.actionPayload,
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (e) {
      console.error('Chat error:', e);
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          role: 'assistant',
          content: 'Sorry, I ran into a brief connection issue. You can ask me again or edit items directly in your shopping checklist!',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApplyPayload = (payload: any) => {
    if (payload.items && payload.items.length > 0) {
      onAddItemsFromChat(payload.items);
    }
    if (payload.budget) {
      onUpdateBudgetFromChat(payload.budget);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-zinc-900/40 backdrop-blur-xs flex justify-end">
      <div className="bg-white w-full max-w-md h-full flex flex-col shadow-2xl border-l border-zinc-200 animate-slide-left">
        {/* Header */}
        <div className="px-5 py-4 border-b border-zinc-200 flex items-center justify-between bg-gradient-to-r from-amber-50 to-orange-50/50">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-xs">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="text-sm font-bold text-zinc-900">CymbalMart Assistant</h3>
                <span className="inline-flex items-center px-1.5 py-0.2 text-[10px] font-bold bg-emerald-100 text-emerald-800 rounded">
                  Online
                </span>
              </div>
              <p className="text-[11px] text-zinc-500">Customer Support & Smart Shopping Guide</p>
            </div>
          </div>
          <button
            id="close-chat-drawer-btn"
            onClick={onClose}
            aria-label="Close chat"
            className="p-1.5 text-zinc-400 hover:text-zinc-700 rounded-lg hover:bg-zinc-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Suggestion Chips */}
        <div className="p-2.5 bg-zinc-50 border-b border-zinc-100 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          {quickPrompts.map((qp, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleSend(qp)}
              className="text-[11px] font-medium bg-white text-zinc-700 hover:text-amber-900 hover:border-amber-400 border border-zinc-200 px-2.5 py-1 rounded-full whitespace-nowrap transition-colors shadow-2xs"
            >
              {qp}
            </button>
          ))}
        </div>

        {/* Messages List */}
        <div className="flex-1 p-4 overflow-y-auto space-y-4">
          {messages.map((msg) => {
            const isUser = msg.role === 'user';
            return (
              <div key={msg.id} className={`flex gap-2.5 ${isUser ? 'justify-end' : 'justify-start'}`}>
                {!isUser && (
                  <div className="w-7 h-7 rounded-full bg-amber-500 text-white flex items-center justify-center shrink-0 text-xs mt-0.5 shadow-2xs">
                    <Bot className="w-4 h-4" />
                  </div>
                )}

                <div
                  className={`max-w-[85%] rounded-2xl p-3.5 text-xs sm:text-sm ${
                    isUser
                      ? 'bg-zinc-900 text-white rounded-tr-none'
                      : 'bg-zinc-100 text-zinc-800 rounded-tl-none border border-zinc-200/60'
                  }`}
                >
                  <div className="text-[10px] font-bold mb-1 opacity-75">
                    {isUser ? 'You' : 'CymbalMart Assistant'}
                  </div>
                  <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>

                  {/* Action Payload Box */}
                  {msg.actionPayload?.items && msg.actionPayload.items.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-zinc-200/60 space-y-2">
                      <div className="text-[11px] font-bold text-zinc-700 uppercase tracking-wide flex items-center gap-1">
                        <Zap className="w-3 h-3 text-amber-500" />
                        <span>Recommended Items for Your List:</span>
                      </div>
                      <div className="space-y-1">
                        {msg.actionPayload.items.map((it, idx) => (
                          <div
                            key={idx}
                            className="bg-white p-2 rounded-lg border border-zinc-200 text-xs flex justify-between items-center"
                          >
                            <div>
                              <div className="font-semibold text-zinc-900">{it.name}</div>
                              {it.store && (
                                <div className="text-[10px] text-amber-700 font-medium">{it.store}</div>
                              )}
                            </div>
                            <span className="text-zinc-600 font-bold ml-2">
                              {it.quantity} {it.unit} (~${(it.estimatedCost || 0).toFixed(2)})
                            </span>
                          </div>
                        ))}
                      </div>
                      <button
                        type="button"
                        onClick={() => handleApplyPayload(msg.actionPayload)}
                        className="w-full py-1.5 px-3 rounded-lg bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 transition-colors flex items-center justify-center gap-1.5 shadow-xs"
                      >
                        <PlusCircle className="w-3.5 h-3.5" />
                        <span>Add All ({msg.actionPayload.items.length}) to Shopping List</span>
                      </button>
                    </div>
                  )}

                  <div
                    className={`text-[10px] mt-1 text-right ${
                      isUser ? 'text-zinc-400' : 'text-zinc-400'
                    }`}
                  >
                    {msg.timestamp}
                  </div>
                </div>

                {isUser && (
                  <div className="w-7 h-7 rounded-full bg-zinc-800 text-white flex items-center justify-center shrink-0 text-xs mt-0.5">
                    <User className="w-3.5 h-3.5" />
                  </div>
                )}
              </div>
            );
          })}

          {isLoading && (
            <div className="flex items-center gap-2 text-xs text-zinc-600 p-2 bg-amber-50/70 rounded-xl border border-amber-100">
              <div className="w-4 h-4 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
              <span>CymbalMart Assistant is checking inventory and calculations...</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend(input);
          }}
          className="p-3.5 border-t border-zinc-200 bg-white flex items-center gap-2"
        >
          <input
            id="chat-input"
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask CymbalMart Assistant about items, aisles, or portions..."
            className="flex-1 px-3.5 py-2 text-xs sm:text-sm rounded-lg border border-zinc-300 focus:outline-none focus:ring-2 focus:ring-amber-500 text-zinc-900"
          />
          <button
            type="submit"
            id="chat-send-btn"
            disabled={!input.trim() || isLoading}
            aria-label="Send message"
            className="p-2 text-white bg-amber-600 hover:bg-amber-700 disabled:opacity-40 rounded-lg transition-colors shadow-2xs"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};

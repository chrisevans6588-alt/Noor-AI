
import React, { useState, useEffect, useRef } from 'react';
import { Message, UserSubscription } from '../types';
import { startNewChat, sendMessageToGemini } from '../services/geminiService';
import { loadSubscription, useCredit } from '../services/subscriptionService';
import { GenerateContentResponse } from '@google/genai';
import { auth } from '../services/firebaseClient';
import SubscriptionWall from './SubscriptionWall';

interface ChatWindowProps {
  userEmail?: string;
  onReset?: () => void;
}

const SUGGESTED_PROMPTS = ["Understanding this ayah", "Guide me in repentance", "Dua for patience", "Understanding Taqwa"];

const TypingDots = () => (
  <div className="flex items-center gap-1.5 h-5 px-2">
    <div className="w-1.5 h-1.5 bg-gold-primary rounded-full animate-bounce [animation-delay:-0.3s]"></div>
    <div className="w-1.5 h-1.5 bg-gold-primary rounded-full animate-bounce [animation-delay:-0.15s]"></div>
    <div className="w-1.5 h-1.5 bg-gold-primary rounded-full animate-bounce"></div>
  </div>
);

const ChatWindow: React.FC<ChatWindowProps> = ({ userEmail, onReset }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [chatSession, setChatSession] = useState<any>(null);
  const [sub, setSub] = useState<UserSubscription | null>(null);
  const [showPaywall, setShowPaywall] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const init = async () => {
      const user = auth.currentUser;
      if (user) {
        const currentSub = await loadSubscription(user.uid);
        setSub(currentSub);
      }
      const saved = localStorage.getItem('noor_chat_history');
      if (saved) setMessages(JSON.parse(saved).map((m: any) => ({ ...m, timestamp: new Date(m.timestamp) })));
      setChatSession(startNewChat());
    };
    init();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [input]);

  const handleSend = async (overrideInput?: string) => {
    const textToSend = overrideInput || input;
    if (!textToSend.trim() || !chatSession || isLoading) return;

    const user = auth.currentUser;
    if (!user) return;

    // Check Credit before sending
    const hasCredit = await useCredit(user.uid);
    if (!hasCredit) {
      setShowPaywall(true);
      return;
    }
    
    const userMsg: Message = { role: 'user', text: textToSend, timestamp: new Date() };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput('');
    setIsLoading(true);

    // Refresh sub state to update UI counter
    loadSubscription(user.uid).then(setSub);

    try {
      const stream = await sendMessageToGemini(chatSession, textToSend);
      let modelText = "";
      setMessages(prev => [...prev, { role: 'model', text: '', timestamp: new Date() }]);
      
      let firstChunkReceived = false;
      for await (const chunk of stream) {
        if (!firstChunkReceived) { firstChunkReceived = true; setIsLoading(false); }
        const chunkText = (chunk as GenerateContentResponse).text;
        if (chunkText) {
          modelText += chunkText;
          setMessages(prev => {
            const newMsgs = [...prev];
            newMsgs[newMsgs.length - 1].text = modelText;
            return newMsgs;
          });
        }
      }
      localStorage.setItem('noor_chat_history', JSON.stringify([...newMessages, { role: 'model', text: modelText, timestamp: new Date() }]));
    } catch (e) {
      console.error(e);
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full w-full bg-void relative overflow-hidden">
      {showPaywall && <SubscriptionWall featureName="AI Chat" onSuccess={() => { setShowPaywall(false); window.location.reload(); }} onCancel={() => setShowPaywall(false)} />}
      <header className="h-16 flex items-center justify-between px-6 border-b border-white/10 bg-void/80 backdrop-blur-md z-20 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-gold-primary flex items-center justify-center font-bold text-black shadow-md">ن</div>
          <div className="flex flex-col">
            <h2 className="text-[10px] font-black text-white tracking-widest uppercase">Noor AI</h2>
            {sub?.tier !== 'premium' && <span className="text-[7px] text-slate-400 font-bold">{sub?.creditsRemaining || 0} trial credits remaining</span>}
          </div>
        </div>
        <button onClick={() => { if(confirm("Reset?")) { setMessages([]); localStorage.removeItem('noor_chat_history'); setChatSession(startNewChat()); }}} className="p-2 text-slate-500 hover:text-white active:scale-90 transition-all">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
        </button>
      </header>

      <div className="flex-1 overflow-y-auto no-scrollbar scroll-container flex flex-col items-center pb-40 px-2">
        {messages.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-6 space-y-10 w-full max-w-xl animate-in fade-in duration-600">
            <div className="space-y-4">
              <div className="w-16 h-16 bg-white/5 border border-white/10 rounded-[2rem] flex items-center justify-center text-3xl mx-auto shadow-sm text-gold-primary">ن</div>
              <h1 className="text-2xl md:text-4xl font-black text-white tracking-tight">How can I guide you?</h1>
              <p className="text-slate-400 text-sm md:text-base px-6">Ask Noor about faith, practice, or spiritual well-being.</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full px-4">
              {SUGGESTED_PROMPTS.map((p) => (
                <button key={p} onClick={() => handleSend(p)} className="p-4 rounded-xl bg-white/5 border border-white/5 text-slate-300 active:scale-95 transition-all text-xs font-bold text-left flex items-center justify-between group hover:bg-white/10 hover:border-white/20 hover:text-white">
                  {p}
                  <svg className="w-4 h-4 text-slate-500 opacity-40 group-hover:opacity-100 group-hover:text-gold-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" /></svg>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="w-full max-w-3xl px-2 md:px-8 py-6 space-y-8">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in duration-400`}>
                <div className={`max-w-[90%] md:max-w-[85%] flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                  <div className={`p-4 md:p-6 rounded-[1.5rem] leading-relaxed text-sm md:text-base font-medium shadow-sm border ${msg.role === 'user' ? 'bg-gold-primary text-black border-gold-primary rounded-tr-none font-bold' : 'bg-white/5 text-slate-200 rounded-tl-none border-white/10'}`}>
                    {msg.role === 'model' && !msg.text && isLoading && idx === messages.length - 1 ? (
                      <TypingDots />
                    ) : (
                      <div className="whitespace-pre-wrap">{msg.text}</div>
                    )}
                  </div>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      <div className="absolute bottom-20 md:bottom-8 left-0 w-full flex flex-col items-center bg-gradient-to-t from-void via-void to-transparent pt-8 pb-4 md:pb-0 px-3 md:px-8 z-20">
        <div className="w-full max-w-3xl">
          <div className="relative bg-white/5 backdrop-blur-xl border border-white/20 rounded-2xl overflow-hidden shadow-xl ring-1 ring-inset ring-white/5">
            <textarea ref={textareaRef} rows={1} value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }} placeholder="Type your inquiry..." className="w-full px-5 py-4 pr-16 bg-transparent text-white placeholder:text-slate-500 outline-none font-medium text-sm md:text-lg resize-none min-h-[56px] max-h-[140px] custom-scroll" />
            <button onClick={() => handleSend()} disabled={!input.trim() || isLoading} className={`absolute right-2 bottom-2 w-10 h-10 rounded-xl flex items-center justify-center transition-all ${input.trim() && !isLoading ? 'bg-gold-primary text-black shadow-lg active:scale-90' : 'bg-white/5 text-slate-600'}`}>
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatWindow;

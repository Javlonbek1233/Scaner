import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MessageSquare, X, Send, Bot, User, Mic, MicOff } from 'lucide-react';
import { chatWithDoctor } from '../lib/gemini';
import { cn } from '../lib/utils';

export function ChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{ role: "user" | "model", parts: string }[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);

  const startListening = () => {
    if (!('webkitSpeechRecognition' in window) && !('speechRecognition' in window)) {
      alert("Voice recognition not supported in this browser.");
      return;
    }

    const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).speechRecognition;
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInput(transcript);
    };

    recognition.start();
  };

  const handleSend = async () => {
    if (!input.trim()) return;
    
    const userMsg = input;
    setInput("");
    setMessages(prev => [...prev, { role: "user", parts: userMsg }]);
    setIsLoading(true);

    const response = await chatWithDoctor(userMsg, messages);
    setMessages(prev => [...prev, { role: "model", parts: response }]);
    setIsLoading(false);
  };

  return (
    <>
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-cyan-500 rounded-full flex items-center justify-center text-white cyan-box-glow z-50"
        id="chatbot-trigger"
      >
        <MessageSquare size={24} />
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 100, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 100, scale: 0.8 }}
            className="fixed bottom-24 right-6 w-96 h-[500px] glass-panel rounded-2xl flex flex-col z-50 border-cyan-500/50"
            id="chatbot-window"
          >
            <div className="p-4 border-b border-cyan-500/20 flex justify-between items-center bg-cyan-500/10">
              <div className="flex items-center gap-2">
                <Bot className="text-cyan-400" size={20} />
                <span className="font-mono text-sm tracking-widest text-cyan-100">NEURO-DOC v2.0</span>
              </div>
              <button onClick={() => setIsOpen(false)} className="text-cyan-200/50 hover:text-white transition-colors">
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-hide">
              {messages.length === 0 && (
                <div className="text-center text-cyan-200/40 mt-20 text-sm italic">
                  Systems ready. How can I assist your biological optimization today?
                </div>
              )}
              {messages.map((msg, i) => (
                <div key={i} className={cn("flex gap-2 max-w-[80%]", msg.role === "user" ? "ml-auto flex-row-reverse" : "mr-auto")}>
                  <div className={cn("w-8 h-8 rounded-full flex items-center justify-center shrink-0", msg.role === "user" ? "bg-cyan-500/20" : "bg-purple-500/20")}>
                    {msg.role === "user" ? <User size={14} className="text-cyan-400" /> : <Bot size={14} className="text-purple-400" />}
                  </div>
                  <div className={cn("p-3 rounded-2xl text-sm", msg.role === "user" ? "bg-cyan-500/20 text-cyan-50 rounded-tr-none" : "bg-slate-800/80 text-blue-100 rounded-tl-none border border-blue-500/10")}>
                    {msg.parts}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex gap-2 mr-auto items-center">
                  <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" />
                  <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce [animation-delay:0.2s]" />
                  <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce [animation-delay:0.4s]" />
                </div>
              )}
            </div>

            <div className="p-4 bg-slate-900/50 border-t border-cyan-500/20">
              <div className="relative flex gap-2">
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                    placeholder="Inquire health status..."
                    className="w-full bg-slate-800/50 border border-cyan-500/30 rounded-full py-2 px-4 text-sm text-cyan-100 focus:outline-none focus:border-cyan-400 transition-all pr-10"
                  />
                  <button 
                    onClick={handleSend}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-cyan-400 hover:text-cyan-300 transition-colors"
                  >
                    <Send size={16} />
                  </button>
                </div>
                <button
                  onClick={startListening}
                  className={cn(
                    "p-2 rounded-full border transition-all",
                    isListening ? "bg-red-500/20 border-red-500 text-red-500 animate-pulse" : "bg-cyan-500/10 border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/20"
                  )}
                >
                  {isListening ? <MicOff size={18} /> : <Mic size={18} />}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

import { cn } from '../lib/utils';

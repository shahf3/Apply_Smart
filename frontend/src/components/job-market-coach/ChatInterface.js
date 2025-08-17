import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Sparkles, FileText, Target, BookOpen, Star, MessageCircle, Zap } from 'lucide-react';
import axios from 'axios';
import ChatMessage from './ChatMessage';

// Base URL logic unchanged
const API_BASE_URL =
  (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_BASE_URL) ||
  process.env.REACT_APP_API_BASE_URL ||
  '';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 20000,
  withCredentials: false,
});

const QUICK_PROMPTS = [
  { icon: Target,   text: 'What skills should I focus on this month?',        color: 'from-emerald-500 to-teal-600' },
  { icon: BookOpen, text: 'Which entry paths into tech look most promising?', color: 'from-blue-500 to-indigo-600' },
  { icon: FileText, text: 'How can I improve my resume for current trends?',  color: 'from-purple-500 to-violet-600' },
  { icon: Star,     text: 'What certifications would have the best impact?',  color: 'from-amber-500 to-orange-600' },
];

export default function ChatInterface({ selectedArticle, userProfile, resumeSummary }) {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content:
        "Hello! I'm your AI Career Coach. How can I help you navigate your career path today? You can ask me anything or use one of the prompts below.",
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);

  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);
  const inFlightRef = useRef(null); // AbortController

  const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  useEffect(scrollToBottom, [messages]);

  // Auto-resize textarea
  useEffect(() => {
    if (!textareaRef.current) return;
    textareaRef.current.style.height = 'auto';
    textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
  }, [input]);

  // Cleanup any in-flight request on unmount
  useEffect(() => {
    return () => {
      try {
        inFlightRef.current?.abort();
      } catch {}
    };
  }, []);

  const buildContext = (article) => {
    if (!article) return null;
    return {
      title: article.title ?? null,
      description: article.description ?? null,
      source: article.source_id ?? article.source ?? null,
      publishedAt: article.pubDate ?? article.publishedAt ?? null,
      link: article.link ?? null,
    };
  };

  const handleSendMessage = async (promptText) => {
    const userMessage = promptText || input;
    if (!userMessage.trim() || isLoading) return;

    setMessages((prev) => [...prev, { role: 'user', content: userMessage }]);
    setInput('');
    setIsLoading(true);
    setIsTyping(true);

    // Cancel previous
    try {
      inFlightRef.current?.abort();
    } catch {}

    const controller = new AbortController();
    inFlightRef.current = controller;

    try {
      const payload = {
        prompt: selectedArticle
          ? `${userMessage}\n\n(Context from article: "${selectedArticle.title}")`
          : userMessage,
        context: buildContext(selectedArticle),
        userProfile,    // optional; pass from parent if available
        resumeSummary,  // optional; pass from parent if available
      };

      const { data } = await api.post('/api/coach/advise', payload, { signal: controller.signal });
      const advice = (data?.advice || 'Sorry, I could not generate advice.')
        .replace(/^```(?:\w+)?\s*|\s*```$/g, '')
        .trim();

      setMessages((prev) => [...prev, { role: 'assistant', content: advice }]);
    } catch (e) {
      if (!axios.isCancel(e)) {
        const msg =
          e?.response?.data?.error ||
          e?.message ||
          'Sorry, I encountered an error. Please try again.';
        setMessages((prev) => [...prev, { role: 'assistant', content: msg }]);
      }
    } finally {
      setIsLoading(false);
      setIsTyping(false);
      inFlightRef.current = null;
    }
  };

  return (
    <>
      {/* Light, subtle scrollbar */}
      <style jsx global>{`
        .chat-scrollbar::-webkit-scrollbar { width: 6px; }
        .chat-scrollbar::-webkit-scrollbar-track { background: rgba(0,0,0,0.04); border-radius: 4px; }
        .chat-scrollbar::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.2); border-radius: 4px; }
        .chat-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(0,0,0,0.35); }
        .chat-scrollbar { scrollbar-width: thin; scrollbar-color: rgba(0,0,0,0.28) rgba(0,0,0,0.06); }
        * { scroll-behavior: smooth; }
      `}</style>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
        className="h-[calc(100vh-250px)] min-h-[500px] flex flex-col bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 md:p-6 border-b border-gray-200 bg-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow">
              <MessageCircle className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">AI Career Coach</h3>
              <p className="text-sm text-gray-500">Your personal career guidance assistant</p>
            </div>
          </div>
          {isTyping && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex items-center gap-2 text-sm text-gray-500"
            >
              <div className="flex gap-1">
                <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-pulse" />
                <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-pulse delay-75" />
                <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-pulse delay-150" />
              </div>
              <span>AI is thinking...</span>
            </motion.div>
          )}
        </div>

        {/* Context pill (light) */}
        {selectedArticle && (
          <div className="px-4 md:px-6 pt-3 bg-white border-b border-gray-200">
            <div className="bg-indigo-50 border border-indigo-200 text-indigo-800 text-xs md:text-sm px-3 py-2 rounded-lg flex items-center gap-2">
              <FileText className="w-4 h-4 flex-shrink-0 text-indigo-600" />
              <span className="truncate">
                Context: <strong className="font-medium">{selectedArticle.title}</strong>
              </span>
            </div>
          </div>
        )}

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 chat-scrollbar bg-white">
          <AnimatePresence mode="popLayout">
            {messages.map((msg, index) => (
              <ChatMessage key={index} message={msg} />
            ))}
          </AnimatePresence>

          {isLoading && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-start gap-4"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow">
                <Sparkles className="w-5 h-5 text-white animate-pulse" />
              </div>
              <div className="px-6 py-4 rounded-2xl rounded-tl-none bg-gray-100 border border-gray-200">
                <div className="flex items-center gap-3">
                  <div className="flex gap-1">
                    <div className="w-2.5 h-2.5 bg-indigo-500 rounded-full animate-bounce" />
                    <div className="w-2.5 h-2.5 bg-indigo-500 rounded-full animate-bounce delay-75" />
                    <div className="w-2.5 h-2.5 bg-indigo-500 rounded-full animate-bounce delay-150" />
                  </div>
                  <span className="text-sm text-gray-600">Crafting your personalized advice...</span>
                </div>
              </div>
            </motion.div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Prompts (light) */}
        <AnimatePresence>
          {messages.length < 2 && !isLoading && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.35 }}
              className="p-4 md:p-6 border-t border-gray-200 bg-gray-50"
            >
              <div className="mb-3 flex items-center gap-2 text-sm text-gray-600">
                <Zap className="w-4 h-4" />
                <span>Quick Start Prompts</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {QUICK_PROMPTS.map((prompt, index) => (
                  <motion.div
                    key={prompt.text}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <button
                      className="w-full bg-white border border-gray-200 hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 cursor-pointer group rounded-xl shadow-sm p-4 text-left"
                      onClick={() => handleSendMessage(prompt.text)}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${prompt.color} flex items-center justify-center shadow`}>
                          <prompt.icon className="w-4 h-4 text-white" />
                        </div>
                        <span className="text-sm text-gray-700 group-hover:text-gray-900 transition-colors leading-5">
                          {prompt.text}
                        </span>
                      </div>
                    </button>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Input (light) */}
        <div className="p-4 md:p-6 bg-white border-t border-gray-200">
          {selectedArticle && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mb-4">
              <div className="bg-indigo-50 border border-indigo-200 text-indigo-800 text-sm px-4 py-3 rounded-xl flex items-center gap-3">
                <FileText className="w-4 h-4 flex-shrink-0 text-indigo-600" />
                <div className="flex-1 min-w-0">
                  <span className="text-indigo-700">Context: </span>
                  <span className="font-medium truncate block">{selectedArticle.title}</span>
                </div>
              </div>
            </motion.div>
          )}

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="relative"
          >
            <div className="relative flex items-end gap-3">
              <div className="flex-1 relative">
                <textarea
                  ref={textareaRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  placeholder="Ask your career question"
                  className="min-h-[52px] max-h-[120px] w-full bg-white text-gray-900 placeholder-gray-500 rounded-xl py-4 px-4 pr-14 resize-none focus:ring-2 focus:ring-indigo-500 focus:outline-none border border-gray-300 focus:border-indigo-500 chat-scrollbar"
                  rows={1}
                />
              </div>

              <button
                type="submit"
                disabled={isLoading || !input.trim()}
                className="h-[52px] w-[52px] bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg flex-shrink-0 flex items-center justify-center"
              >
                <Send className="w-5 h-5 text-white" />
              </button>
            </div>
          </form>

          <div className="mt-3 text-xs text-gray-500 text-center">
            Press <kbd className="px-1.5 py-0.5 bg-gray-100 rounded border border-gray-200 text-gray-700">Enter</kbd> to send,&nbsp;
            <kbd className="px-1.5 py-0.5 bg-gray-100 rounded border border-gray-200 text-gray-700">Shift + Enter</kbd> for new line
          </div>
        </div>
      </motion.div>
    </>
  );
}

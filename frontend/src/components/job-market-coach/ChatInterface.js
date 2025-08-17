import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Sparkles, FileText, Target, BookOpen, Star, MessageCircle, Zap } from 'lucide-react';
import ChatMessage from './ChatMessage';

// Re-using the mock API logic from the parent component
const mockApi = {
    post: async (url, data) => {
    await new Promise(resolve => setTimeout(resolve, 2000));
    return {
      data: {
        advice: `Based on your query about "${data.prompt}", here's my personalized career guidance:

**Immediate Actions (Next 7 Days):**
*   Update your LinkedIn profile with relevant keywords from current job postings.
*   Start a small project showcasing skills mentioned in trending articles.
*   Network with 3-5 professionals in your target roles.

**Medium-term Strategy (Next 30 Days):**
*   Complete an online certification in a high-demand skill (e.g AI/ML, Cloud, or Data Analytics).
*   Contribute to an open-source project that aligns with market trends.
*   Attend virtual industry meetups and conferences.

**Key Market Insights:**
The current job market favors candidates who can demonstrate both **technical depth** and **adaptability**. Focus on building T-shaped skills: deep expertise in one area with broad knowledge across multiple domains.`
      }
    };
  }
};

const QUICK_PROMPTS = [
  { icon: Target, text: "What skills should I focus on this month?", color: "from-emerald-500 to-teal-600" },
  { icon: BookOpen, text: "Which entry paths into tech look most promising?", color: "from-blue-500 to-indigo-600" },
  { icon: FileText, text: "How can I improve my resume for current trends?", color: "from-purple-500 to-violet-600" },
  { icon: Star, text: "What certifications would have the best impact?", color: "from-amber-500 to-orange-600" },
];

export default function ChatInterface({ selectedArticle }) {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: "Hello! I'm your AI Career Coach. How can I help you navigate your career path today? You can ask me anything or use one of the prompts below."
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [input]);

  const handleSendMessage = async (promptText) => {
    const userMessage = promptText || input;
    if (!userMessage.trim()) return;

    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setInput('');
    setIsLoading(true);
    setIsTyping(true);

    try {
      let fullPrompt = userMessage;
      if (selectedArticle) {
          fullPrompt += `\n\n(Context from article: "${selectedArticle.title}")`;
      }

      const { data } = await mockApi.post("/api/coach/advise", { prompt: fullPrompt });
      const advice = (data?.advice || "Sorry, I couldn't generate a response.").replace(/^```(?:\w+)?\s*|\s*```$/g, "").trim();
      
      setMessages(prev => [...prev, { role: 'assistant', content: advice }]);
    } catch (e) {
      setMessages(prev => [...prev, { role: 'assistant', content: "Sorry, I encountered an error. Please try again." }]);
    } finally {
      setIsLoading(false);
      setIsTyping(false);
    }
  };
  
  return (
    <>
      {/* Custom Scrollbar Styles */}
      <style jsx global>{`
        .chat-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .chat-scrollbar::-webkit-scrollbar-track {
          background: rgba(17, 24, 39, 0.3);
          border-radius: 2px;
        }
        .chat-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(99, 102, 241, 0.3);
          border-radius: 2px;
          transition: background 0.2s ease;
        }
        .chat-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(99, 102, 241, 0.5);
        }
        .chat-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: thin;
          scrollbar-color: rgba(99, 102, 241, 0.3) rgba(17, 24, 39, 0.3);
        }
        * { scroll-behavior: smooth; }
      `}</style>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
        className="h-[calc(100vh-250px)] min-h-[500px] flex flex-col bg-gradient-to-br from-gray-900/95 via-slate-900/95 to-gray-800/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-700/30 overflow-hidden"
      >
        {/* Chat Header */}
        <div className="flex items-center justify-between p-4 md:p-6 border-b border-gray-700/30 bg-gray-900/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg">
              <MessageCircle className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">AI Career Coach</h3>
              <p className="text-sm text-gray-400">Your personal career guidance assistant</p>
            </div>
          </div>
          {isTyping && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex items-center gap-2 text-sm text-gray-400"
            >
              <div className="flex gap-1">
                <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-pulse"></div>
                <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-pulse delay-75"></div>
                <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-pulse delay-150"></div>
              </div>
              <span>AI is thinking...</span>
            </motion.div>
          )}
        </div>

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 chat-scrollbar">
          <AnimatePresence mode="popLayout">
            {messages.map((msg, index) => (
              <ChatMessage key={index} message={msg} />
            ))}
          </AnimatePresence>
          
          {isLoading && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex items-start gap-4"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center flex-shrink-0 shadow-lg">
                <Sparkles className="w-5 h-5 text-white animate-pulse" />
              </div>
              <div className="px-6 py-4 rounded-2xl rounded-tl-none bg-gray-800/60 backdrop-blur-sm border border-gray-700/30">
                <div className="flex items-center gap-3">
                  <div className="flex gap-1">
                    <div className="w-2.5 h-2.5 bg-indigo-400 rounded-full animate-bounce"></div>
                    <div className="w-2.5 h-2.5 bg-indigo-400 rounded-full animate-bounce delay-75"></div>
                    <div className="w-2.5 h-2.5 bg-indigo-400 rounded-full animate-bounce delay-150"></div>
                  </div>
                  <span className="text-sm text-gray-400">Crafting your personalized advice...</span>
                </div>
              </div>
            </motion.div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Prompts */}
        <AnimatePresence>
          {messages.length < 2 && !isLoading && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
              className="p-4 md:p-6 border-t border-gray-700/30 bg-gray-900/30 backdrop-blur-sm"
            >
              <div className="mb-4 flex items-center gap-2 text-sm text-gray-400">
                <Zap className="w-4 h-4" />
                <span>Quick Start Prompts</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {QUICK_PROMPTS.map((prompt, index) => (
                  <motion.div
                    key={prompt.text}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <div 
                      className="bg-gray-800/40 border border-gray-700/30 hover:bg-gray-800/60 hover:border-gray-600/40 transition-all duration-300 cursor-pointer group rounded-xl shadow-lg"
                      onClick={() => handleSendMessage(prompt.text)}
                    >
                      <div className="p-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${prompt.color} flex items-center justify-center flex-shrink-0 shadow-md group-hover:scale-110 transition-transform duration-200`}>
                            <prompt.icon className="w-4 h-4 text-white" />
                          </div>
                          <span className="text-sm text-gray-300 group-hover:text-white transition-colors duration-200 leading-5">
                            {prompt.text}
                          </span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Input Area */}
        <div className="p-4 md:p-6 bg-gray-900/60 backdrop-blur-sm border-t border-gray-700/30">
          {selectedArticle && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="mb-4"
            >
              <div className="bg-indigo-500/20 border border-indigo-500/30 text-indigo-200 text-sm px-4 py-3 rounded-xl flex items-center gap-3 backdrop-blur-sm">
                <FileText className="w-4 h-4 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <span className="text-indigo-300">Context: </span>
                  <span className="font-medium truncate block">{selectedArticle.title}</span>
                </div>
              </div>
            </motion.div>
          )}
          
          <form onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }} className="relative">
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
                  placeholder="Ask your career question, e.g 'How can I transition into a data science role?'"
                  className="min-h-[52px] max-h-[120px] w-full bg-gray-800/60 text-gray-200 placeholder-gray-400 rounded-xl py-4 px-4 pr-14 resize-none focus:ring-2 focus:ring-indigo-500 focus:outline-none border border-gray-700/50 focus:border-indigo-500/50 transition-all duration-200 backdrop-blur-sm chat-scrollbar"
                  rows={1}
                />
              </div>
              
              <button
                type="submit" 
                disabled={isLoading || !input.trim()}
                className="h-[52px] w-[52px] bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-105 disabled:hover:scale-100 flex-shrink-0 flex items-center justify-center"
              >
                <Send className="w-5 h-5 text-white" />
              </button>
            </div>
          </form>
          
          <div className="mt-3 text-xs text-gray-500 text-center">
            Press <kbd className="px-1.5 py-0.5 bg-gray-700 rounded text-gray-300">Enter</kbd> to send, <kbd className="px-1.5 py-0.5 bg-gray-700 rounded text-gray-300">Shift + Enter</kbd> for new line
          </div>
        </div>
      </motion.div>
    </>
  );
}
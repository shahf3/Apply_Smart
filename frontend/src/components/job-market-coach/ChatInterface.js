import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Sparkles, FileText, Target, BookOpen, Star } from 'lucide-react';
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
*   Complete an online certification in a high-demand skill (e.g., AI/ML, Cloud, or Data Analytics).
*   Contribute to an open-source project that aligns with market trends.
*   Attend virtual industry meetups and conferences.

**Key Market Insights:**
The current job market favors candidates who can demonstrate both **technical depth** and **adaptability**. Focus on building T-shaped skills: deep expertise in one area with broad knowledge across multiple domains.`
      }
    };
  }
};

const QUICK_PROMPTS = [
  { icon: Target, text: "What skills should I focus on this month?" },
  { icon: BookOpen, text: "Which entry paths into tech look most promising?" },
  { icon: FileText, text: "How can I improve my resume for current trends?" },
  { icon: Star, text: "What certifications would have the best impact?" },
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
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  const handleSendMessage = async (promptText) => {
    const userMessage = promptText || input;
    if (!userMessage.trim()) return;

    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setInput('');
    setIsLoading(true);

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
    }
  };
  
  return (
    <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="h-[calc(100vh-250px)] min-h-[500px] flex flex-col bg-gray-800/50 dark:bg-gray-900/50 rounded-2xl shadow-2xl border border-gray-700/50 overflow-hidden"
    >
      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 scrollbar-width-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800">
        <AnimatePresence>
            {messages.map((msg, index) => (
              <ChatMessage key={index} message={msg} />
            ))}
        </AnimatePresence>
        {isLoading && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center flex-shrink-0 shadow-md animate-pulse">
                <Sparkles className="w-5 h-5 text-white" />
                </div>
                <div className="px-4 py-3 rounded-2xl bg-gray-700/50">
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-75"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-150"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-300"></div>
                </div>
                </div>
            </motion.div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Prompts (if chat is fresh) */}
      <AnimatePresence>
        {messages.length < 2 && !isLoading && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="p-4 md:p-6 border-t border-gray-700/50 bg-gray-800/80"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {QUICK_PROMPTS.map(p => (
                <motion.button 
                  key={p.text}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  className="bg-gray-700/50 hover:bg-gray-700 p-3 rounded-lg text-left transition-colors"
                  onClick={() => handleSendMessage(p.text)}
                >
                  <div className="flex items-center gap-3">
                    <p.icon className="w-4 h-4 text-indigo-400 flex-shrink-0" />
                    <span className="text-sm text-gray-300">{p.text}</span>
                  </div>
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Input Area */}
      <div className="p-4 bg-gray-900/80 backdrop-blur-sm border-t border-gray-700/50">
        {selectedArticle && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="mb-2"
          >
            <div className="bg-indigo-500/20 border border-indigo-500/30 text-indigo-200 text-xs px-3 py-1.5 rounded-lg flex items-center gap-2">
              <FileText className="w-4 h-4 flex-shrink-0" />
              <span className="truncate">Context: <strong>{selectedArticle.title}</strong></span>
            </div>
          </motion.div>
        )}
        <form onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }} className="relative">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
            placeholder="Ask your career question, e.g., 'How can I transition into a data science role?'"
            rows={1}
            className="w-full bg-gray-700/50 text-gray-200 placeholder-gray-400 rounded-lg py-3 pl-4 pr-14 resize-none focus:ring-2 focus:ring-indigo-500 focus:outline-none border border-transparent focus:border-indigo-500 transition-all"
          />
          <button 
            type="submit" 
            disabled={isLoading || !input.trim()}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-indigo-600 hover:bg-indigo-500 rounded-md disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors"
          >
            <Send className="w-5 h-5 text-white" />
          </button>
        </form>
      </div>
    </motion.div>
  );
}
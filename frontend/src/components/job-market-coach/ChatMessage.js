import React from 'react';
import { motion } from 'framer-motion';
import { Bot, User } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export default function ChatMessage({ message }) {
  const isAssistant = message.role === 'assistant';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
      className={`flex items-start gap-4 w-full ${isAssistant ? '' : 'justify-end'}`}
    >
      {isAssistant && (
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center flex-shrink-0 shadow-lg">
          <Bot className="w-5 h-5 text-white" />
        </div>
      )}

      <div className={`flex flex-col max-w-2xl ${isAssistant ? 'items-start' : 'items-end'}`}>
        <motion.div
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.2, delay: 0.1 }}
          className={`px-6 py-4 rounded-2xl shadow-lg backdrop-blur-sm ${
            isAssistant
              ? 'bg-gray-800/60 text-gray-100 rounded-tl-none border border-gray-700/30'
              : 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-tr-none shadow-indigo-500/20'
          }`}
        >
          <div className={`prose prose-sm max-w-none ${
            isAssistant 
              ? 'prose-invert prose-indigo' 
              : 'prose-white'
          }`}>
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                p: (props) => <p className="my-2 leading-relaxed text-sm" {...props} />,
                h1: (props) => <h1 className="my-3 text-lg font-bold" {...props} />,
                h2: (props) => <h2 className="my-3 text-base font-semibold" {...props} />,
                h3: (props) => <h3 className="my-2 text-base font-semibold" {...props} />,
                ul: (props) => <ul className="my-3 list-disc pl-6 space-y-1" {...props} />,
                ol: (props) => <ol className="my-3 list-decimal pl-6 space-y-1" {...props} />,
                li: (props) => <li className="text-sm leading-relaxed" {...props} />,
                a: ({ href, children, ...rest }) => {
                  const hasChildren = Array.isArray(children)
                    ? children.length > 0
                    : Boolean(children);
                  let fallbackText = 'link';
                  try {
                    if (typeof href === 'string' && href) {
                      const url = new URL(href, typeof window !== 'undefined' ? window.location.href : 'http://localhost');
                      fallbackText = url.hostname || href;
                    }
                  } catch {
                    fallbackText = typeof href === 'string' ? href : 'link';
                  }

                  return (
                    <a
                      href={href}
                      target="_blank"
                      rel="noreferrer"
                      className={`underline decoration-2 underline-offset-2 transition-colors duration-200 break-words ${
                        isAssistant 
                          ? 'text-indigo-300 hover:text-indigo-200' 
                          : 'text-indigo-100 hover:text-white'
                      }`}
                      aria-label={hasChildren ? undefined : fallbackText}
                      {...rest}
                    >
                      {hasChildren ? children : fallbackText}
                    </a>
                  );
                },
                code: (props) => (
                  <code className={`px-2 py-1 rounded-md text-xs font-mono ${
                    isAssistant 
                      ? 'bg-gray-900/60 text-indigo-200' 
                      : 'bg-white/20 text-indigo-100'
                  }`} {...props} />
                ),
                pre: (props) => (
                  <pre className={`p-4 rounded-xl overflow-x-auto text-xs font-mono my-3 ${
                    isAssistant 
                      ? 'bg-gray-900/60 border border-gray-700/50' 
                      : 'bg-white/10 border border-white/20'
                  }`} {...props} />
                ),
                strong: (props) => (
                  <strong className="font-semibold" {...props} />
                ),
                blockquote: (props) => (
                  <blockquote className={`border-l-4 pl-4 my-3 italic ${
                    isAssistant 
                      ? 'border-indigo-500/50 text-gray-300' 
                      : 'border-white/30 text-indigo-100'
                  }`} {...props} />
                ),
              }}
            >
              {message.content}
            </ReactMarkdown>
          </div>
        </motion.div>
        
        <div className="mt-2 text-xs text-gray-500">
          {isAssistant ? 'AI Coach' : 'You'}
        </div>
      </div>

      {!isAssistant && (
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-gray-600 to-gray-700 flex items-center justify-center flex-shrink-0 shadow-lg">
          <User className="w-5 h-5 text-white" />
        </div>
      )}
    </motion.div>
  );
}
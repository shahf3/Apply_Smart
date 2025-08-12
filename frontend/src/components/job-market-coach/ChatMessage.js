import React from 'react';
import { motion } from 'framer-motion';
import { Brain, User } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export default function ChatMessage({ message }) {
  const isAssistant = message.role === 'assistant';

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`flex items-start gap-3 md:gap-4 w-full ${isAssistant ? '' : 'justify-end'}`}
    >
      {isAssistant && (
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center flex-shrink-0 shadow-md">
          <Brain className="w-5 h-5 text-white" />
        </div>
      )}

      <div className={`flex flex-col max-w-xl ${isAssistant ? 'items-start' : 'items-end'}`}>
        <div
          className={`px-4 py-3 rounded-2xl ${
            isAssistant
              ? 'bg-gray-700/50 text-gray-200 rounded-bl-none'
              : 'bg-indigo-600 text-white rounded-br-none'
          }`}
        >
          {/* Wrapper carries prose classes. Do not put className on ReactMarkdown itself. */}
          <div className="prose prose-sm max-w-none prose-invert">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                p: (props) => <p className="my-2 leading-6" {...props} />,
                h1: (props) => <h1 className="my-3 text-lg font-semibold" {...props} />,
                h2: (props) => <h2 className="my-3 text-base font-semibold" {...props} />,
                h3: (props) => <h3 className="my-3 text-base font-semibold" {...props} />,
                ul: (props) => <ul className="my-2 list-disc pl-5" {...props} />,
                ol: (props) => <ol className="my-2 list-decimal pl-5" {...props} />,
                li: (props) => <li className="my-1" {...props} />,
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
                      className="text-indigo-300 hover:text-indigo-200 underline break-words"
                      aria-label={hasChildren ? undefined : fallbackText}
                      {...rest}
                    >
                      {hasChildren ? children : fallbackText}
                    </a>
                  );
                },
                code: (props) => (
                  <code className="px-1.5 py-0.5 rounded bg-gray-800/60" {...props} />
                ),
                pre: (props) => (
                  <pre className="p-3 rounded bg-gray-800 overflow-x-auto" {...props} />
                ),
              }}
            >
              {message.content}
            </ReactMarkdown>
          </div>
        </div>
      </div>

      {!isAssistant && (
        <div className="w-8 h-8 rounded-lg bg-gray-600 flex items-center justify-center flex-shrink-0 shadow-md">
          <User className="w-5 h-5 text-white" />
        </div>
      )}
    </motion.div>
  );
}

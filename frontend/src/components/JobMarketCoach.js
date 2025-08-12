import React, { useEffect, useMemo, useState, lazy } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  TrendingUp,
  Calendar,
  ExternalLink,
  RefreshCw,
  FileText,
  CheckCircle2,
  Brain,
  Globe,
  ArrowRight,
  Target,
  Newspaper,
  MessageSquare
} from "lucide-react";

const ChatInterface = lazy(() => import('./job-market-coach/ChatInterface'));

// Mock API for demo purposes
const mockApi = {
  get: async (url) => {
    await new Promise(resolve => setTimeout(resolve, 1500));
    return {
      data: {
        articles: [
          {
            title: "Remote Work Trends Reshaping Tech Hiring in 2024",
            description: "Companies are increasingly embracing hybrid models, with 73% of organizations planning to maintain flexible work arrangements.",
            source_id: "TechCrunch",
            pubDate: "2024-01-15T10:00:00Z",
            link: "https://example.com/article1",
            image_url: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=400"
          },
          {
            title: "AI and Machine Learning Jobs See 40% Growth",
            description: "The demand for AI specialists, machine learning engineers, and data scientists continues to surge.",
            source_id: "Forbes",
            pubDate: "2024-01-14T15:30:00Z",
            link: "https://example.com/article2",
            image_url: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=400"
          },
          {
            title: "Soft Skills Become Critical in Tech Recruitment",
            description: "Employers are prioritizing communication, collaboration, and adaptability alongside technical expertise.",
            source_id: "Harvard Business Review",
            pubDate: "2024-01-13T09:15:00Z",
            link: "https://example.com/article3",
            image_url: "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=400"
          },
          {
            title: "Green Tech Jobs: The Future of Sustainable Employment",
            description: "Environmental technology roles are expanding rapidly, with renewable energy and sustainable software development.",
            source_id: "MIT Tech Review",
            pubDate: "2024-01-12T14:20:00Z",
            link: "https://example.com/article4",
            image_url: "https://images.unsplash.com/photo-1497435334941-8c899ee9e8e9?w=400"
          }
        ]
      }
    };
  }
};

const ViewToggle = ({ viewMode, setViewMode }) => (
  <div className="relative w-64 mx-auto p-1 bg-gray-700/50 rounded-full flex items-center">
    <motion.div
      layout
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className="absolute inset-0 p-1"
    >
      <div
        className={`h-full w-1/2 bg-indigo-600 rounded-full shadow-md ${
          viewMode === 'coach' ? 'translate-x-full' : ''
        } transition-transform duration-300 ease-in-out`}
      />
    </motion.div>
    <button
      onClick={() => setViewMode('news')}
      className={`relative z-10 w-1/2 py-2 text-sm font-semibold rounded-full flex items-center justify-center gap-2 transition-colors ${
        viewMode === 'news' ? 'text-white' : 'text-gray-300 hover:text-white'
      }`}
    >
      <Newspaper className="w-4 h-4" />
      Market News
    </button>
    <button
      onClick={() => setViewMode('coach')}
      className={`relative z-10 w-1/2 py-2 text-sm font-semibold rounded-full flex items-center justify-center gap-2 transition-colors ${
        viewMode === 'coach' ? 'text-white' : 'text-gray-300 hover:text-white'
      }`}
    >
      <MessageSquare className="w-4 h-4" />
      AI Coach
    </button>
  </div>
);

export default function JobMarketCoach() {
  const [articles, setArticles] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [viewMode, setViewMode] = useState('news'); // 'news' or 'coach'

  const fetchNews = async () => {
    setLoading(true);
    setError("");
    try {
      const { data } = await mockApi.get(`/api/news/job-news?ts=${Date.now()}`);
      const items = data?.articles || [];
      setArticles(items);
      setSelectedIndex((idx) => (idx != null && idx < items.length ? idx : null));
    } catch (err) {
      console.error("News fetch failed:", err);
      setError("Failed to load news articles. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNews();
  }, []);

  const formatDate = (dateString) => {
    if (!dateString) return "No date available";
    return new Date(dateString).toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  const selectedArticle = useMemo(
    () => (selectedIndex != null ? articles[selectedIndex] : null),
    [selectedIndex, articles]
  );
  
  const renderArticlesView = () => (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <div className="flex items-center justify-between mb-6">
            <div>
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-1">Latest Market Trends</h2>
            <p className="text-gray-600 dark:text-gray-400">Click any article to use it for personalized coaching</p>
            </div>
            <motion.button
            onClick={fetchNews}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-2 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-indigo-300 dark:hover:border-indigo-600 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all shadow-sm"
            >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
            </motion.button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {articles.map((article, index) => {
                const isSelected = selectedIndex === index;
                return (
                <motion.article
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ y: -8, scale: 1.02 }}
                    className={`cursor-pointer bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border-2 ${
                    isSelected 
                        ? "border-indigo-500 ring-4 ring-indigo-500/20" 
                        : "border-transparent hover:border-gray-200 dark:hover:border-gray-700"
                    }`}
                    onClick={() => {
                        setSelectedIndex(index);
                        setViewMode('coach');
                    }}
                >
                    {article.image_url && (
                    <div className="h-40 overflow-hidden relative">
                        <img
                        src={article.image_url}
                        alt={article.title}
                        className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                        {isSelected && (
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="absolute top-3 right-3 w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center border-2 border-white"
                        >
                            <CheckCircle2 className="w-5 h-5 text-white" />
                        </motion.div>
                        )}
                    </div>
                    )}
                    
                    <div className="p-5">
                    <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400 mb-2">
                        <div className="flex items-center gap-1.5"><Calendar className="w-4 h-4" />{formatDate(article.pubDate)}</div>
                        <div className="flex items-center gap-1.5 truncate"><Globe className="w-4 h-4" />{article.source_id || "News"}</div>
                    </div>
                    
                    <h3 className="text-base font-bold text-gray-800 dark:text-white mb-2 h-12 line-clamp-2">
                        {article.title}
                    </h3>
                                    
                    <div className="flex items-center justify-between text-indigo-600 dark:text-indigo-400 font-semibold text-sm group">
                        <span>Select for Coaching</span>
                        <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                    </div>
                    </div>
                </motion.article>
                );
            })}
        </div>
    </motion.div>
  );

  if (loading && articles.length === 0) {
    return (
        <div className="text-center py-16">
            <motion.div
                className="w-16 h-16 mx-auto mb-6 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center"
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
            >
                <TrendingUp className="w-8 h-8 text-white" />
            </motion.div>
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">Loading Market Insights</h2>
            <p className="text-gray-600 dark:text-gray-400">Fetching the latest job market trends...</p>
        </div>
    );
  }

  return (
    <div className="min-h-screen">
        <motion.div 
          className="text-center mb-10"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <motion.h1 
            className="text-4xl md:text-5xl font-bold text-gray-800 dark:text-white mb-4"
          >
            Job Market <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">Intelligence</span>
          </motion.h1>
          
          <motion.p 
            className="text-lg text-gray-600 dark:text-gray-400 max-w-3xl mx-auto"
          >
            Stay ahead with AI-powered insights. Toggle between market news and your personal career coach.
          </motion.p>
        </motion.div>

        <div className="mb-8">
            <ViewToggle viewMode={viewMode} setViewMode={setViewMode} />
        </div>

        <AnimatePresence mode="wait">
            <motion.div
                key={viewMode}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
            >
                {viewMode === 'news' ? renderArticlesView() : (
                    <React.Suspense fallback={<div>Loading Coach...</div>}>
                        <ChatInterface selectedArticle={selectedArticle} />
                    </React.Suspense>
                )}
            </motion.div>
        </AnimatePresence>
    </div>
  );
}
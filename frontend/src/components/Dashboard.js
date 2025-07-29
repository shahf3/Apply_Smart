import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Tooltip } from "react-tooltip";
import ProfileSummary from "./ProfileSummary";
import ResumeUpload from "./ResumeUpload";
import ATSScoringCard from "./ATSScoringCard";
import JobSearchResults from "./JobSearchResults";
import CoverLetterGenerator from "./CoverLetterGenerator";
import MockInterview from "./MockInterview";

function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [, setUserId] = useState(null);
  const [userName, setUserName] = useState("");
  const [activeSection, setActiveSection] = useState("profile");
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [profileCompletion, setProfileCompletion] = useState(0);

  // Design System
  const designSystem = {
    colors: {
      primary: "bg-blue-600 hover:bg-blue-700 focus:ring-blue-500",
      secondary: "bg-purple-600 hover:bg-purple-700 focus:ring-purple-500",
      accent: "bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-500",
      neutral: {
        50: "bg-gray-50",
        100: "bg-gray-100",
        200: "bg-gray-200",
        900: "text-gray-900",
      },
      success: "bg-green-600 hover:bg-green-700 focus:ring-green-500",
      error: "bg-red-600 hover:bg-red-700 focus:ring-red-500",
    },
    typography: {
      heading: "font-sans font-bold text-gray-900",
      subheading: "font-sans font-medium text-gray-600",
      body: "font-sans text-gray-700",
    },
    spacing: {
      xs: "p-2",
      sm: "p-4",
      md: "p-6",
      lg: "p-8",
    },
    shadows: {
      sm: "shadow-sm",
      md: "shadow-md",
      lg: "shadow-lg",
    },
    borders: {
      default: "border border-gray-200",
      accent: "border border-blue-200",
    },
  };

  useEffect(() => {
    const storedId = localStorage.getItem("user_id");
    const storedName = localStorage.getItem("user_name");
    if (storedId) {
      setUserId(storedId);
      setUserName(storedName || "User");
      setProfileCompletion(Math.floor(Math.random() * 100));
    } else {
      setError("User not logged in.");
    }
    setLoading(false);

    // Handle window resize for sidebar behavior
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setIsMobileSidebarOpen(false);
        setIsSidebarCollapsed(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user_id");
    localStorage.removeItem("user_name");
    window.location.href = "/";
  };

  const sidebarItems = [
    {
      id: "profile",
      label: "Profile",
      icon: "👤",
      description: "Personal Information",
    },
    {
      id: "resume",
      label: "Resume",
      icon: "📄",
      description: "Document Management",
    },
    {
      id: "ats",
      label: "ATS Scoring",
      icon: "📊",
      description: "Optimization Analysis",
    },
    {
      id: "jobs",
      label: "Job Search",
      icon: "🔍",
      description: "Opportunity Discovery",
    },
    {
      id: "coverletter",
      label: "Cover Letter",
      icon: "✍️",
      description: "Letter Generation",
    },
    {
      id: "interview",
      label: "Mock Interview",
      icon: "🎤",
      description: "Interview Practice",
    },
  ];

  const renderActiveSection = () => {
    switch (activeSection) {
      case "profile":
        return <ProfileSummary />;
      case "resume":
        return <ResumeUpload />;
      case "ats":
        return <ATSScoringCard />;
      case "jobs":
        return <JobSearchResults />;
      case "coverletter":
        return <CoverLetterGenerator />;
      case "interview":
        return <MockInterview />;
      default:
        return <ProfileSummary />;
    }
  };

  const getSectionTitle = () => {
    const item = sidebarItems.find((item) => item.id === activeSection);
    return item ? item.label : "Dashboard";
  };

  const getSectionDescription = () => {
    const descriptions = {
      profile: "Manage your professional profile and personal information",
      resume: "Upload, manage, and optimize your resume documents",
      ats: "Analyze and improve your resume for Applicant Tracking Systems",
      jobs: "Discover and track job opportunities tailored to your profile",
      coverletter: "Generate personalized cover letters for your applications",
      interview:
        "Practice and prepare for interviews with AI-powered mock sessions",
    };
    return descriptions[activeSection] || "Welcome to your career dashboard";
  };

  // Skeleton Loader Component
  const SkeletonLoader = () => (
    <div className="animate-pulse space-y-4">
      <div className={`${designSystem.colors.neutral?.[100] || 'bg-gray-100'} h-10 rounded-md`} />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className={`${designSystem.colors.neutral?.[100] || 'bg-gray-100'} h-24 rounded-md`} />
        ))}
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 to-indigo-100">
        <div className="flex flex-col items-center gap-6 p-8">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 1 }}
            className="relative"
          >
            <div className="rounded-full h-16 w-16 border-4 border-blue-200" />
            <div className="absolute top-0 rounded-full h-16 w-16 border-t-4 border-blue-600" />
          </motion.div>
          <div className="text-center">
            <h3 className={`${designSystem.typography.heading} text-lg mb-2`}>
              Loading Dashboard
            </h3>
            <p className={designSystem.typography.subheading}>
              Setting up your workspace...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 to-indigo-100 p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full border border-red-100"
        >
          <div className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-red-600 text-2xl">⚠️</span>
            </div>
            <h2 className={`${designSystem.typography.heading} text-2xl mb-2`}>
              Access Denied
            </h2>
            <p className="text-red-600 mb-6 leading-relaxed">{error}</p>
            <button
              onClick={() => (window.location.href = "/")}
              className={`${designSystem.colors.error} px-6 py-3 rounded-xl font-semibold transition-all duration-200 ${designSystem.shadows.lg}`}
            >
              Return to Login
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-indigo-100 font-sans">
      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isMobileSidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black lg:hidden"
            onClick={() => setIsMobileSidebarOpen(false)}
            aria-hidden="true"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        initial={{ x: "-100%" }}
        animate={{
          x: isMobileSidebarOpen ? 0 : isSidebarCollapsed ? "-80%" : 0,
          width: isSidebarCollapsed ? "4rem" : "16rem",
        }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className={`fixed left-0 top-0 z-50 h-full bg-white ${designSystem.shadows.lg} ${designSystem.borders.default} lg:flex lg:flex-col transform lg:transform-none w-64 lg:w-auto overflow-y-auto scrollbar-hide`}
        role="navigation"
        aria-label="Main navigation"
      >
        {/* Sidebar Header */}
        <div className={`${designSystem.spacing.sm} ${designSystem.borders.default} flex items-center justify-between`}>
          {!isSidebarCollapsed && (
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg">
                💼
              </div>
              <div>
                <h1 className={`${designSystem.typography.heading} text-lg`}>ApplySmart</h1>
                <p className={designSystem.typography.subheading}>Dashboard</p>
              </div>
            </div>
          )}
          <button
            onClick={() => {
              setIsSidebarCollapsed(!isSidebarCollapsed);
              if (window.innerWidth < 1024) {
                setIsMobileSidebarOpen(!isMobileSidebarOpen);
              }
            }}
            className={`${designSystem.spacing.xs} rounded-lg hover:bg-gray-100 transition-colors`}
            aria-label={isSidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            <span className="text-gray-600 text-lg">
              {isSidebarCollapsed ? "→" : "←"}
            </span>
          </button>
        </div>

        {/* User Info */}
        <AnimatePresence>
          {!isSidebarCollapsed && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className={`${designSystem.spacing.sm} ${designSystem.borders.default}`}
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-400 to-blue-500 flex items-center justify-center text-white font-bold">
                  {userName.charAt(0) || "U"}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`${designSystem.typography.body} font-semibold truncate`}>
                    Welcome back,
                  </p>
                  <p className={`${designSystem.typography.subheading} truncate`}>
                    {userName || "User"}
                  </p>
                </div>
              </div>
              <div className="mt-2">
                <div className="bg-gray-200 rounded-full h-2">
                  <motion.div
                    className="bg-blue-600 rounded-full h-2"
                    initial={{ width: 0 }}
                    animate={{ width: `${profileCompletion}%` }}
                    transition={{ duration: 1 }}
                  />
                </div>
                <p className="text-xs text-gray-600 mt-1">
                  Profile {profileCompletion}% complete
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Navigation */}
        <nav className={`${designSystem.spacing.sm} space-y-2`} aria-label="Sidebar navigation">
          {sidebarItems.map((item) => (
            <motion.button
              key={item.id}
              onClick={() => {
                setActiveSection(item.id);
                if (window.innerWidth < 1024) {
                  setIsMobileSidebarOpen(false);
                }
              }}
              className={`w-full flex items-center gap-3 ${designSystem.spacing.xs} rounded-lg transition-all duration-200 ${
                activeSection === item.id
                  ? designSystem.colors.primary
                  : `text-gray-700 hover:bg-blue-50 hover:text-blue-700`
              } ${isSidebarCollapsed ? "justify-center" : ""}`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              data-tooltip-id={`tooltip-${item.id}`}
              data-tooltip-content={item.description}
              aria-label={item.label}
            >
              <span className="text-lg">{item.icon}</span>
              {!isSidebarCollapsed && (
                <span className="font-medium text-sm">{item.label}</span>
              )}
            </motion.button>
          ))}
          <Tooltip id="tooltip-profile" />
          <Tooltip id="tooltip-resume" />
          <Tooltip id="tooltip-ats" />
          <Tooltip id="tooltip-jobs" />
          <Tooltip id="tooltip-coverletter" />
          <Tooltip id="tooltip-interview" />
        </nav>

        {/* Logout Button */}
        <div className={`${designSystem.spacing.sm} ${designSystem.borders.default}`}>
          <motion.button
            onClick={handleLogout}
            className={`w-full flex items-center gap-3 ${designSystem.spacing.xs} rounded-lg ${designSystem.colors.error} transition-all duration-200 ${
              isSidebarCollapsed ? "justify-center" : ""
            }`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            aria-label="Logout"
          >
            <span className="text-lg">🚪</span>
            {!isSidebarCollapsed && (
              <span className="font-medium text-sm">Logout</span>
            )}
          </motion.button>
        </div>
      </motion.aside>

      {/* Main Content */}
      <div
        className={`transition-all duration-300 ${
          isSidebarCollapsed ? "lg:ml-16" : "lg:ml-64"
        }`}
      >
        {/* Top Header */}
        <header className={`sticky top-0 z-30 bg-white/80 backdrop-blur-xl ${designSystem.borders.default} ${designSystem.shadows.sm}`}>
          <div className="flex items-center justify-between px-4 sm:px-6 lg:px-8 py-4">
            <button
              onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
              className={`lg:hidden ${designSystem.spacing.xs} rounded-xl hover:bg-gray-100 transition-colors ${designSystem.shadows.sm} ${designSystem.borders.default}`}
              aria-label="Toggle mobile sidebar"
            >
              <span className="text-gray-700 text-lg">☰</span>
            </button>

            <div className="flex items-center gap-4 flex-1 lg:flex-initial">
              <div className="hidden sm:block">
                <h1 className={`${designSystem.typography.heading} text-2xl lg:text-3xl mb-1`}>
                  {getSectionTitle()}
                </h1>
                <p className={`${designSystem.typography.subheading} text-sm lg:text-base leading-relaxed`}>
                  {getSectionDescription()}
                </p>
              </div>
              <div className="sm:hidden">
                <h1 className={`${designSystem.typography.heading} text-lg`}>
                  {getSectionTitle()}
                </h1>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className={`hidden md:flex items-center gap-3 ${designSystem.spacing.xs} ${designSystem.colors.neutral?.[100] || 'bg-gray-100'} rounded-2xl`}>
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center ${designSystem.shadows.lg}`}>
                  <span className="text-white font-bold text-sm">
                    {userName.charAt(0).toUpperCase() || "U"}
                  </span>
                </div>
                <div className="text-left">
                  <span className={`${designSystem.typography.body} font-semibold block text-sm`}>
                    {userName || "User"}
                  </span>
                  <span className="text-xs text-gray-500">
                    Professional Account
                  </span>
                </div>
              </div>
              <motion.button
                onClick={handleLogout}
                className={`hidden sm:flex items-center gap-2 ${designSystem.spacing.xs} rounded-xl ${designSystem.colors.error} font-semibold ${designSystem.shadows.lg} transition-all duration-200`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                aria-label="Logout"
              >
                <span className="text-sm">🚪</span>
                <span className="hidden lg:inline">Logout</span>
              </motion.button>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className={designSystem.spacing.lg}>
          <div className="max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className={`bg-white rounded-2xl ${designSystem.shadows.lg} ${designSystem.borders.accent} overflow-hidden`}
            >
              <div className={`bg-gradient-to-r from-blue-50 to-purple-50 ${designSystem.spacing.md} ${designSystem.borders.default}`}>
                <div className="flex items-center gap-3">
                  <span className="text-2xl">
                    {sidebarItems.find((item) => item.id === activeSection)?.icon || "📋"}
                  </span>
                  <div>
                    <h2 className={`${designSystem.typography.heading} text-lg`}>
                      {getSectionTitle()}
                    </h2>
                    <p className={designSystem.typography.subheading}>
                      {getSectionDescription()}
                    </p>
                  </div>
                </div>
              </div>
              <div className={designSystem.spacing.md}>
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeSection}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    {renderActiveSection()}
                  </motion.div>
                </AnimatePresence>
              </div>
            </motion.div>

            {/* Quick Stats */}
            <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { id: "profile", label: "Profile", icon: "👤", status: "Complete" },
                { id: "resume", label: "Resume", icon: "📄", status: "Uploaded" },
                { id: "jobs", label: "Job Search", icon: "🔍", status: "Active" },
                { id: "ats", label: "ATS Score", icon: "📊", status: "Good" },
                { id: "coverletter", label: "Cover Letter", icon: "✍️", status: "Draft" },
                { id: "interview", label: "Mock Interview", icon: "🎤", status: "Scheduled" },
              ].map((item) => (
                <motion.button
                  key={item.id}
                  onClick={() => setActiveSection(item.id)}
                  className={`bg-white rounded-xl ${designSystem.shadows.sm} ${designSystem.borders.accent} ${designSystem.spacing.sm} text-left hover:shadow-lg hover:border-blue-200 transition-all duration-200 ${
                    activeSection === item.id
                      ? "ring-2 ring-blue-500 border-blue-300"
                      : ""
                  }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  data-tooltip-id={`stat-tooltip-${item.id}`}
                  data-tooltip-content={`${item.label} Status: ${item.status}`}
                  aria-label={`${item.label} status: ${item.status}`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                      <span className="text-blue-600">{item.icon}</span>
                    </div>
                    <div>
                      <p className={`${designSystem.typography.subheading} text-sm`}>{item.label}</p>
                      <p className={`${designSystem.typography.body} font-semibold`}>{item.status}</p>
                    </div>
                  </div>
                  <Tooltip id={`stat-tooltip-${item.id}`} />
                </motion.button>
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default Dashboard;

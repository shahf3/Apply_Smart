import React, { useState, useEffect } from "react";
import ProfileSummary from "./ProfileSummary";
import ResumeUpload from "./ResumeUpload";
import ATSScoringCard from "./ATSScoringCard";
import JobSearchResults from "./JobSearchResults";
import CoverLetterGenerator from "./CoverLetterGenerator";
import MockInterview from "./MockInterview";
import ResumeBuilder from "./ResumeBuilder";

function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [, setUserId] = useState(null);
  const [userName, setUserName] = useState("");
  const [activeSection, setActiveSection] = useState("profile");
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  useEffect(() => {
    const storedId = localStorage.getItem("user_id");
    const storedName = localStorage.getItem("user_name");
    if (storedId) {
      setUserId(storedId);
      setUserName(storedName || "User");
    } else {
      setError("User not logged in.");
    }
    setLoading(false);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user_id");
    localStorage.removeItem("user_name");
    window.location.href = "/";
  };

  const sidebarItems = [
    { id: "profile", label: "Profile", icon: "👤" },
    { id: "resume", label: "Resume", icon: "📄" },
    { id: "ats", label: "ATS Scoring", icon: "📊" },
    { id: "jobs", label: "Job Search", icon: "🔍" },
    { id: "coverletter", label: "Cover Letter", icon: "✍️" },
    { id: "interview", label: "Mock Interview", icon: "🎤" },
    { id: "builder", label: "Resume Builder", icon: "🛠️" }
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
      case "builder":
        return <ResumeBuilder />;
      default:
        return <ProfileSummary />;
    }
  };

  const getSectionTitle = () => {
    const item = sidebarItems.find(item => item.id === activeSection);
    return item ? item.label : "Dashboard";
  };

  if (loading) {
  return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-500 border-solid"></div>
          <p className="text-gray-600 font-medium">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md mx-4">
          <div className="text-center">
            <div className="text-red-500 text-5xl mb-4">⚠️</div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Access Error</h2>
            <p className="text-red-600 mb-4">{error}</p>
            <button 
              onClick={() => window.location.href = "/"} 
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Return to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 font-sans">
      {/* Mobile Sidebar Overlay */}
      {isMobileSidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setIsMobileSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed left-0 top-0 z-50 h-full bg-white shadow-xl border-r border-blue-100 transition-all duration-300 ${
        isSidebarCollapsed ? 'w-16' : 'w-64'
      } ${isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}>
        
        {/* Sidebar Header */}
        <div className="p-4 border-b border-blue-100">
          <div className="flex items-center justify-between">
            {!isSidebarCollapsed && (
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg">
                  💼
                </div>
                <div>
                  <h1 className="font-bold text-lg text-gray-900">JobSeeker</h1>
                  <p className="text-sm text-gray-600">Dashboard</p>
                </div>
              </div>
            )}
            <button
              onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors hidden lg:block"
            >
              <span className="text-gray-600">{isSidebarCollapsed ? '→' : '←'}</span>
            </button>
          </div>
        </div>

        {/* User Info */}
        {!isSidebarCollapsed && (
          <div className="p-4 border-b border-blue-100">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-400 to-blue-500 flex items-center justify-center text-white font-bold">
                {userName.charAt(0) || 'U'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-900 truncate">Welcome back,</p>
                <p className="text-sm text-gray-600 truncate">{userName || 'User'}</p>
              </div>
            </div>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          {sidebarItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setActiveSection(item.id);
                setIsMobileSidebarOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                activeSection === item.id
                  ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg'
                  : 'text-gray-700 hover:bg-blue-50 hover:text-blue-700'
              }`}
            >
              <span className="text-lg">{item.icon}</span>
              {!isSidebarCollapsed && (
                <span className="font-medium text-sm">{item.label}</span>
              )}
            </button>
          ))}
        </nav>

        {/* Logout Button */}
        <div className="p-4 border-t border-blue-100">
          <button
            onClick={handleLogout}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-600 hover:bg-red-50 transition-all duration-200 ${
              isSidebarCollapsed ? 'justify-center' : ''
            }`}
          >
            <span className="text-lg">🚪</span>
            {!isSidebarCollapsed && (
              <span className="font-medium text-sm">Logout</span>
            )}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className={`transition-all duration-300 ${
        isSidebarCollapsed ? 'lg:ml-16' : 'lg:ml-64'
      }`}>
        
        {/* Top Header */}
        <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-blue-100 shadow-sm">
          <div className="flex items-center justify-between px-4 sm:px-6 lg:px-8 py-4">
            
            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
              className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <span className="text-gray-600 text-xl">☰</span>
            </button>

            {/* Page Title */}
            <div className="flex items-center gap-3">
              <div className="hidden sm:block">
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
                  {getSectionTitle()}
                </h1>
                <p className="text-sm text-gray-600">
                  {activeSection === 'profile' && 'Manage your profile information'}
                  {activeSection === 'resume' && 'Upload and manage your resume'}
                  {activeSection === 'ats' && 'Check your ATS compatibility score'}
                  {activeSection === 'jobs' && 'Search and discover job opportunities'}
                  {activeSection === 'coverletter' && 'Generate personalized cover letters'}
                  {activeSection === 'interview' && 'Practice with mock interviews'}
                  {activeSection === 'builder' && 'Build your resume from scratch'}
                </p>
              </div>
            </div>

            {/* User Actions */}
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex items-center gap-2 text-sm text-gray-600">
                <span className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold">
                  {userName.charAt(0) || 'U'}
                </span>
                <span className="font-medium">{userName || 'User'}</span>
              </div>
              <button
                onClick={handleLogout}
                className="hidden sm:block px-4 py-2 rounded-lg bg-gradient-to-r from-red-500 to-red-600 text-white font-medium shadow hover:from-red-600 hover:to-red-700 transition-all duration-200"
              >
                Logout
              </button>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="p-4 sm:p-6 lg:p-8">
          <div className="max-w-6xl mx-auto">
            
            {/* Content Card */}
            <div className="bg-white rounded-2xl shadow-lg border border-blue-100 overflow-hidden">
              
              {/* Content Header */}
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 px-6 py-4 border-b border-blue-100">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">
                    {sidebarItems.find(item => item.id === activeSection)?.icon || '📋'}
                  </span>
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">
                      {getSectionTitle()}
                    </h2>
                    <p className="text-sm text-gray-600">
                      {activeSection === 'profile' && 'Update your professional profile'}
                      {activeSection === 'resume' && 'Upload and manage your resume files'}
                      {activeSection === 'ats' && 'Optimize your resume for ATS systems'}
                      {activeSection === 'jobs' && 'Find your next career opportunity'}
                      {activeSection === 'coverletter' && 'Create compelling cover letters'}
                      {activeSection === 'interview' && 'Prepare for your interviews'}
                      {activeSection === 'builder' && 'Create a professional resume'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Dynamic Content */}
              <div className="p-6">
                {renderActiveSection()}
              </div>
            </div>

            {/* Quick Stats */}
            <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white rounded-xl shadow-sm border border-blue-100 p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                    <span className="text-blue-600">👤</span>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Profile</p>
                    <p className="font-semibold text-gray-900">Complete</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-xl shadow-sm border border-blue-100 p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                    <span className="text-green-600">📄</span>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Resume</p>
                    <p className="font-semibold text-gray-900">Uploaded</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-xl shadow-sm border border-blue-100 p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                    <span className="text-purple-600">🔍</span>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Job Search</p>
                    <p className="font-semibold text-gray-900">Active</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-xl shadow-sm border border-blue-100 p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
                    <span className="text-orange-600">📊</span>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">ATS Score</p>
                    <p className="font-semibold text-gray-900">Good</p>
                  </div>
                </div>
          </div>
          </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default Dashboard;
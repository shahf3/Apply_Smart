import React, { useState } from "react";
import {
  User,
  Briefcase,
  Target,
  ChevronRight,
  Sparkles,
  Shield,
  Zap,
} from "lucide-react";
import RegisterUser from "./registeruser";
import LoginUser from "./LoginUser";
import { Routes, Route, useNavigate } from "react-router-dom";
import Dashboard from "./components/Dashboard";
import Footer from "./Footer";
const ProfileForm = () => (
  <div className="bg-white rounded-2xl shadow-xl p-8 backdrop-blur-sm border border-white/20">
    <h3 className="text-2xl font-bold text-gray-800 mb-6">
      Complete Your Profile
    </h3>
    <div className="space-y-4">
      <input
        type="text"
        placeholder="Professional Title"
        className="w-full p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200"
      />
      <textarea
        placeholder="Tell us about your experience..."
        rows="4"
        className="w-full p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200 resize-none"
      />
      <input
        type="text"
        placeholder="Skills (comma separated)"
        className="w-full p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200"
      />
      <button className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 text-white py-4 rounded-xl font-semibold hover:from-emerald-700 hover:to-teal-700 transform hover:scale-105 transition-all duration-200 shadow-lg">
        Save Profile
      </button>
    </div>
  </div>
);

const FeatureCard = ({ icon: Icon, title, description, gradient }) => (
  <div
    className={`group relative overflow-hidden rounded-2xl p-8 bg-gradient-to-br ${gradient} transform hover:scale-105 transition-all duration-300 shadow-xl hover:shadow-2xl`}
  >
    <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
    <div className="relative z-10">
      <Icon className="w-12 h-12 text-white mb-4 group-hover:scale-110 transition-transform duration-300" />
      <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
      <p className="text-white/90">{description}</p>
    </div>
  </div>
);

function App() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("register");

  return (
    <Routes>
      <Route
        path="/"
        element={
          <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
            {/* Animated background elements */}
            <div className="absolute inset-0 overflow-hidden">
              <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
              <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
              <div className="absolute top-1/2 left-1/2 w-80 h-80 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
            </div>

            <div className="relative z-10">
              {/* Header */}
              <header className="text-center py-16 px-4">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl mb-8 shadow-xl">
                  <Briefcase className="w-10 h-10 text-white" />
                </div>
                <h1 className="text-6xl font-bold text-white mb-6 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  Apply Smart
                </h1>
                <h2 className="text-4xl font-bold text-white mb-6 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  Job Application Helper
                </h2>
                <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
                  Streamline your job search with our powerful tools. Track
                  applications, prepare for interviews, and land your dream job.
                </p>
                <div className="flex items-center justify-center space-x-2 text-gray-400">
                  <Sparkles className="w-5 h-5" />
                  <span>Your career journey starts here</span>
                  <Sparkles className="w-5 h-5" />
                </div>
              </header>

              {/* Features Section */}
              <section className="py-16 px-4">
                <div className="max-w-6xl mx-auto">
                  <h2 className="text-4xl font-bold text-white text-center mb-12">
                    Why Choose Us?
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <FeatureCard
                      icon={Target}
                      title="Smart Tracking"
                      description="Keep track of all your applications in one organized dashboard"
                      gradient="from-blue-600 to-cyan-600"
                    />
                    <FeatureCard
                      icon={Zap}
                      title="Quick Apply"
                      description="Apply to multiple jobs with personalized cover letters instantly"
                      gradient="from-purple-600 to-pink-600"
                    />
                    <FeatureCard
                      icon={Shield}
                      title="Secure & Private"
                      description="Your data is protected with enterprise-grade security"
                      gradient="from-emerald-600 to-teal-600"
                    />
                  </div>
                </div>
              </section>

              {/* Main Content */}
              <section className="py-16 px-4">
                <div className="max-w-6xl mx-auto">
                  {/* Tab Navigation */}
                  <div className="flex justify-center mb-12">
                    <div className="inline-flex bg-white/10 backdrop-blur-sm rounded-2xl p-2">
                      {[
                        { id: "register", label: "Register", icon: User },
                        { id: "login", label: "Login", icon: Shield },
                        { id: "profile", label: "Profile", icon: Target },
                      ].map(({ id, label, icon: Icon }) => (
                        <button
                          key={id}
                          onClick={() => setActiveTab(id)}
                          className={`flex items-center space-x-2 px-6 py-3 rounded-xl font-semibold transition-all duration-200 ${
                            activeTab === id
                              ? "bg-white text-gray-800 shadow-lg"
                              : "text-white hover:bg-white/20"
                          }`}
                        >
                          <Icon className="w-5 h-5" />
                          <span>{label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex justify-center">
                    <div className="w-full max-w-md">
                      {activeTab === "register" && (
                        <div className="opacity-100 transition-opacity duration-300">
                          <RegisterUser />
                        </div>
                      )}
                      {activeTab === "login" && (
                        <div className="opacity-100 transition-opacity duration-300">
                          <LoginUser />
                        </div>
                      )}
                      {activeTab === "profile" && (
                        <div className="opacity-100 transition-opacity duration-300">
                          <ProfileForm />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </section>

              {/* CTA Section */}
              <section className="py-16 px-4 text-center">
                <div className="max-w-4xl mx-auto">
                  <h2 className="text-4xl font-bold text-white mb-8">
                    Ready to Get Started?
                  </h2>
                  <p className="text-xl text-gray-300 mb-8">
                    Join thousands of job seekers who have found their dream
                    careers with our platform.
                  </p>
                  <button
                    onClick={() => navigate("/dashboard")}
                    className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transform hover:scale-105 transition-all duration-200 shadow-xl"
                  >
                    <span>Start Your Journey</span>
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </section>
            </div>
            <Footer />
          </div>
        }
      />
      <Route
        path="/dashboard"
        element={
          <div>
            <Dashboard />
            <Footer />
          </div>
        }
      />
    </Routes>
  );
}

export default App;

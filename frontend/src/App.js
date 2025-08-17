import { useState, useEffect, useRef } from "react";
import { Route, Routes, useLocation, Navigate } from "react-router-dom";
import {
  User,
  Briefcase,
  Target,
  ChevronRight,
  Sparkles,
  Shield,
  Zap,
  Menu,
  Rocket,
  X,
  MapPin,
  PenTool,
  ArrowRight,
  TrendingUp,
  CheckCircle2,
  ExternalLink,
  Globe,
  Code,
  FileText,
  BarChart3,
  Mic,
  Newspaper,
  Brain,
  Search,
  ShieldCheck,
  CheckCircle,
} from "lucide-react";

import { motion, useInView, useScroll, useTransform } from "framer-motion";
import Footer from "./Footer";
import LoginUser from "./LoginUser";
import RegisterUser from "./registeruser";
import Dashboard from "./components/Dashboard";
import { PrivateRoute, PublicRoute } from './components/AuthRoutes';
import GoogleCallback from "./GoogleCallback";
import { GoogleOAuthProvider } from "@react-oauth/google";
import "./App.css";

// Navigation Component
const Navigation = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navItems = [
    { name: "Home", href: "#home" },
    { name: "About", href: "#about" },
    { name: "Services", href: "#services" },
    { name: "APIs", href: "#integrations" },
  ];

  return (
    <nav
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${
        isScrolled ? "bg-white/90 backdrop-blur-md shadow-md" : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-700 rounded-lg flex items-center justify-center">
              <Briefcase className="w-6 h-6 text-white" />
            </div>
            <span
              className={`text-lg font-semibold tracking-tight ${
                isScrolled ? "text-gray-900" : "text-white"
              }`}
            >
              Apply Smart
            </span>
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:flex space-x-8">
            {navItems.map((item) => (
              <a
                key={item.name}
                href={item.href}
                className={`text-sm font-medium uppercase transition duration-200 ${
                  isScrolled
                    ? "text-gray-700 hover:text-blue-600"
                    : "text-white/90 hover:text-blue-300"
                }`}
              >
                {item.name}
              </a>
            ))}
          </div>

          {/* Right Section */}
          <div className="flex items-center space-x-4">
            {/* CTA (Desktop only) */}
            <a
              href="#auth"
              className={`hidden md:inline-block px-5 py-2 rounded-full font-medium transition-all duration-300 shadow ${
                isScrolled
                  ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700"
                  : "bg-white text-blue-600 hover:bg-gray-200"
              }`}
            >
              Get Started
            </a>

            {/* Mobile menu toggle */}
            <button
              className={`md:hidden p-2 rounded transition ${
                isScrolled
                  ? "text-gray-700 hover:bg-gray-100"
                  : "text-white hover:bg-white/10"
              }`}
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden mt-2 bg-white/95 rounded-b-xl px-4 py-4 shadow-lg space-y-3">
            {navItems.map((item) => (
              <a
                key={item.name}
                href={item.href}
                className="block text-sm font-medium text-gray-700 hover:text-blue-600"
                onClick={() => setIsMenuOpen(false)}
              >
                {item.name}
              </a>
            ))}
            <a
              href="#auth"
              className="block text-center bg-gradient-to-r from-blue-600 to-purple-600 text-white py-2 rounded-full font-medium hover:from-blue-700 hover:to-purple-700"
              onClick={() => setIsMenuOpen(false)}
            >
              Get Started
            </a>
          </div>
        )}
      </div>
    </nav>
  );
};

// Hero Section Component
const HeroSection = () => {
  return (
    <section
      id="home"
      className="relative min-h-screen w-full max-w-screen overflow-hidden flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900"
    >
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-25%] right-[-25%] w-[300px] h-[300px] bg-purple-500/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-[-25%] left-[-25%] w-[300px] h-[300px] bg-blue-500/20 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-pink-500/20 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 text-center px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full mb-8 shadow-lg animate-bounce">
          <Briefcase className="w-8 h-8 text-white" />
        </div>

        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold text-white mb-4 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent animate-fade-in tracking-tight">
          Apply Smart
        </h1>

        <h2 className="text-2xl sm:text-3xl font-semibold text-white mb-6 bg-gradient-to-r from-blue-300 to-purple-300 bg-clip-text text-transparent tracking-tight">
          Job Application Helper
        </h2>

        <p className="text-lg sm:text-xl text-gray-200 mb-10 max-w-3xl mx-auto leading-relaxed">
          Streamline your job search with our powerful tools. Track
          applications, prepare for interviews, and land your dream job.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <button className="group bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-3.5 rounded-full font-medium hover:from-blue-700 hover:to-purple-700 transform hover:scale-105 transition-all duration-300 shadow-lg flex items-center space-x-2">
            <span>Start Your Journey</span>
            <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-200" />
          </button>
          <button className="border-2 border-white/20 text-white px-8 py-3.5 rounded-full font-medium hover:bg-white/10 hover:border-white/30 transition-all duration-300">
            Learn More
          </button>
        </div>

        <div className="mt-8 flex items-center justify-center space-x-2 text-gray-300 text-sm">
          <Sparkles className="w-4 h-4" />
          <span>Your career journey starts here</span>
          <Sparkles className="w-4 h-4" />
        </div>
      </div>
    </section>
  );
};

// Auth Section Component
const AuthSection = () => {
  const [mode, setMode] = useState("login");

  return (
    <section
      id="auth"
      className="py-24 bg-gradient-to-br from-blue-50/50 to-purple-50/50"
    >
      <div className="max-w-lg mx-auto px-4">
        <div className="flex justify-center mb-8">
          <div className="inline-flex rounded-full bg-white shadow-lg p-1.5">
            <button
              className={`px-8 py-2.5 rounded-full font-medium transition-all duration-300 ${
                mode === "login"
                  ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
              onClick={() => setMode("login")}
            >
              Login
            </button>
            <button
              className={`px-8 py-2.5 rounded-full font-medium transition-all duration-300 ${
                mode === "register"
                  ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
              onClick={() => setMode("register")}
            >
              Register
            </button>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-8 shadow-lg transition-all duration-300">
          {mode === "login" ? <LoginUser /> : <RegisterUser />}
        </div>
      </div>
    </section>
  );
};

// About Section Component

const features = [
  {
    icon: User,
    title: "Smart Profile",
    desc: "Create a clear professional profile so tools can tailor recommendations to your goals.",
    color: "from-blue-500 to-cyan-500",
    bgColor: "bg-blue-50 dark:bg-blue-900/20",
    textColor: "text-blue-700 dark:text-blue-300",
  },
  {
    icon: FileText,
    title: "Resume Manager",
    desc: "Upload, edit, and version your resume in one place for fast updates.",
    color: "from-emerald-500 to-teal-500",
    bgColor: "bg-emerald-50 dark:bg-emerald-900/20",
    textColor: "text-emerald-700 dark:text-emerald-300",
  },
  {
    icon: BarChart3,
    title: "ATS Resume Scoring",
    desc: "Receive a match score and precise improvements to align with a job description.",
    color: "from-violet-500 to-purple-500",
    bgColor: "bg-violet-50 dark:bg-violet-900/20",
    textColor: "text-violet-700 dark:text-violet-300",
  },
  {
    icon: Search,
    title: "Job Search",
    desc: "Discover roles that fit your skills and preferences, then apply with confidence.",
    color: "from-amber-500 to-orange-500",
    bgColor: "bg-amber-50 dark:bg-amber-900/20",
    textColor: "text-amber-700 dark:text-amber-300",
  },
  {
    icon: PenTool,
    title: "Cover Letter Generator",
    desc: "Generate concise, role specific letters that highlight your value.",
    color: "from-rose-500 to-pink-500",
    bgColor: "bg-rose-50 dark:bg-rose-900/20",
    textColor: "text-rose-700 dark:text-rose-300",
  },
  {
    icon: Mic,
    title: "Mock Interview",
    desc: "Practice questions and receive structured feedback to improve quickly.",
    color: "from-indigo-500 to-blue-500",
    bgColor: "bg-indigo-50 dark:bg-indigo-900/20",
    textColor: "text-indigo-700 dark:text-indigo-300",
  },
  {
    icon: Newspaper,
    title: "Market Insights",
    desc: "Track hiring trends and role demand with curated job market news.",
    color: "from-cyan-500 to-blue-500",
    bgColor: "bg-cyan-50 dark:bg-cyan-900/20",
    textColor: "text-cyan-700 dark:text-cyan-300",
  },
  {
    icon: Brain,
    title: "AI Career Coach",
    desc: "Ask targeted questions and receive actionable guidance and seven day plans.",
    color: "from-purple-500 to-indigo-500",
    bgColor: "bg-purple-50 dark:bg-purple-900/20",
    textColor: "text-purple-700 dark:text-purple-300",
  },
];

const stats = [
  { label: "One workspace", desc: "Profile and documents", icon: Target },
  { label: "Clear actions", desc: "Coach and scoring", icon: Zap },
  { label: "Better prep", desc: "Interviews and letters", icon: TrendingUp },
  { label: "Informed search", desc: "Market insights", icon: CheckCircle2 },
];

const FeatureCard = ({ feature, index }) => {
  const [isHovered, setIsHovered] = useState(false);
  const { icon: Icon, title, desc, color } = feature;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{
        duration: 0.5,
        delay: index * 0.1,
        ease: [0.21, 0.47, 0.32, 0.98],
      }}
      whileHover={{
        y: -4,
        transition: { duration: 0.2, ease: "easeOut" },
      }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className="group relative overflow-hidden rounded-2xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 shadow-lg shadow-gray-900/5 dark:shadow-gray-900/20 hover:shadow-xl hover:shadow-gray-900/10 dark:hover:shadow-gray-900/30 transition-all duration-300"
    >
      {/* Animated background gradient */}
      <div
        className={`absolute inset-0 bg-gradient-to-br ${color} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}
      />

      {/* Subtle border highlight */}
      <div className="absolute inset-0 rounded-2xl ring-1 ring-inset ring-gray-900/5 dark:ring-white/5" />

      <div className="relative p-6">
        <div className="flex items-start gap-4">
          <motion.div
            className={`shrink-0 rounded-xl bg-gradient-to-br ${color} p-3 shadow-lg`}
            whileHover={{
              scale: 1.05,
              rotate: [0, -5, 5, 0],
              transition: { duration: 0.3 },
            }}
          >
            <Icon className="w-5 h-5 text-white" />
          </motion.div>

          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2 group-hover:text-gray-800 dark:group-hover:text-white transition-colors">
              {title}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed group-hover:text-gray-700 dark:group-hover:text-gray-300 transition-colors">
              {desc}
            </p>
          </div>
        </div>
      </div>

      {/* Hover indicator */}
      <motion.div
        className="absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-transparent via-gray-900/20 dark:via-white/20 to-transparent"
        initial={{ scaleX: 0 }}
        animate={{ scaleX: isHovered ? 1 : 0 }}
        transition={{ duration: 0.3 }}
      />
    </motion.div>
  );
};

const StatCard = ({ stat, index }) => {
  const { label, desc, icon: Icon } = stat;
  const colors = [
    "from-blue-500 to-cyan-400",
    "from-purple-500 to-pink-400",
    "from-emerald-500 to-teal-400",
    "from-amber-500 to-orange-400",
  ];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{
        duration: 0.4,
        delay: index * 0.1,
        ease: [0.21, 0.47, 0.32, 0.98],
      }}
      whileHover={{ scale: 1.02 }}
      className="text-center group"
    >
      <div className="mb-3">
        <div
          className={`inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br ${colors[index]} shadow-lg mb-2 group-hover:shadow-xl transition-shadow duration-300`}
        >
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
      <div
        className={`text-xl font-bold bg-gradient-to-r ${colors[index]} bg-clip-text text-transparent mb-1`}
      >
        {label}
      </div>
      <div className="text-gray-600 dark:text-gray-400 text-sm font-medium">
        {desc}
      </div>
    </motion.div>
  );
};

const HeroEffect = () => {
  const nodes = [
    { cx: "50%", cy: "10%" },
    { cx: "85%", cy: "30%" },
    { cx: "75%", cy: "75%" },
    { cx: "20%", cy: "85%" },
    { cx: "15%", cy: "40%" },
    { cx: "40%", cy: "50%" },
  ];

  const lines = [
    { x1: "50%", y1: "10%", x2: "15%", y2: "40%" },
    { x1: "50%", y1: "10%", x2: "85%", y2: "30%" },
    { x1: "15%", y1: "40%", x2: "20%", y2: "85%" },
    { x1: "15%", y1: "40%", x2: "40%", y2: "50%" },
    { x1: "85%", y1: "30%", x2: "75%", y2: "75%" },
    { x1: "85%", y1: "30%", x2: "40%", y2: "50%" },
    { x1: "75%", y1: "75%", x2: "20%", y2: "85%" },
    { x1: "75%", y1: "75%", x2: "40%", y2: "50%" },
  ];

  return (
    <motion.div
      className="absolute top-0 right-0 w-1/2 h-full hidden xl:block pointer-events-none"
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 1, delay: 0.5, ease: "easeOut" }}
    >
      <svg
        width="100%"
        height="100%"
        className="absolute top-0 left-0 opacity-20 dark:opacity-30"
      >
        <defs>
          <radialGradient
            id="node-gradient"
            cx="50%"
            cy="50%"
            r="50%"
            fx="50%"
            fy="50%"
          >
            <stop
              offset="0%"
              style={{ stopColor: "rgb(167, 139, 250)", stopOpacity: 0.8 }}
            />
            <stop
              offset="100%"
              style={{ stopColor: "rgb(99, 102, 241)", stopOpacity: 0 }}
            />
          </radialGradient>
        </defs>

        {/* Animated Lines */}
        {lines.map((line, i) => (
          <motion.line
            key={i}
            {...line}
            stroke="url(#node-gradient)"
            strokeWidth="1"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.5, 0] }}
            transition={{
              duration: 4,
              repeat: Infinity,
              delay: i * 0.3,
              ease: "easeInOut",
            }}
          />
        ))}

        {/* Animated Nodes */}
        {nodes.map((node, i) => (
          <motion.g key={i} transform={`translate(${node.cx} ${node.cy})`}>
            <motion.circle
              r="4"
              fill="currentColor"
              className="text-indigo-400"
              initial={{ scale: 0 }}
              animate={{ scale: [0, 1.2, 0.8, 1] }}
              transition={{
                duration: 2,
                repeat: Infinity,
                repeatType: "mirror",
                delay: i * 0.5,
              }}
            />
          </motion.g>
        ))}
      </svg>
    </motion.div>
  );
};

const AboutSection = () => {
  const containerRef = useRef(null);
  const isInView = useInView(containerRef, { once: true, margin: "-100px" });
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });

  const y = useTransform(scrollYProgress, [0, 1], [0, -50]);
  const opacity = useTransform(scrollYProgress, [0, 0.5, 1], [0.5, 1, 0.5]);

  return (
    <section
      id="about"
      ref={containerRef}
      className="relative py-32 bg-gradient-to-b from-gray-50/80 via-white to-gray-50/80 dark:from-gray-900/80 dark:via-gray-900 dark:to-gray-900/80 overflow-hidden"
    >
      {/* Animated background elements */}
      <div className="absolute inset-0">
        <motion.div
          style={{ y, opacity }}
          className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-r from-blue-400/10 to-purple-400/10 rounded-full blur-3xl"
        />
        <motion.div
          style={{ y: useTransform(y, (v) => v * -0.5), opacity }}
          className="absolute bottom-20 right-10 w-96 h-96 bg-gradient-to-r from-emerald-400/10 to-cyan-400/10 rounded-full blur-3xl"
        />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 xl:gap-24 items-center">
          {/* Content */}
          <motion.div
            className="order-2 lg:order-1 relative xl:col-span-2 xl:max-w-4xl xl:mx-auto xl:text-center"
            initial={{ opacity: 0, x: -30 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, ease: [0.21, 0.47, 0.32, 0.98] }}
          >
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border border-indigo-200/50 dark:border-indigo-800/50 px-4 py-2 text-sm font-semibold text-indigo-700 dark:text-indigo-300 mb-8 backdrop-blur-sm xl:justify-center"
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
              >
                <Sparkles className="w-4 h-4" />
              </motion.div>
              Built for your job search
            </motion.div>

            {/* Title */}
            <motion.h2
              className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-gray-900 dark:text-white mb-8 tracking-tight leading-tight"
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.8, delay: 0.3 }}
            >
              About{" "}
              <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
                ApplySmart
              </span>
            </motion.h2>

            {/* Description */}
            <motion.div
              className="space-y-6 mb-12"
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              <p className="text-xl text-gray-700 dark:text-gray-300 leading-relaxed font-medium">
                Job searching should feel organized, informed, and focused.
                ApplySmart brings your essential tools into one workspace so you
                can present your best profile, tailor your resume, prepare with
                intent, and act on real market signals.
              </p>

              <p className="text-lg text-gray-600 dark:text-gray-400 leading-relaxed">
                The dashboard guides your next step. You can complete your
                profile, upload a resume, score it against a job description,
                generate a tailored cover letter, practice interview answers,
                and explore market insights with AI powered coaching.
              </p>

              {/* HERO EFFECT FOR LARGE SCREENS */}
              <HeroEffect />
            </motion.div>
          </motion.div>
        </div>

        {/* Features and Visual Section - Now in separate grid below */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 xl:gap-24 items-center mt-20">
          {/* Features Grid */}
          <motion.div
            className="order-1"
            initial={{ opacity: 0, x: -30 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.5 }}
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-12">
              {features.map((feature, index) => (
                <FeatureCard
                  key={feature.title}
                  feature={feature}
                  index={index}
                />
              ))}
            </div>

            {/* How it helps section */}
            <motion.div
              className="rounded-3xl bg-gradient-to-br from-white to-gray-50/50 dark:from-gray-800 dark:to-gray-800/50 border border-gray-200/50 dark:border-gray-700/50 p-8 shadow-xl shadow-gray-900/5 dark:shadow-gray-900/20 backdrop-blur-sm"
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.8, delay: 0.6 }}
              whileHover={{
                boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.15)",
                transition: { duration: 0.3 },
              }}
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="rounded-full bg-emerald-100 dark:bg-emerald-900/30 p-2">
                  <ShieldCheck className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                  How ApplySmart helps you
                </h3>
              </div>

              <ol className="space-y-4 list-none">
                {[
                  "Build your profile and upload your resume so the tools can personalize guidance.",
                  "Use ATS Resume Scoring, Cover Letters, and Mock Interviews to improve quality and confidence.",
                  "Explore Job Market Insights and ask the AI Career Coach for a focused seven day plan. Then apply and track progress.",
                ].map((step, index) => (
                  <motion.li
                    key={index}
                    className="flex items-start gap-4"
                    initial={{ opacity: 0, x: -20 }}
                    animate={isInView ? { opacity: 1, x: 0 } : {}}
                    transition={{ duration: 0.6, delay: 0.8 + index * 0.1 }}
                  >
                    <div className="shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-sm mt-0.5">
                      {index + 1}
                    </div>
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed pt-1">
                      {step}
                    </p>
                  </motion.li>
                ))}
              </ol>

              <motion.div
                className="mt-8 flex flex-col sm:flex-row gap-4"
                initial={{ opacity: 0, y: 20 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: 1.1 }}
              >
                <motion.a
                  href="#dashboard"
                  className="group inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-3 font-semibold shadow-lg shadow-indigo-500/25 hover:shadow-xl hover:shadow-indigo-500/30 transition-all duration-300"
                  whileHover={{ scale: 1.02, y: -1 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Open the Dashboard
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </motion.a>

                <motion.a
                  href="#features"
                  className="group inline-flex items-center justify-center rounded-xl bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-100 px-6 py-3 font-semibold hover:bg-gray-200 dark:hover:bg-gray-600 border border-gray-200 dark:border-gray-600 transition-all duration-300"
                  whileHover={{ scale: 1.02, y: -1 }}
                  whileTap={{ scale: 0.98 }}
                >
                  View Features
                </motion.a>
              </motion.div>
            </motion.div>
          </motion.div>

          {/* Visual */}
          <motion.div
            className="order-2"
            initial={{ opacity: 0, x: 30 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{
              duration: 0.8,
              delay: 0.2,
              ease: [0.21, 0.47, 0.32, 0.98],
            }}
          >
            <div className="relative">
              {/* Background decoration */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 via-purple-500/10 to-pink-500/10 rounded-3xl"
                animate={{
                  rotate: [0, 1, -1, 0],
                  scale: [1, 1.02, 1],
                }}
                transition={{
                  duration: 8,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />

              {/* Main card */}
              <motion.div
                className="relative bg-white/90 dark:bg-gray-800/90 p-8 lg:p-10 rounded-3xl shadow-2xl shadow-gray-900/10 dark:shadow-gray-900/30 border border-gray-200/50 dark:border-gray-700/50 backdrop-blur-sm"
                whileHover={{
                  y: -5,
                  boxShadow: "0 32px 64px -12px rgba(0, 0, 0, 0.15)",
                  transition: { duration: 0.3 },
                }}
              >
                {/* Stats grid */}
                <div className="grid grid-cols-2 gap-8 mb-8">
                  {stats.map((stat, index) => (
                    <StatCard key={stat.label} stat={stat} index={index} />
                  ))}
                </div>

                {/* Dashboard preview */}
                <motion.div
                  className="rounded-2xl border border-gray-200 dark:border-gray-700 p-6 bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 text-left"
                  initial={{ opacity: 0, y: 20 }}
                  animate={isInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.8, delay: 0.8 }}
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-3 h-3 rounded-full bg-gradient-to-r from-green-400 to-emerald-500"></div>
                    <div className="w-3 h-3 rounded-full bg-gradient-to-r from-yellow-400 to-amber-500"></div>
                    <div className="w-3 h-3 rounded-full bg-gradient-to-r from-red-400 to-rose-500"></div>
                  </div>

                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed font-medium">
                    Your dashboard highlights the next best step. It shows
                    profile completion, application activity, interview
                    practice, ATS scores, and current job market trends.
                  </p>

                  <div className="mt-4 flex items-center gap-2 text-sm text-indigo-600 dark:text-indigo-400 font-medium">
                    <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></div>
                    Live insights powered by AI
                  </div>
                </motion.div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

// Services Section Component
const services = [
  {
    icon: Target,
    title: "Mock Interview",
    description:
      "Practice realistic questions and receive structured feedback to improve quickly. Track your progress and refine your answers over time.",
    gradient: "from-blue-600 to-cyan-600",
    features: [
      "AI-powered feedback",
      "Progress tracking",
      "Industry-specific questions",
    ],
    stats: "95% confidence boost",
  },
  {
    icon: Zap,
    title: "ATS Resume Scoring",
    description:
      "Compare your resume against a job description and receive a score with precise improvements.",
    gradient: "from-purple-600 to-pink-600",
    features: [
      "Real-time scoring",
      "Keyword optimization",
      "Format suggestions",
    ],
    stats: "3x better match rate",
  },
  {
    icon: Shield,
    title: "Cover Letter Generator",
    description:
      "Generate concise, role specific cover letters that highlight your value. Personalize the tone and add company details for a stronger pitch.",
    gradient: "from-emerald-600 to-teal-600",
    features: [
      "Role-specific content",
      "Company research",
      "Tone customization",
    ],
    stats: "2x response rate",
  },
  {
    icon: User,
    title: "Career Coaching",
    description:
      "Ask AI Career Coach for targeted guidance and a focused plan aligned to your goals and current market trends.",
    gradient: "from-orange-600 to-red-600",
    features: ["Personalized plans", "Market insights", "Goal tracking"],
    stats: "7-day action plans",
  },
  {
    icon: Briefcase,
    title: "Job Search",
    description: "Discover roles that fit your skills and preferences.",
    gradient: "from-indigo-600 to-purple-600",
    features: ["Smart matching", "Skill assessment", "Application tracking"],
    stats: "5x more relevant matches",
  },
  {
    icon: Sparkles,
    title: "Market Insights",
    description:
      "Track hiring trends, skills demand, and sector movements with curated job market news. Use insights to prioritize skills and target the right roles.",
    gradient: "from-pink-600 to-rose-600",
    features: ["Real-time data", "Trend analysis", "Skills forecasting"],
    stats: "Daily market updates",
  },
];

const ServiceCard = ({ service, index }) => {
  const [isHovered, setIsHovered] = useState(false);
  const { icon: Icon, title, description, gradient, features, stats } = service;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{
        duration: 0.6,
        delay: index * 0.1,
        ease: [0.21, 0.47, 0.32, 0.98],
      }}
      whileHover={{
        y: -8,
        transition: { duration: 0.3, ease: "easeOut" },
      }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className="group relative overflow-hidden"
    >
      {/* Main Card */}
      <div
        className={`relative rounded-3xl p-8 bg-gradient-to-br ${gradient} shadow-lg shadow-gray-900/10 hover:shadow-2xl hover:shadow-gray-900/20 transition-all duration-500`}
      >
        {/* Animated background overlay */}
        <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-3xl" />

        {/* Subtle pattern overlay */}
        <div className="absolute inset-0 opacity-20 group-hover:opacity-30 transition-opacity duration-500">
          <div className="absolute top-4 right-4 w-32 h-32 bg-white/10 rounded-full transform translate-x-16 -translate-y-16" />
          <div className="absolute bottom-4 left-4 w-24 h-24 bg-white/5 rounded-full transform -translate-x-12 translate-y-12" />
        </div>

        <div className="relative z-10">
          {/* Icon with animation */}
          <motion.div
            className="mb-6"
            whileHover={{
              scale: 1.1,
              rotate: [0, -5, 5, 0],
              transition: { duration: 0.4 },
            }}
          >
            <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center group-hover:bg-white/30 transition-colors duration-300">
              <Icon className="w-8 h-8 text-white" />
            </div>
          </motion.div>

          {/* Title */}
          <h3 className="text-2xl font-bold text-white mb-4 group-hover:text-white/95 transition-colors">
            {title}
          </h3>

          {/* Description */}
          <p className="text-white/90 text-sm leading-relaxed mb-6 group-hover:text-white/95 transition-colors">
            {description}
          </p>

          {/* Features List */}
          <div className="space-y-2 mb-6">
            {features.map((feature, idx) => (
              <motion.div
                key={idx}
                className="flex items-center gap-2 text-white/80 text-xs"
                initial={{ opacity: 0, x: -10 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + idx * 0.1 }}
              >
                <CheckCircle className="w-3 h-3 text-white/60" />
                <span>{feature}</span>
              </motion.div>
            ))}
          </div>

          {/* Stats */}
          <div className="flex items-center justify-between">
            <div className="text-white/70 text-xs font-semibold uppercase tracking-wider">
              {stats}
            </div>

            <motion.div
              className="opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              whileHover={{ x: 3 }}
            >
              <ArrowRight className="w-4 h-4 text-white/80" />
            </motion.div>
          </div>
        </div>

        {/* Hover glow effect */}
        <motion.div
          className="absolute inset-0 rounded-3xl"
          initial={{ opacity: 0 }}
          animate={{ opacity: isHovered ? 1 : 0 }}
          transition={{ duration: 0.3 }}
          style={{
            background: `linear-gradient(45deg, rgba(255,255,255,0.1), transparent)`,
            filter: "blur(0.5px)",
          }}
        />
      </div>
    </motion.div>
  );
};

const HeroPattern = () => {
  return (
    <motion.div
      className="absolute top-0 right-0 w-1/2 h-full hidden xl:block pointer-events-none opacity-30"
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 0.3, scale: 1 }}
      transition={{ duration: 1.2, delay: 0.5 }}
    >
      <div className="absolute inset-0 overflow-hidden">
        {/* Floating geometric shapes */}
        <motion.div
          className="absolute top-20 right-20 w-20 h-20 bg-gradient-to-br from-indigo-400/20 to-purple-400/20 rounded-full blur-xl"
          animate={{
            y: [0, -20, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute top-40 right-40 w-16 h-16 bg-gradient-to-br from-blue-400/15 to-cyan-400/15 rounded-2xl rotate-45 blur-lg"
          animate={{
            y: [0, 15, 0],
            rotate: [45, 75, 45],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1,
          }}
        />
        <motion.div
          className="absolute bottom-40 right-10 w-12 h-12 bg-gradient-to-br from-emerald-400/20 to-teal-400/20 rounded-full blur-lg"
          animate={{
            x: [0, 10, 0],
            y: [0, -10, 0],
          }}
          transition={{
            duration: 7,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2,
          }}
        />
      </div>
    </motion.div>
  );
};

const ServicesSection = () => {
  const containerRef = useRef(null);
  const isInView = useInView(containerRef, { once: true, margin: "-100px" });
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });

  const y = useTransform(scrollYProgress, [0, 1], [0, -30]);

  return (
    <section
      id="services"
      ref={containerRef}
      className="relative py-32 bg-gradient-to-b from-white via-gray-50/30 to-white dark:from-gray-900 dark:via-gray-800/30 dark:to-gray-900 overflow-hidden"
    >
      {/* Background decoration */}
      <div className="absolute inset-0">
        <motion.div
          style={{ y }}
          className="absolute top-20 left-20 w-96 h-96 bg-gradient-to-r from-indigo-500/5 to-purple-500/5 rounded-full blur-3xl"
        />
        <motion.div
          style={{ y: useTransform(y, (v) => v * -0.8) }}
          className="absolute bottom-20 right-20 w-80 h-80 bg-gradient-to-r from-emerald-500/5 to-cyan-500/5 rounded-full blur-3xl"
        />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header - Centered on large screens */}
        <motion.div
          className="text-center mb-20 xl:max-w-4xl xl:mx-auto relative"
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, ease: [0.21, 0.47, 0.32, 0.98] }}
        >
          {/* Hero Pattern for large screens */}
          <HeroPattern />

          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={isInView ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border border-indigo-200/50 dark:border-indigo-800/50 px-5 py-2 text-sm font-semibold text-indigo-700 dark:text-indigo-300 mb-8 backdrop-blur-sm"
          >
            <TrendingUp className="w-4 h-4" />
            Accelerate Your Career
          </motion.div>

          <motion.h2
            className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-gray-900 dark:text-white mb-6 tracking-tight leading-tight"
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            Our{" "}
            <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
              Services
            </span>
          </motion.h2>

          <motion.p
            className="text-xl text-gray-600 dark:text-gray-400 leading-relaxed font-medium"
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            Comprehensive tools and services to accelerate your job search and
            career growth with AI-powered insights and personalized guidance.
          </motion.p>
        </motion.div>

        {/* Services Grid */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8"
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ duration: 0.8, delay: 0.6 }}
        >
          {services.map((service, index) => (
            <ServiceCard key={service.title} service={service} index={index} />
          ))}
        </motion.div>

        {/* Call to Action */}
        <motion.div
          className="text-center mt-20"
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 1 }}
        >
          <motion.div
            className="inline-flex flex-col sm:flex-row items-center gap-4"
            whileHover={{ scale: 1.02 }}
          >
            <motion.a
              href="#dashboard"
              className="group inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-8 py-4 font-semibold text-lg shadow-lg shadow-indigo-500/25 hover:shadow-xl hover:shadow-indigo-500/30 transition-all duration-300"
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.98 }}
            >
              Get Started Today
              <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </motion.a>

            <span className="text-gray-500 dark:text-gray-400 font-medium">
              Start your journey to career success
            </span>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

// Integrations / Providers Section with left→right marquee that pauses on hover
const providers = [
  {
    name: "Adzuna",
    role: "Job listings",
    img: "/adzuna.png",
    href: "https://developer.adzuna.com/overview",
    description: "Global job search engine with millions of listings",
    icon: Globe,
    color: "from-blue-500 to-cyan-500",
  },
  {
    name: "YCombinator",
    role: "Job listings",
    img: "/ycombinator.png",
    href: "https://www.ycombinator.com/jobs",
    description: "Startup job board with top tech companies",
    icon: Rocket,
    color: "from-yellow-500 to-amber-500",
  },
  {
    name: "Jooble",
    role: "Job listings",
    img: "/jooble.png",
    href: "https://jooble.org/api/about",
    description: "International job board aggregator",
    icon: Globe,
    color: "from-emerald-500 to-teal-500",
  },
  {
    name: "Newsdata.io",
    role: "Job market news",
    img: "/newsdataapi.png",
    href: "https://newsdata.io/",
    description: "Real-time news and market insights",
    icon: Zap,
    color: "from-amber-500 to-orange-500",
  },
  {
    name: "Google Gemini",
    role: "AI career coaching",
    img: "/gemini.jpg",
    href: "https://ai.google.dev/",
    description: "Advanced AI for personalized career guidance",
    icon: Brain,
    color: "from-violet-500 to-purple-500",
  },
  {
    name: "Google OAuth",
    role: "Secure auth",
    img: "/google.jpg",
    href: "https://developers.google.com/identity",
    description: "Enterprise-grade authentication",
    icon: Shield,
    color: "from-red-500 to-pink-500",
  },
  {
    name: "RapidAPI",
    role: "API gateway",
    img: "/rapidapi.png",
    href: "https://rapidapi.com/",
    description: "Unified API management platform",
    icon: Zap,
    color: "from-indigo-500 to-blue-500",
  },
  {
    name: "Geolocation",
    role: "Location signals",
    img: "/geolocation.png",
    href: "#",
    description: "Smart location-based job matching",
    icon: MapPin,
    color: "from-cyan-500 to-blue-500",
  },
  {
    name: "GitHub",
    role: "Dev tooling",
    img: "/github.png",
    href: "https://github.com/",
    description: "Developer portfolio integration",
    icon: Code,
    color: "from-gray-600 to-gray-800",
  },
];

const ProviderCard = ({ provider, index, isHovered, onHover }) => {
  const { name, role, img, href, description, icon: Icon, color } = provider;

  return (
    <motion.div
      className="group relative flex-shrink-0 w-80"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      onHoverStart={() => onHover(index)}
      onHoverEnd={() => onHover(null)}
    >
      <motion.a
        href={href}
        target={href === "#" ? "_self" : "_blank"}
        rel={href === "#" ? undefined : "noopener noreferrer"}
        className="block relative overflow-hidden rounded-2xl bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 shadow-lg hover:shadow-2xl transition-all duration-500 p-6"
        whileHover={{
          y: -8,
          scale: 1.02,
          transition: { duration: 0.3, ease: "easeOut" },
        }}
      >
        {/* Animated background gradient */}
        <div
          className={`absolute inset-0 bg-gradient-to-br ${color} opacity-0 group-hover:opacity-5 transition-opacity duration-500`}
        />

        {/* Content */}
        <div className="relative z-10">
          {/* Logo and Icon */}
          <div className="flex items-center gap-4 mb-4">
            <div className="relative">
              <img
                src={img}
                alt={`${name} logo`}
                className="h-12 w-12 object-contain rounded-lg group-hover:scale-110 transition-transform duration-300"
                loading="lazy"
              />
              {/* Floating icon */}
              <motion.div
                className={`absolute -top-2 -right-2 w-6 h-6 rounded-full bg-gradient-to-br ${color} flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300`}
                whileHover={{ scale: 1.1, rotate: 180 }}
                transition={{ duration: 0.3 }}
              >
                <Icon className="w-3 h-3 text-white" />
              </motion.div>
            </div>

            <div className="flex-1">
              <h3 className="font-bold text-gray-900 dark:text-white group-hover:text-gray-800 dark:group-hover:text-gray-100 transition-colors">
                {name}
              </h3>
              <p
                className={`text-sm font-medium bg-gradient-to-r ${color} bg-clip-text text-transparent`}
              >
                {role}
              </p>
            </div>

            <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300 opacity-0 group-hover:opacity-100 transition-all duration-300" />
          </div>

          {/* Description */}
          <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed group-hover:text-gray-700 dark:group-hover:text-gray-300 transition-colors">
            {description}
          </p>

          {/* Status indicator */}
          <div className="flex items-center gap-2 mt-4">
            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            <span className="text-xs text-gray-500 font-medium">
              Active Integration
            </span>
          </div>
        </div>

        {/* Hover border effect */}
        <motion.div
          className={`absolute inset-0 rounded-2xl ring-1 ring-inset bg-gradient-to-r ${color} opacity-0 group-hover:opacity-20 transition-opacity duration-300`}
        />
      </motion.a>
    </motion.div>
  );
};

const FloatingElements = () => {
  return (
    <motion.div
      className="absolute top-0 right-0 w-1/2 h-full hidden xl:block pointer-events-none opacity-20"
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 0.2, scale: 1 }}
      transition={{ duration: 1.5, delay: 0.8 }}
    >
      <div className="absolute inset-0 overflow-hidden">
        {/* Network visualization */}
        <motion.div
          className="absolute top-16 right-16 w-24 h-24"
          animate={{
            rotate: 360,
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear",
          }}
        >
          <div className="w-full h-full border-2 border-dashed border-indigo-300/30 rounded-full" />
          <div className="absolute inset-4 border border-purple-300/40 rounded-full" />
          <div className="absolute inset-8 w-2 h-2 bg-indigo-400/50 rounded-full top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
        </motion.div>

        <motion.div
          className="absolute top-40 right-32 w-6 h-6 bg-gradient-to-br from-emerald-400/30 to-cyan-400/30 rounded-full blur-sm"
          animate={{
            y: [0, -15, 0],
            x: [0, 10, 0],
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        <motion.div
          className="absolute bottom-32 right-20 w-4 h-4 bg-gradient-to-br from-violet-400/40 to-purple-400/40 rounded blur-sm"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.4, 0.6, 0.4],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1,
          }}
        />
      </div>
    </motion.div>
  );
};

const IntegrationsSection = () => {
  const containerRef = useRef(null);
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const isInView = useInView(containerRef, { once: true, margin: "-100px" });
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });

  const y = useTransform(scrollYProgress, [0, 1], [0, -50]);

  // Duplicate for seamless loop
  const loopProviders = [...providers, ...providers];

  return (
    <section
      id="integrations"
      ref={containerRef}
      className="relative py-32 bg-gradient-to-b from-gray-50/80 via-white to-gray-50/80 dark:from-gray-900/80 dark:via-gray-900 dark:to-gray-900/80 overflow-hidden"
    >
      {/* Background decoration */}
      <div className="absolute inset-0">
        <motion.div
          style={{ y }}
          className="absolute top-32 left-20 w-72 h-72 bg-gradient-to-r from-indigo-400/5 to-purple-400/5 rounded-full blur-3xl"
        />
        <motion.div
          style={{ y: useTransform(y, (v) => v * -0.7) }}
          className="absolute bottom-32 right-20 w-96 h-96 bg-gradient-to-r from-cyan-400/5 to-blue-400/5 rounded-full blur-3xl"
        />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header - Centered on large screens */}
        <motion.div
          className="text-center mb-20 xl:max-w-4xl xl:mx-auto relative"
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, ease: [0.21, 0.47, 0.32, 0.98] }}
        >
          {/* Floating elements for large screens */}
          <FloatingElements />

          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={isInView ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border border-indigo-200/50 dark:border-indigo-800/50 px-5 py-2 text-sm font-semibold text-indigo-700 dark:text-indigo-300 mb-8 backdrop-blur-sm"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
            >
              <Sparkles className="w-4 h-4" />
            </motion.div>
            Trusted Integrations
          </motion.div>

          <motion.h2
            className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-gray-900 dark:text-white mb-6 tracking-tight leading-tight"
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            Powered by our{" "}
            <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
              integrations
            </span>
          </motion.h2>

          <motion.p
            className="text-xl text-gray-600 dark:text-gray-400 leading-relaxed font-medium"
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            These trusted APIs power search, scoring, news, and AI coaching
            across ApplySmart, delivering real-time insights and personalized
            career guidance.
          </motion.p>
        </motion.div>

        {/* Enhanced Marquee Section */}
        <motion.div
          className="relative"
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.6 }}
        >
          {/* Marquee Container with modern styling */}
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-white/90 via-gray-50/50 to-white/90 dark:from-gray-800/90 dark:via-gray-700/50 dark:to-gray-800/90 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 shadow-xl shadow-gray-900/5 dark:shadow-gray-900/20 py-8 group">
            {/* Gradient masks for smooth fade */}
            <div className="pointer-events-none absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-white/90 to-transparent dark:from-gray-800/90 z-10" />
            <div className="pointer-events-none absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-white/90 to-transparent dark:from-gray-800/90 z-10" />

            {/* Tailwind-only animated track */}
            <div className="flex w-max items-center gap-8 animate-marquee-ltr group-hover:[animation-play-state:paused] motion-reduce:animate-none">
              {loopProviders.map((provider, index) => (
                <ProviderCard
                  key={`${provider.name}-${index}`}
                  provider={provider}
                  index={index}
                  isHovered={hoveredIndex === index}
                  onHover={setHoveredIndex}
                />
              ))}
            </div>
          </div>

          {/* Trust indicators */}
          <motion.div
            className="flex items-center justify-center gap-8 mt-12"
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : {}}
            transition={{ duration: 0.8, delay: 1 }}
          >
            <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
              <CheckCircle className="w-5 h-5" />
              <span className="font-semibold">99.9% Uptime</span>
            </div>
            <div className="w-px h-8 bg-gray-300 dark:bg-gray-600" />
            <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
              <Shield className="w-5 h-5" />
              <span className="font-semibold">Enterprise Security</span>
            </div>
            <div className="w-px h-8 bg-gray-300 dark:bg-gray-600" />
            <div className="flex items-center gap-2 text-purple-600 dark:text-purple-400">
              <Zap className="w-5 h-5" />
              <span className="font-semibold">Real-time Data</span>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

function LandingPage() {
  return (
    <>
      <Navigation />
      <HeroSection />
      <AuthSection />
      <AboutSection />
      <ServicesSection />
      <IntegrationsSection />
    </>
  );
}

function AppLayout() {
  const location = useLocation();

  return (
    <div className="min-h-screen w-full overflow-x-hidden bg-white p-0">
      <Routes>
        <Route element={<PublicRoute />}>
          <Route path="/" element={<LandingPage />} />
          <Route path="/auth/google/callback" element={<GoogleCallback />} />
        </Route>

        <Route element={<PrivateRoute />}>
          <Route path="/dashboard/*" element={<Dashboard />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      {!location.pathname.startsWith("/dashboard") && <Footer />}
    </div>
  );
}


function App() {
  return (
    <GoogleOAuthProvider clientId={process.env.REACT_APP_GOOGLE_CLIENT_ID}>
      <AppLayout />
    </GoogleOAuthProvider>
  );
}

export default App;

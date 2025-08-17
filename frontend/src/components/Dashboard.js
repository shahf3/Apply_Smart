import React, { useState, useEffect, lazy, Suspense } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  User,
  FileText,
  BarChart3,
  Search,
  PenTool,
  Mic,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
  Bell,
  Home,
  AlertCircle,
  Settings,
  Zap,
  Sun,
  Moon,
  Sparkles,
  Target,
  Clock,
  Activity,
  ArrowUpRight
} from 'lucide-react'

import SidebarItem from './SidebarItem'
import StatCard from './StatCard'

const ProfileSummary = lazy(() => import('./ProfileSummary'))
const ResumeUpload = lazy(() => import('./ResumeUpload'))
const ATSScoringCard = lazy(() => import('./ATSScoringCard'))
const JobSearchResults = lazy(() => import('./JobSearchResults'))
const CoverLetterGenerator = lazy(() => import('./CoverLetterGenerator'))
const MockInterview = lazy(() => import('./MockInterview'))
const JobMarketCoach = React.lazy(() => import('./JobMarketCoach'))

function Dashboard () {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [, setUserId] = useState(null)
  const [userName, setUserName] = useState('')
  const [activeSection, setActiveSection] = useState('overview')
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)
  const [profileCompletion, setProfileCompletion] = useState(0)
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [notifications] = useState(3)
  const [dashboardStats, setDashboardStats] = useState({
    applications: 0,
    interviews: 0,
    atsScore: 0,
    profileCompletion: 0
  })
  const [recentActivities, setRecentActivities] = useState([])

  useEffect(() => {
    const prefersDark =
      window.matchMedia &&
      window.matchMedia('(prefers-color-scheme: dark)').matches
    setIsDarkMode(prefersDark)
  }, [])

  useEffect(() => {
    const initializeDashboard = async () => {
      try {
        const storedId = localStorage.getItem('user_id')
        const storedName = localStorage.getItem('user_name')
        if (storedId) {
          setUserId(storedId)
          setUserName(storedName || 'User')
          const completionPercentage = calculateProfileCompletion()
          setProfileCompletion(completionPercentage)
          await loadDashboardStats(storedId)
          await loadRecentActivities(storedId)
        } else {
          setError('User not logged in.')
        }
      } catch (err) {
        console.error('Dashboard initialization error:', err)
        setError('Failed to load dashboard data.')
      } finally {
        setLoading(false)
      }
    }
    initializeDashboard()
    //loadDashboardStats();
    const handleResize = () => {
      if (window.innerWidth >= 1024) setIsSidebarOpen(false)
      if (window.innerWidth >= 1280) setIsSidebarCollapsed(false)
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const calculateProfileCompletion = () => {
    let completion = 0
    const fields = [
      'user_name',
      'user_email',
      'user_bio',
      'user_skills',
      'user_experience',
      'user_education'
    ]
    fields.forEach(field => {
      if (localStorage.getItem(field)) completion += 100 / fields.length
    })
    return Math.round(completion)
  }

  const loadDashboardStats = async uid => {
    try {
      const savedStats = localStorage.getItem(`dashboard_stats_${uid}`)
      if (savedStats) {
        setDashboardStats(JSON.parse(savedStats))
      } else {
        const defaultStats = {
          applications: Math.floor(Math.random() * 20) + 5,
          interviews: Math.floor(Math.random() * 5) + 1,
          atsScore: Math.floor(Math.random() * 30) + 70,
          profileCompletion: calculateProfileCompletion()
        }
        setDashboardStats(defaultStats)
        localStorage.setItem(
          `dashboard_stats_${uid}`,
          JSON.stringify(defaultStats)
        )
      }
    } catch (error) {
      console.error('Error loading dashboard stats:', error)
    }
  }

  const loadRecentActivities = async uid => {
    try {
      const savedActivities = localStorage.getItem(`recent_activities_${uid}`)
      if (savedActivities) {
        setRecentActivities(JSON.parse(savedActivities))
      } else {
        const defaultActivities = [
          {
            type: 'resume',
            title: 'Resume uploaded successfully',
            time: '2 hours ago',
            status: 'completed',
            icon: FileText
          },
          {
            type: 'job',
            title: 'Applied to Software Engineer position',
            time: '1 day ago',
            status: 'completed',
            icon: Search
          },
          {
            type: 'interview',
            title: 'Mock interview completed',
            time: '2 days ago',
            status: 'completed',
            icon: Mic
          }
        ]
        setRecentActivities(defaultActivities)
      }
    } catch (error) {
      console.error('Error loading recent activities:', error)
      setRecentActivities([])
    }
  }

  const sidebarItems = [
    {
      id: 'overview',
      label: 'Overview',
      icon: Home,
      description: 'Dashboard Overview',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      gradient: 'from-blue-500 to-indigo-600'
    },
    {
      id: 'profile',
      label: 'Profile',
      icon: User,
      description: 'Personal Information',
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
      gradient: 'from-emerald-500 to-teal-600'
    },
    {
      id: 'resume',
      label: 'Resume',
      icon: FileText,
      description: 'Document Management',
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      gradient: 'from-purple-500 to-violet-600'
    },
    {
      id: 'ats',
      label: 'ATS Scoring',
      icon: BarChart3,
      description: 'Optimization Analysis',
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      gradient: 'from-orange-500 to-red-600'
    },
    {
      id: 'jobs',
      label: 'Job Search',
      icon: Search,
      description: 'Opportunity Discovery',
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50',
      gradient: 'from-indigo-500 to-blue-600'
    },
    {
      id: 'coverletter',
      label: 'Cover Letter',
      icon: PenTool,
      description: 'Letter Generation',
      color: 'text-pink-600',
      bgColor: 'bg-pink-50',
      gradient: 'from-pink-500 to-rose-600'
    },
    {
      id: 'interview',
      label: 'Mock Interview',
      icon: Mic,
      description: 'Interview Practice',
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      gradient: 'from-red-500 to-pink-600'
    },
    {
      id: 'job-market',
      label: 'Job Market Insights',
      icon: BarChart3,
      description: 'Market Trends and Analysis',
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      gradient: 'from-orange-500 to-red-600'
    }
  ]

  const overviewStats = [
    {
      title: 'Profile Completion',
      value: `${profileCompletion}%`,
      change:
        profileCompletion > 50 ? '+5% this week' : 'Complete your profile',
      icon: User,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      gradient: 'from-blue-500 to-indigo-600'
    },
    {
      title: 'Applications Sent',
      value: dashboardStats.applications.toString(),
      change:
        dashboardStats.applications > 0 ? '+12% this month' : 'Start applying',
      icon: FileText,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
      borderColor: 'border-emerald-200',
      gradient: 'from-emerald-500 to-teal-600'
    },
    {
      title: 'Interview Invites',
      value: dashboardStats.interviews.toString(),
      change:
        dashboardStats.interviews > 0 ? '+25% success rate' : 'Keep applying',
      icon: Mic,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-200',
      gradient: 'from-purple-500 to-violet-600'
    },
    {
      title: 'ATS Score',
      value:
        dashboardStats.atsScore > 0
          ? `${dashboardStats.atsScore}/100`
          : 'Not tested',
      change: dashboardStats.atsScore > 0 ? '+3 points' : 'Test your resume',
      icon: BarChart3,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      borderColor: 'border-orange-200',
      gradient: 'from-orange-500 to-red-600'
    }
  ]

  const getRecentActivities = () => {
    if (recentActivities.length > 0) return recentActivities
    return [
      {
        type: 'welcome',
        title: 'Welcome to ApplySmart Dashboard',
        time: 'Just now',
        status: 'info',
        icon: User
      }
    ]
  }

  const renderOverview = () => (
    <div className='space-y-8 md:space-y-10'>
      {/* Enhanced Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className='relative bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 dark:from-indigo-700 dark:via-purple-700 dark:to-pink-700 rounded-2xl md:rounded-3xl p-6 md:p-8 lg:p-10 text-white shadow-xl overflow-hidden'
      >
        {/* Animated background elements */}
        <div className='absolute inset-0 bg-black/10'></div>
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
          className='absolute -top-1/4 -right-1/4 w-1/2 h-1/2 bg-gradient-to-br from-white/10 to-transparent rounded-full blur-3xl'
        />
        <motion.div
          animate={{ rotate: -360 }}
          transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
          className='absolute -bottom-1/4 -left-1/4 w-1/2 h-1/2 bg-gradient-to-tr from-yellow-400/10 to-transparent rounded-full blur-2xl'
        />

        <div className='relative z-10'>
          <div className='flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6'>
            <div className='flex-1'>
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className='flex items-center gap-2 mb-4'
              >
                <Sparkles className='w-5 h-5 text-yellow-300' />
                <span className='text-yellow-200 font-semibold text-sm'>
                  Premium Dashboard
                </span>
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className='text-3xl md:text-4xl lg:text-5xl font-bold mb-3 leading-tight'
              >
                Welcome back, <br className='hidden sm:block' />
                <span className='text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 to-pink-200'>
                  {userName}
                </span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
                className='text-md md:text-lg text-indigo-100 mb-6 max-w-xl leading-relaxed'
              >
                Your career journey continues. Let's achieve something
                extraordinary.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className='flex flex-col sm:flex-row gap-3'
              >
                <motion.button
                  whileHover={{ scale: 1.05, y: -1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setActiveSection('profile')}
                  className='group bg-white/20 backdrop-blur-lg border border-white/30 text-white px-5 py-2.5 rounded-lg font-semibold hover:bg-white/30 transition-all duration-300 flex items-center justify-center sm:justify-start gap-2 text-sm'
                >
                  <Target className='w-4 h-4' />
                  Complete Profile
                  <ArrowUpRight className='w-4 h-4 opacity-70 group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform' />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05, y: -1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setActiveSection('jobs')}
                  className='group bg-white text-indigo-600 px-5 py-2.5 rounded-lg font-semibold hover:bg-gray-50 transition-all duration-300 flex items-center justify-center sm:justify-start gap-2 shadow-lg text-sm'
                >
                  <Search className='w-4 h-4' />
                  Discover Jobs
                </motion.button>
              </motion.div>
            </div>

            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.6 }}
              className='hidden lg:block'
            >
              <div className='relative w-48 h-48'>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{
                    duration: 15,
                    repeat: Infinity,
                    ease: 'linear'
                  }}
                  className='w-full h-full bg-gradient-to-br from-white/20 to-white/5 rounded-full flex items-center justify-center backdrop-blur-sm border border-white/20'
                >
                  <motion.div
                    animate={{ rotate: -360 }}
                    transition={{
                      duration: 10,
                      repeat: Infinity,
                      ease: 'linear'
                    }}
                    className='w-24 h-24 bg-gradient-to-br from-yellow-300 to-pink-300 rounded-full flex items-center justify-center shadow-xl'
                  >
                    <Zap className='w-12 h-12 text-indigo-600' />
                  </motion.div>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* Enhanced Stats Grid */}
      <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6'>
        {overviewStats.map((stat, index) => (
          <StatCard key={stat.title} stat={stat} index={index} />
        ))}
      </div>

      {/* Enhanced Content Grid */}
      <div className='grid grid-cols-1 xl:grid-cols-3 gap-6 md:gap-8'>
        {/* Recent Activity with enhanced design */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className='xl:col-span-2 bg-white dark:bg-gray-800/50 rounded-2xl p-6 shadow-lg border border-gray-100/50 dark:border-gray-700/50'
        >
          <div className='flex items-center justify-between mb-6'>
            <div className='flex items-center gap-3'>
              <div className='p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg shadow-md'>
                <Activity className='w-5 h-5 text-white' />
              </div>
              <div>
                <h2 className='text-xl font-bold text-gray-900 dark:text-white'>
                  Recent Activity
                </h2>
                <p className='text-gray-500 dark:text-gray-400 text-sm'>
                  Your latest achievements
                </p>
              </div>
            </div>
            <div className='hidden sm:flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-700/50 px-3 py-1.5 rounded-lg'>
              <Clock className='w-3 h-3' />
              Last 7 days
            </div>
          </div>

          <div className='space-y-3'>
            {getRecentActivities()
              .slice(0, 5)
              .map((activity, index) => (
                <motion.div
                  key={activity.id || index}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 + 0.5 }}
                  whileHover={{ x: 4, transition: { duration: 0.2 } }}
                  className='group flex items-center gap-4 p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-lg transition-colors duration-200 cursor-pointer'
                >
                  <motion.div
                    className={`p-2.5 ${
                      activity.status === 'completed'
                        ? 'bg-gradient-to-br from-emerald-500 to-teal-600'
                        : 'bg-gradient-to-br from-blue-500 to-indigo-600'
                    } rounded-lg shadow-md group-hover:shadow-lg transition-shadow duration-200`}
                  >
                    <activity.icon className='w-5 h-5 text-white' />
                  </motion.div>
                  <div className='flex-1'>
                    <p className='font-semibold text-gray-800 dark:text-gray-100 text-sm'>
                      {activity.title}
                    </p>
                    <p className='text-gray-500 dark:text-gray-400 text-xs mt-0.5'>
                      {activity.time}
                    </p>
                  </div>
                  <motion.div
                    className={`w-2 h-2 rounded-full ${
                      activity.status === 'completed'
                        ? 'bg-emerald-500'
                        : 'bg-blue-500'
                    }`}
                  />
                </motion.div>
              ))}
          </div>
        </motion.div>

        {/* Enhanced Quick Actions */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
          className='bg-white dark:bg-gray-800/50 rounded-2xl p-6 shadow-lg border border-gray-100/50 dark:border-gray-700/50'
        >
          <div className='flex items-center gap-3 mb-6'>
            <div className='p-2 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg shadow-md'>
              <Zap className='w-5 h-5 text-white' />
            </div>
            <div>
              <h2 className='text-xl font-bold text-gray-900 dark:text-white'>
                Quick Actions
              </h2>
              <p className='text-gray-500 dark:text-gray-400 text-sm'>
                Start your journey
              </p>
            </div>
          </div>

          <div className='space-y-3'>
            {sidebarItems.slice(1).map((item, index) => (
              <motion.button
                key={item.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 + 0.6 }}
                whileHover={{ scale: 1.03, y: -1 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => setActiveSection(item.id)}
                className={`w-full p-4 bg-gradient-to-r ${item.gradient} rounded-lg text-white hover:shadow-lg transition-all duration-300 text-left group relative overflow-hidden`}
              >
                <div className='relative z-10 flex items-center gap-3'>
                  <item.icon className='w-5 h-5' />
                  <div className='flex-1'>
                    <h3 className='font-semibold text-sm'>{item.label}</h3>
                    <p className='text-xs text-white/80'>{item.description}</p>
                  </div>
                  <ArrowUpRight className='w-4 h-4 opacity-70 group-hover:opacity-100 transition-opacity' />
                </div>
              </motion.button>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  )

  const renderActiveSection = () => {
    const LoadingFallback = () => (
      <div className='flex items-center justify-center h-64'>
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
          className='w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full'
        />
      </div>
    )

    switch (activeSection) {
      case 'overview':
        return renderOverview()
      case 'profile':
        return (
          <Suspense fallback={<LoadingFallback />}>
            <ProfileSummary />
          </Suspense>
        )
      case 'resume':
        return (
          <Suspense fallback={<LoadingFallback />}>
            <ResumeUpload />
          </Suspense>
        )
      case 'ats':
        return (
          <Suspense fallback={<LoadingFallback />}>
            <ATSScoringCard />
          </Suspense>
        )
      case 'jobs':
        return (
          <Suspense fallback={<LoadingFallback />}>
            <JobSearchResults />
          </Suspense>
        )
      case 'coverletter':
        return (
          <Suspense fallback={<LoadingFallback />}>
            <CoverLetterGenerator />
          </Suspense>
        )
      case 'interview':
        return (
          <Suspense fallback={<LoadingFallback />}>
            <MockInterview />
          </Suspense>
        )
      case 'job-market':
        return (
          <React.Suspense fallback={<div className='p-8'>Loading...</div>}>
            <JobMarketCoach />
          </React.Suspense>
        )

      default:
        return renderOverview()
    }
  }

  const getSectionInfo = () =>
    sidebarItems.find(item => item.id === activeSection) || sidebarItems[0]

  if (loading) {
    return (
      <div className='min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center'>
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className='bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-2xl text-center'
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
            className='w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4'
          />
          <h2 className='text-xl font-bold text-gray-900 dark:text-white mb-2'>
            Loading ApplySmart
          </h2>
          <p className='text-gray-600 dark:text-gray-400'>
            Preparing your dashboard...
          </p>
        </motion.div>
      </div>
    )
  }

  if (error) {
    return (
      <div className='min-h-screen bg-red-50 dark:bg-red-900/20 flex items-center justify-center p-4'>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className='bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-2xl max-w-md w-full text-center'
        >
          <AlertCircle className='w-16 h-16 text-red-600 mx-auto mb-4' />
          <h2 className='text-2xl font-bold text-gray-900 dark:text-white mb-2'>
            Oops! Something went wrong
          </h2>
          <p className='text-red-600 dark:text-red-400 mb-6'>{error}</p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => (window.location.href = '/')}
            className='w-full px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors'
          >
            Return to Login
          </motion.button>
        </motion.div>
      </div>
    )
  }

  return (
    <div
      className={`min-h-screen ${
        isDarkMode
          ? 'dark bg-gray-900 text-gray-200'
          : 'bg-gray-50 text-gray-800'
      } transition-colors duration-300`}
    >
      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className='fixed inset-0 z-40 bg-black/50 lg:hidden backdrop-blur-sm'
            onClick={() => setIsSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Enhanced Sidebar */}
      <motion.aside
        initial={false}
        animate={{
          width: isSidebarCollapsed ? '5.5rem' : '18rem'
        }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className={`fixed left-0 top-0 z-50 h-full flex flex-col bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl shadow-2xl border-r border-gray-200/50 dark:border-gray-700/50
                   transform-gpu transition-transform duration-300 lg:translate-x-0 ${
                     isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
                   }`}
      >
        {/* Enhanced Sidebar Header */}
        <div
          className={`flex items-center justify-between flex-shrink-0 ${
            isSidebarCollapsed ? 'p-4' : 'p-5'
          } border-b border-gray-200/50 dark:border-gray-700/50`}
        >
          {!isSidebarCollapsed && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className='flex items-center gap-2'
            >
              <motion.div className='w-9 h-9 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center shadow-lg'>
                <span className='text-white font-bold text-md'>A</span>
              </motion.div>
              <div>
                <h1 className='text-lg font-bold bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 bg-clip-text text-transparent'>
                  ApplySmart
                </h1>
                <p className='text-xs text-gray-500 dark:text-gray-400 font-medium'>
                  Career Assistant
                </p>
              </div>
            </motion.div>
          )}
          <div className='flex items-center'>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
              className='hidden lg:flex p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors'
            >
              {isSidebarCollapsed ? (
                <ChevronRight className='w-5 h-5' />
              ) : (
                <ChevronLeft className='w-5 h-5' />
              )}
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setIsSidebarOpen(false)}
              className='lg:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors'
            >
              <X className='w-5 h-5' />
            </motion.button>
          </div>
        </div>

        {/* Enhanced Navigation */}
        <nav className="p-3 flex-1 overflow-y-auto scrollbar-width-none [&::-webkit-scrollbar]:hidden">
          <div className='space-y-2'>
            {sidebarItems.map((item, index) => (
              <SidebarItem
                key={item.id}
                item={item}
                isActive={activeSection === item.id}
                isCollapsed={isSidebarCollapsed}
                onClick={() => {
                  setActiveSection(item.id)
                  if (window.innerWidth < 1024) setIsSidebarOpen(false)
                }}
                index={index}
              />
            ))}
          </div>
        </nav>

        {/* Enhanced Sidebar Footer */}
        {!isSidebarCollapsed && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className='p-4 border-t border-gray-200/50 dark:border-gray-700/50 flex-shrink-0'
          >
            <div className='flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg'>
              <motion.div className='w-9 h-9 bg-gradient-to-br from-blue-500 to-purple-600 rounded-md flex items-center justify-center'>
                <span className='text-white font-bold text-sm'>
                  {userName ? userName.charAt(0).toUpperCase() : 'U'}
                </span>
              </motion.div>
              <div className='flex-1'>
                <p className='font-semibold text-gray-800 dark:text-gray-100 text-sm'>
                  {userName}
                </p>
                <p className='text-xs text-gray-500 dark:text-gray-400'>
                  Premium
                </p>
              </div>

              <motion.button
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                className='p-1.5 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200'
              >
                <Settings className='w-4 h-4 text-gray-600 dark:text-gray-300' />
              </motion.button>
            </div>
          </motion.div>
        )}
      </motion.aside>

      {/* Main Content */}
      <div
        className={`transition-all duration-300 ${
          isSidebarCollapsed ? 'lg:pl-[5.5rem]' : 'lg:pl-[18rem]'
        }`}
      >
        {/* Enhanced Header */}
        <header className='sticky top-0 z-30 bg-white/70 dark:bg-gray-900/70 backdrop-blur-xl shadow-sm border-b border-gray-200/50 dark:border-gray-700/50'>
          <div className='flex items-center justify-between p-4 lg:p-5'>
            <div className='flex items-center gap-4'>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setIsSidebarOpen(true)}
                className='lg:hidden p-2 rounded-lg bg-white/80 dark:bg-gray-800/80 border border-gray-200/50 dark:border-gray-700/50 shadow-sm'
              >
                <Menu className='w-5 h-5' />
              </motion.button>
              <div>
                <h1 className='text-xl lg:text-2xl font-bold text-gray-900 dark:text-white'>
                  {getSectionInfo().label}
                </h1>
                <p className='text-sm text-gray-500 dark:text-gray-400 hidden md:block'>
                  {getSectionInfo().description}
                </p>
              </div>
            </div>

            <div className='flex items-center gap-2 sm:gap-3'>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setIsDarkMode(!isDarkMode)}
                className='p-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors'
              >
                {isDarkMode ? (
                  <Sun className='w-5 h-5' />
                ) : (
                  <Moon className='w-5 h-5' />
                )}
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className='relative p-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors'
              >
                <Bell className='w-5 h-5 text-gray-600 dark:text-gray-300' />
                {notifications > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className='absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold'
                  >
                    {notifications}
                  </motion.span>
                )}
              </motion.button>

              <div className='hidden sm:flex items-center gap-2 bg-gray-100 dark:bg-gray-800 rounded-lg p-1.5'>
                <div className='w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-md flex items-center justify-center'>
                  <span className='text-white font-bold text-sm'>
                    {userName ? userName.charAt(0).toUpperCase() : 'U'}
                  </span>
                </div>
                <div className='text-left hidden md:block'>
                  <p className='text-sm font-semibold text-gray-800 dark:text-gray-100'>
                    {userName}
                  </p>
                  <p className='text-xs text-gray-500 dark:text-gray-400'>
                    Premium
                  </p>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className='p-4 md:p-6 max-w-7xl mx-auto'>
          {/* Enhanced Breadcrumb */}
          <motion.nav
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className='flex items-center gap-2 text-xs font-medium text-gray-500 dark:text-gray-400 mb-6'
          >
            <Home className='w-3 h-3' />
            <span>Dashboard</span>
            <ChevronRight className='w-3 h-3' />
            <span className='font-bold text-indigo-600 dark:text-indigo-400'>
              {getSectionInfo().label}
            </span>
          </motion.nav>

          {/* Content */}
          <AnimatePresence mode='wait'>
            <motion.div
              key={activeSection}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
            >
              {renderActiveSection()}
            </motion.div>
          </AnimatePresence>
        </main>

        {/* Enhanced Mobile Bottom Navigation */}
        <nav
          className={`lg:hidden fixed bottom-0 left-0 right-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border-t border-gray-200/50 dark:border-gray-700/50 p-1 z-30`}
        >
          <div className='flex justify-around'>
            {sidebarItems.slice(0, 5).map(item => (
              <motion.button
                key={item.id}
                onClick={() => setActiveSection(item.id)}
                whileTap={{ scale: 0.9 }}
                className={`p-2.5 rounded-lg transition-all duration-200 flex flex-col items-center gap-0.5 w-16
                  ${
                    activeSection === item.id
                      ? `text-indigo-600 dark:text-indigo-400`
                      : `text-gray-500 dark:text-gray-400`
                  }`}
              >
                <item.icon className='w-5 h-5' />
                <span className='text-[10px] font-semibold'>{item.label}</span>
                {activeSection === item.id && (
                  <motion.div
                    layoutId='mobileActiveIndicator'
                    className='h-0.5 w-4 bg-indigo-600 dark:bg-indigo-400 rounded-full mt-1'
                  />
                )}
              </motion.button>
            ))}
          </div>
        </nav>
      </div>
    </div>
  )
}

export default Dashboard
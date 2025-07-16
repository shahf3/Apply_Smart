import React, { useState, useEffect } from "react";
import {
  User,
  Briefcase,
  Target,
  ChevronRight,
  Sparkles,
  Shield,
  Zap,
  Menu,
  X,
  Star,
  CheckCircle,
  ArrowRight,
  Phone,
  Mail,
  MapPin,
  ChevronDown,
  Quote
} from "lucide-react";
import Footer from "./Footer";
import LoginUser from "./LoginUser";
import RegisterUser from "./registeruser";
import { Routes, Route } from "react-router-dom";
import Dashboard from "./components/Dashboard";
import './App.css';
// Navigation Component
const Navigation = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { name: 'Home', href: '#home' },
    { name: 'About', href: '#about' },
    { name: 'Services', href: '#services' },
    { name: 'Contact', href: '#contact' }
  ];

  return (
    <nav
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-white/90 backdrop-blur-md shadow-md"
          : "bg-transparent"
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
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
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
    <section id="home"
className="relative min-h-screen w-full max-w-screen overflow-hidden flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
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
          Streamline your job search with our powerful tools. Track applications, prepare for interviews, and land your dream job.
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
  const [mode, setMode] = useState('login');

  return (
    <section id="auth" className="py-24 bg-gradient-to-br from-blue-50/50 to-purple-50/50">
      <div className="max-w-lg mx-auto px-4">
        <div className="flex justify-center mb-8">
          <div className="inline-flex rounded-full bg-white shadow-lg p-1.5">
            <button
              className={`px-8 py-2.5 rounded-full font-medium transition-all duration-300 ${
                mode === 'login'
                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
              onClick={() => setMode('login')}
            >
              Login
            </button>
            <button
              className={`px-8 py-2.5 rounded-full font-medium transition-all duration-300 ${
                mode === 'register'
                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
              onClick={() => setMode('registeruser')}
            >
              Register
      </button>
    </div>
  </div>
        <div className="bg-white rounded-2xl p-8 shadow-lg transition-all duration-300">
          {mode === 'login' ? <LoginUser /> : <RegisterUser />}
        </div>
      </div>
    </section>
  );
};

// About Section Component
const AboutSection = () => {
  return (
    <section id="about" className="py-24 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="order-2 lg:order-1">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-6 tracking-tight">
              About Apply Smart
            </h2>
            <p className="text-lg text-gray-600 mb-6 leading-relaxed">
              We understand that job searching can be overwhelming. That's why we created Apply Smart - a comprehensive platform designed to simplify and streamline your job application process.
            </p>
            <p className="text-lg text-gray-600 mb-8 leading-relaxed">
              With our innovative tools and personalized approach, we help job seekers track applications, prepare for interviews, and ultimately land their dream positions.
            </p>
            
            <div className="space-y-3">
              {[
                "AI-powered job matching",
                "Application tracking system",
                "Interview preparation tools",
                "Personal career coaching"
              ].map((feature, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                  <span className="text-gray-700 text-base">{feature}</span>
                </div>
              ))}
            </div>
          </div>
          
          <div className="order-1 lg:order-2">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl transform rotate-2 opacity-20"></div>
              <div className="relative bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300">
                <div className="grid grid-cols-2 gap-6 text-center">
                  <div>
                    <div className="text-3xl font-bold text-blue-600 mb-2">10k+</div>
                    <div className="text-gray-600 text-sm">Jobs Matched</div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-purple-600 mb-2">95%</div>
                    <div className="text-gray-600 text-sm">Success Rate</div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-green-600 mb-2">5k+</div>
                    <div className="text-gray-600 text-sm">Happy Users</div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-orange-600 mb-2">24/7</div>
                    <div className="text-gray-600 text-sm">Support</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

// Services Section Component
const ServicesSection = () => {
  const services = [
    {
      icon: Target,
      title: "Smart Tracking",
      description: "Keep track of all your applications in one organized dashboard with real-time updates.",
      gradient: "from-blue-600 to-cyan-600"
    },
    {
      icon: Zap,
      title: "Quick Apply",
      description: "Apply to multiple jobs with personalized cover letters and resumes instantly.",
      gradient: "from-purple-600 to-pink-600"
    },
    {
      icon: Shield,
      title: "Secure & Private",
      description: "Your data is protected with enterprise-grade security and privacy measures.",
      gradient: "from-emerald-600 to-teal-600"
    },
    {
      icon: User,
      title: "Career Coaching",
      description: "Get personalized career advice from industry experts and mentors.",
      gradient: "from-orange-600 to-red-600"
    },
    {
      icon: Briefcase,
      title: "Job Matching",
      description: "AI-powered job recommendations based on your skills and preferences.",
      gradient: "from-indigo-600 to-purple-600"
    },
    {
      icon: Sparkles,
      title: "Interview Prep",
      description: "Practice interviews with AI and get feedback to improve your performance.",
      gradient: "from-pink-600 to-rose-600"
    }
  ];

  return (
    <section id="services" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-4 tracking-tight">Our Services</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Comprehensive tools and services to accelerate your job search and career growth.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service, index) => (
            <div
              key={index}
              className={`group relative overflow-hidden rounded-xl p-6 bg-gradient-to-br ${service.gradient} transform hover:scale-105 transition-all duration-300 shadow-md hover:shadow-xl`}
            >
              <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative z-10">
                <service.icon className="w-10 h-10 text-white mb-4 group-hover:scale-110 transition-transform duration-300" />
                <h3 className="text-lg font-semibold text-white mb-2">{service.title}</h3>
                <p className="text-white/90 text-sm">{service.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

// Testimonials Section Component
const TestimonialsSection = () => {
  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "Software Engineer",
      company: "Tech Corp",
      content: "Apply Smart helped me land my dream job at a top tech company. The tracking system kept me organized throughout the entire process.",
      rating: 5,
      avatar: "SJ"
    },
    {
      name: "Michael Chen",
      role: "Product Manager",
      company: "Startup Inc",
      content: "The AI-powered job matching feature is incredible. It found opportunities I never would have discovered on my own.",
      rating: 5,
      avatar: "MC"
    },
    {
      name: "Emily Rodriguez",
      role: "Marketing Director",
      company: "Global Agency",
      content: "The interview preparation tools gave me the confidence I needed to succeed. Highly recommended!",
      rating: 5,
      avatar: "ER"
    }
  ];

  return (
    <section className="py-24 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-4 tracking-tight">
            What Our Users Say
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Join thousands of successful job seekers who found their dream careers with Apply Smart.
          </p>
    </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map((testimonial, index) => (
            <div key={index} className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow duration-300">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold mr-4">
                  {testimonial.avatar}
  </div>
                <div>
                  <h4 className="font-semibold text-gray-900">{testimonial.name}</h4>
                  <p className="text-sm text-gray-500">{testimonial.role} at {testimonial.company}</p>
    </div>
  </div>
              
              <div className="flex mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                ))}
              </div>
              
              <Quote className="w-6 h-6 text-gray-200 mb-4" />
              <p className="text-gray-600 text-sm leading-relaxed">{testimonial.content}</p>
          </div>
          ))}
        </div>
      </div>
    </section>
  );
};

// FAQ Section Component
const FAQSection = () => {
  const [openIndex, setOpenIndex] = useState(null);

  const faqs = [
    {
      question: "How does the job matching algorithm work?",
      answer: "Our AI analyzes your skills, experience, and preferences to match you with relevant job opportunities. It continuously learns from your interactions to improve recommendations."
    },
    {
      question: "Is my personal information secure?",
      answer: "Yes, we use enterprise-grade security measures including encryption, secure servers, and regular security audits to protect your data."
    },
    {
      question: "Can I track multiple job applications?",
      answer: "Absolutely! Our dashboard allows you to track unlimited applications, set reminders, and monitor your progress across all opportunities."
    },
    {
      question: "Do you offer career coaching services?",
      answer: "Yes, we provide personalized career coaching from industry experts to help you improve your job search strategy and interview skills."
    }
  ];

    return (
    <section className="py-24 bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-4 tracking-tight">
            Frequently Asked Questions
          </h2>
          <p className="text-lg text-gray-600 leading-relaxed">
            Find answers to common questions about Apply Smart.
          </p>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, index) => (
            <div key={index} className="bg-gray-50 rounded-xl p-6 transition-all duration-300 hover:shadow-md">
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full flex items-center justify-between text-left"
              >
                <h3 className="text-base font-semibold text-gray-900">{faq.question}</h3>
                <ChevronDown className={`w-5 h-5 text-gray-500 transition-transform duration-200 ${
                  openIndex === index ? 'rotate-180' : ''
                }`} />
              </button>
              
              {openIndex === index && (
                <div className="mt-4 pt-4 border-t border-gray-200/50">
                  <p className="text-gray-600 text-sm leading-relaxed">{faq.answer}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

// Contact Section Component
const ContactSection = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = () => {
    if (formData.name && formData.email && formData.message) {
      console.log('Form submitted:', formData);
      alert('Thank you for your message! We\'ll get back to you soon.');
      setFormData({ name: '', email: '', message: '' });
    } else {
      alert('Please fill in all fields.');
    }
  };

  return (
    <section id="contact" className="py-24 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-4 tracking-tight">
            Get In Touch
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Have questions? We'd love to hear from you. Send us a message and we'll respond as soon as possible.
          </p>
            </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white rounded-xl p-8 shadow-md hover:shadow-lg transition-shadow duration-300">
            <h3 className="text-2xl font-semibold text-gray-900 mb-6">Send us a message</h3>
            <div className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50"
                  placeholder="your@email.com"
                />
              </div>
              
              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                  Message
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 resize-none"
                  placeholder="Your message..."
                />
              </div>
              
              <button
                type="submit"
                onClick={handleSubmit}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transform hover:scale-105 transition-all duration-300 shadow-md flex items-center justify-center space-x-2"
              >
                <span>Send Message</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>
          
          <div className="space-y-6">
            <div className="bg-white rounded-xl p-8 shadow-md hover:shadow-lg transition-shadow duration-300">
              <h3 className="text-2xl font-semibold text-gray-900 mb-6">Contact Information</h3>
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <Phone className="w-6 h-6 text-blue-600 flex-shrink-0" />
                  <div>
                    <p className="text-sm text-gray-500">Phone</p>
                    <p className="text-gray-900">+1 (555) 123-4567</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <Mail className="w-6 h-6 text-blue-600 flex-shrink-0" />
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="text-gray-900">support@applysmart.com</p>
                </div>
              </div>

                <div className="flex items-center space-x-3">
                  <MapPin className="w-6 h-6 text-blue-600 flex-shrink-0" />
                  <div>
                    <p className="text-sm text-gray-500">Address</p>
                    <p className="text-gray-900">123 Career Street, Job City, JC 12345</p>
                    </div>
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-8 text-white shadow-md">
              <h3 className="text-2xl font-semibold mb-4">Ready to start your journey?</h3>
              <p className="mb-6 text-sm">Join thousands of job seekers who have found success with Apply Smart.</p>
              <button className="bg-white text-blue-600 px-6 py-3 rounded-lg font-medium hover:bg-gray-100 transition-colors duration-300 shadow-sm">
                Get Started Now
              </button>
            </div>
          </div>
        </div>
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
      <TestimonialsSection />
      <FAQSection />
      <ContactSection />
    </>
  );
}

// Main App Component
function App() {
  return (
    <div className="min-h-screen w-full overflow-x-hidden bg-white p-0">
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
      <Footer />
    </div>
  );
}

export default App;
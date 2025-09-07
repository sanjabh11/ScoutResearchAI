import React, { useEffect, useRef, useState } from 'react';
import { ArrowRight, Upload, Brain, BarChart3, Code, Zap, Shield, Globe, Play } from 'lucide-react';

interface HeroProps {
  onGetStarted: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onGetStarted }) => {
  const [isVisible, setIsVisible] = useState(false);
  const heroRef = useRef<HTMLDivElement>(null);
  const featuresRef = useRef<HTMLDivElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsVisible(true);

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate-fade-in');
          }
        });
      },
      { threshold: 0.1 }
    );

    if (featuresRef.current) observer.observe(featuresRef.current);
    if (statsRef.current) observer.observe(statsRef.current);

    return () => observer.disconnect();
  }, []);

  const features = [
    {
      icon: Upload,
      title: 'Intelligent Analysis',
      description: 'Upload research papers and get instant complexity assessments with multi-dimensional scoring'
    },
    {
      icon: Brain,
      title: 'Smart Summarization',
      description: 'Generate age-appropriate summaries with real-world examples and interactive explanations'
    },
    {
      icon: BarChart3,
      title: 'Visual Intelligence',
      description: 'Create stunning infographics, animated diagrams, and interactive data visualizations'
    },
    {
      icon: Code,
      title: 'Code Generation',
      description: 'Transform research methodologies into production-ready, documented code implementations'
    }
  ];

  const stats = [
    { label: 'Research Papers Analyzed', value: '10,000+' },
    { label: 'Visualizations Created', value: '2,500+' },
    { label: 'Code Implementations', value: '1,200+' },
    { label: 'Active Researchers', value: '500+' }
  ];

  return (
    <div className="relative overflow-hidden min-h-screen">
      {/* Hero Section with Background Image */}
      <div
        ref={heroRef}
        className={`relative min-h-screen flex items-center justify-center transition-opacity duration-1000 ${
          isVisible ? 'opacity-100' : 'opacity-0'
        }`}
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1451187580459-43490279c0fa?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed'
        }}
      >
        {/* Glassmorphism Overlay */}
        <div className="absolute inset-0 bg-black/40 backdrop-blur-sm"></div>

        {/* Content */}
        <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {/* Main Heading */}
          <div className={`transform transition-all duration-1000 delay-300 ${
            isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
          }`}>
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-serif font-light text-white mb-6 leading-tight">
              Transform Research Into
              <span className="block font-semibold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                Actionable Intelligence
              </span>
            </h1>
          </div>

          {/* Subheading */}
          <div className={`transform transition-all duration-1000 delay-500 ${
            isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
          }`}>
            <p className="text-lg sm:text-xl md:text-2xl text-white/90 mb-12 max-w-4xl mx-auto leading-relaxed font-light">
              ScoutResearchAI is a comprehensive research intelligence platform that provides
              multi-modal understanding, visualization, and discovery capabilities powered by advanced AI.
            </p>
          </div>

          {/* CTA Buttons */}
          <div className={`transform transition-all duration-1000 delay-700 flex flex-col sm:flex-row items-center justify-center gap-6 mb-16 ${
            isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
          }`}>
            <button
              onClick={onGetStarted}
              className="group relative bg-white/10 backdrop-blur-md border border-white/20 text-white px-8 py-4 rounded-2xl text-lg font-medium hover:bg-white/20 hover:border-white/30 hover:scale-105 transition-all duration-300 flex items-center space-x-2 shadow-2xl"
            >
              <span>Get Started Free</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-200" />
            </button>

            <button className="group relative bg-white/20 backdrop-blur-md border border-white/30 text-white px-8 py-4 rounded-2xl text-lg font-medium hover:bg-white/30 hover:border-white/40 hover:scale-105 transition-all duration-300 flex items-center space-x-2 shadow-2xl">
              <Play className="w-5 h-5" />
              <span>Watch Demo</span>
            </button>
          </div>

          {/* Trust Indicators */}
          <div className={`transform transition-all duration-1000 delay-900 flex flex-wrap items-center justify-center gap-6 sm:gap-8 text-white/80 mb-20 ${
            isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
          }`}>
            <div className="flex items-center space-x-2 hover:text-white transition-colors duration-300">
              <Shield className="w-5 h-5" />
              <span className="text-sm font-medium">Enterprise Security</span>
            </div>
            <div className="flex items-center space-x-2 hover:text-white transition-colors duration-300">
              <Zap className="w-5 h-5" />
              <span className="text-sm font-medium">Real-time Processing</span>
            </div>
            <div className="flex items-center space-x-2 hover:text-white transition-colors duration-300">
              <Globe className="w-5 h-5" />
              <span className="text-sm font-medium">Global Research Database</span>
            </div>
          </div>
        </div>

        {/* Floating Elements */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-white/5 rounded-full blur-2xl animate-pulse"></div>
          <div className="absolute top-1/3 right-1/4 w-24 h-24 bg-blue-400/10 rounded-full blur-xl animate-pulse delay-1000"></div>
          <div className="absolute bottom-1/4 left-1/3 w-40 h-40 bg-purple-400/10 rounded-full blur-3xl animate-pulse delay-2000"></div>
        </div>
      </div>

      {/* Features Section */}
      <div
        ref={featuresRef}
        className="py-20 lg:py-32 bg-gradient-to-br from-slate-50 via-white to-blue-50/30"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 lg:mb-20">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-light text-slate-900 mb-6">
              Powerful AI-Driven Research Tools
            </h2>
            <p className="text-lg sm:text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
              From intelligent analysis to code generation, ScoutResearchAI provides everything you need
              to transform research into actionable insights.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className={`group p-6 lg:p-8 bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-3 border border-white/20 hover:border-white/40 ${
                  isVisible ? 'animate-fade-in' : ''
                }`}
                style={{ animationDelay: `${(index + 1) * 200}ms` }}
              >
                <div className="w-14 h-14 bg-gradient-to-br from-blue-100 to-purple-100 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 shadow-lg">
                  <feature.icon className="w-7 h-7 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-slate-900 mb-4 group-hover:text-blue-600 transition-colors duration-300">
                  {feature.title}
                </h3>
                <p className="text-slate-600 leading-relaxed group-hover:text-slate-700 transition-colors duration-300">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div
        ref={statsRef}
        className="py-16 lg:py-24 bg-gradient-to-r from-slate-900 via-blue-900 to-purple-900"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div
                key={index}
                className={`text-center group ${
                  isVisible ? 'animate-fade-in' : ''
                }`}
                style={{ animationDelay: `${(index + 1) * 300}ms` }}
              >
                <div className="text-3xl sm:text-4xl lg:text-5xl font-serif font-light text-white mb-2 group-hover:scale-110 transition-transform duration-300">
                  {stat.value}
                </div>
                <div className="text-white/80 font-medium group-hover:text-white transition-colors duration-300">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
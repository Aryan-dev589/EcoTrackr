// components/EcoTrackrLanding.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Landing = () => {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const features = [
    {
      icon: 'fas fa-car',
      title: 'Travel Log',
      description: 'Track your transportation emissions with multiple travel modes and distance calculation'
    },
    {
      icon: 'fas fa-utensils',
      title: 'Food Log',
      description: 'Monitor your dietary carbon footprint with meal tracking and food type analysis'
    },
    {
      icon: 'fas fa-shopping-cart',
      title: 'Shopping Log',
      description: 'Track emissions from your purchases with product category analysis'
    },
    {
      icon: 'fas fa-bolt',
      title: 'Energy Log',
      description: 'Monitor your home energy consumption and related carbon emissions'
    },
    {
      icon: 'fas fa-wind',
      title: 'AQI Dashboard',
      description: 'Check air quality index for your location and track changes over time'
    },
    {
      icon: 'fas fa-trophy',
      title: 'Badges & Leaderboard',
      description: 'Earn rewards for eco-friendly choices and compete with friends'
    }
  ];

  const steps = [
    {
      number: '1',
      title: 'Sign Up',
      description: 'Create your free account in less than a minute'
    },
    {
      number: '2',
      title: 'Track Activities',
      description: 'Log your travel, meals, shopping, and energy usage'
    },
    {
      number: '3',
      title: 'See Your Impact',
      description: 'View your carbon footprint breakdown with visual charts'
    },
    {
      number: '4',
      title: 'Reduce & Improve',
      description: 'Get personalized tips to lower your environmental impact'
    }
  ];

  const testimonials = [
    {
      text: '"EcoTrackr has completely changed how I view my daily choices. I\'ve reduced my carbon footprint by 30% in just 3 months!"',
      author: '- Sarah J., Environmental Scientist'
    },
    {
      text: '"The travel log feature helped me realize how much impact my commute had. I\'ve since switched to biking and public transport."',
      author: '- Michael T., Software Engineer'
    },
    {
      text: '"I love the personalized tips and the community features. Competing with friends to earn badges makes sustainability fun!"',
      author: '- Jessica L., College Student'
    }
  ];

  const footerLinks = {
    features: ['Travel Log', 'Food Log', 'Shopping Log', 'Energy Log', 'AQI Dashboard'],
    company: ['About Us', 'Careers', 'Press', 'Contact'],
    resources: ['Blog', 'FAQ', 'Support', 'Privacy Policy']
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 text-gray-800">
      {/* Header */}
      <header 
        className={`fixed w-full top-0 z-50 transition-all duration-300 ${
          scrolled 
            ? 'bg-white/95 backdrop-blur-sm shadow-lg' 
            : 'bg-white/95 shadow-md'
        }`}
      >
        <div className="container mx-auto px-4 sm:px-6">
          <nav className="flex justify-between items-center py-5">
            {/* Logo */}
            <div className="flex items-center text-2xl font-bold text-green-700">
              <i className="fas fa-leaf mr-3"></i>
              <span>EcoTrackr</span>
            </div>
            
            {/* Navigation Links - Hidden on mobile */}
            <ul className="hidden md:flex space-x-8">
              {['Home', 'Features', 'How It Works', 'Testimonials', 'FAQ'].map((item) => (
                <li key={item}>
                  <a 
                    href="#" 
                    className="font-medium text-gray-700 hover:text-green-600 transition-colors"
                  >
                    {item}
                  </a>
                </li>
              ))}
            </ul>
            
            {/* Auth Buttons */}
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/login')}
                className="font-semibold text-green-600 hover:text-green-700 transition-colors"
              >
                Login
              </button>
              <button
                onClick={() => navigate('/signup')}
                className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-6 rounded-full transition-all duration-300 transform hover:-translate-y-0.5"
              >
                Sign Up
              </button>
            </div>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section 
        className="pt-40 pb-24 text-center bg-[url('data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'><rect fill='%232e7d32' opacity='0.2' width='10' height='10'/></svg>')]"
      >
        <div className="container mx-auto px-4 sm:px-6">
          <h1 className="text-5xl md:text-6xl font-bold text-green-800 mb-6">
            EcoTrackr 🌱
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 max-w-2xl mx-auto mb-10">
            Track your lifestyle. Reduce your footprint. Save the planet.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row justify-center gap-4">
            <button
              onClick={() => navigate('/signup')}
              className="bg-green-600 hover:bg-green-700 text-white font-semibold py-4 px-8 rounded-full text-lg transition-all duration-300 transform hover:-translate-y-1"
            >
              Get Started
            </button>
            <button
              onClick={() => navigate('/login')}
              className="border-2 border-green-600 text-green-600 hover:bg-green-600 hover:text-white font-semibold py-4 px-8 rounded-full text-lg transition-all duration-300"
            >
              Learn More
            </button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-green-800 mb-4">
              Track Your Carbon Footprint
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              EcoTrackr helps you monitor and reduce your environmental impact through easy tracking
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div 
                key={index}
                className="bg-green-50 rounded-2xl p-8 text-center shadow-lg transition-all duration-300 hover:-translate-y-2 hover:shadow-xl"
              >
                <div className="text-5xl text-green-600 mb-6">
                  <i className={feature.icon}></i>
                </div>
                <h3 className="text-2xl font-semibold text-gray-800 mb-4">
                  {feature.title}
                </h3>
                <p className="text-gray-600">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-green-50">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-green-800 mb-4">
              How EcoTrackr Works
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Start reducing your carbon footprint in just a few simple steps
            </p>
          </div>
          
          <div className="flex flex-col md:flex-row justify-between">
            {steps.map((step, index) => (
              <div 
                key={index}
                className="flex-1 text-center p-6"
              >
                <div className="w-14 h-14 bg-green-600 text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-6">
                  {step.number}
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-3">
                  {step.title}
                </h3>
                <p className="text-gray-600">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-green-800 mb-4">
              What Users Say
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Join thousands of environmentally conscious users worldwide
            </p>
          </div>
          
          <div className="flex flex-col md:flex-row gap-8 justify-center">
            {testimonials.map((testimonial, index) => (
              <div 
                key={index}
                className="bg-green-50 rounded-2xl p-8 max-w-md shadow-lg"
              >
                <p className="italic text-gray-700 mb-6">
                  {testimonial.text}
                </p>
                <p className="font-bold text-green-600">
                  {testimonial.author}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-r from-green-600 to-green-800 text-white text-center">
        <div className="container mx-auto px-4 sm:px-6">
          <h2 className="text-4xl font-bold mb-6">
            Start Your Eco-Friendly Journey Today
          </h2>
          <p className="text-xl max-w-2xl mx-auto mb-10">
            Join thousands of users who are already reducing their carbon footprint with EcoTrackr
          </p>
          <a 
            href="#" 
            className="bg-white text-green-600 hover:bg-gray-100 font-semibold py-4 px-10 rounded-full text-lg inline-block transition-colors"
          >
            Sign Up Now
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-green-900 text-white pt-16 pb-8">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
            {/* Company Info */}
            <div>
              <h3 className="text-xl font-semibold mb-6">EcoTrackr</h3>
              <p className="text-green-200 mb-6">
                Helping you make sustainable choices for a better planet.
              </p>
              <div className="flex space-x-4">
                {['facebook-f', 'twitter', 'instagram', 'linkedin-in'].map((platform) => (
                  <a 
                    key={platform}
                    href="#" 
                    className="w-10 h-10 bg-green-800 hover:bg-green-700 rounded-full flex items-center justify-center transition-colors"
                  >
                    <i className={`fab fa-${platform}`}></i>
                  </a>
                ))}
              </div>
            </div>
            
            {/* Features Links */}
            <div>
              <h3 className="text-xl font-semibold mb-6">Features</h3>
              <ul className="space-y-3">
                {footerLinks.features.map((link, index) => (
                  <li key={index}>
                    <a href="#" className="text-green-200 hover:text-white transition-colors">
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            
            {/* Company Links */}
            <div>
              <h3 className="text-xl font-semibold mb-6">Company</h3>
              <ul className="space-y-3">
                {footerLinks.company.map((link, index) => (
                  <li key={index}>
                    <a href="#" className="text-green-200 hover:text-white transition-colors">
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            
            {/* Resources Links */}
            <div>
              <h3 className="text-xl font-semibold mb-6">Resources</h3>
              <ul className="space-y-3">
                {footerLinks.resources.map((link, index) => (
                  <li key={index}>
                    <a href="#" className="text-green-200 hover:text-white transition-colors">
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          
          <div className="pt-8 border-t border-green-800 text-center text-green-300">
            <p>&copy; 2023 EcoTrackr. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
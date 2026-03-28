/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, Component, ReactNode } from "react";
import { motion } from "motion/react";
import { 
  ArrowRight, 
  CheckCircle2, 
  ShieldCheck, 
  Zap, 
  Users, 
  TrendingUp,
  Mail,
  User,
  Menu,
  X,
  AlertCircle
} from "lucide-react";
import { cn } from "@/src/lib/utils";
import { db, OperationType, handleFirestoreError } from "./firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

// Error Boundary Component
class ErrorBoundary extends React.Component<{ children: ReactNode }, { hasError: boolean, error: Error | null }> {
  state: { hasError: boolean, error: Error | null } = { hasError: false, error: null };
  props: { children: ReactNode };

  constructor(props: { children: ReactNode }) {
    super(props);
    this.props = props;
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error("ErrorBoundary caught an error", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      let errorMessage = "Something went wrong. Please try again later.";
      try {
        const parsedError = JSON.parse(this.state.error?.message || "");
        if (parsedError.error) {
          errorMessage = `Firestore Error: ${parsedError.error}`;
        }
      } catch (e) {
        // Not a JSON error
      }

      return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
          <div className="bg-white p-8 rounded-3xl shadow-xl max-w-md w-full text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertCircle className="w-8 h-8 text-red-600" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-4">Application Error</h2>
            <p className="text-slate-600 mb-8">{errorMessage}</p>
            <button 
              onClick={() => {
                try {
                  // Using reload() is safer in cross-origin iframe environments
                  window.location.reload();
                } catch (e) {
                  console.error("Failed to reload page:", e);
                }
              }}
              className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-bold hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-500/20"
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default function App() {
  return (
    <ErrorBoundary>
      <LandingPage />
    </ErrorBoundary>
  );
}

function LandingPage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [formData, setFormData] = useState({ name: "", email: "" });
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    
    const path = "waitlist";
    try {
      // 1. Submit to Firestore (existing logic)
      await addDoc(collection(db, path), {
        ...formData,
        createdAt: serverTimestamp()
      });

      // 2. Submit to Formspree
      try {
        const formspreeResponse = await fetch("https://formspree.io/f/xreoenzy", {
          method: "POST",
          body: JSON.stringify(formData),
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          }
        });

        if (!formspreeResponse.ok) {
          console.warn("Formspree submission failed, but Firestore succeeded.");
        }
      } catch (formspreeErr) {
        console.error("Formspree error:", formspreeErr);
      }

      setIsSubmitted(true);
      setFormData({ name: "", email: "" });
    } catch (err) {
      console.error("Error adding document: ", err);
      try {
        await handleFirestoreError(err, OperationType.WRITE, path);
      } catch (firestoreErr: any) {
        const errInfo = JSON.parse(firestoreErr.message);
        setError(errInfo.error || "Failed to join waitlist. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const features = [
    {
      icon: <Zap className="w-6 h-6 text-blue-600" />,
      title: "Instant Approvals",
      description: "Get your loan approved in minutes with our AI-driven credit assessment."
    },
    {
      icon: <ShieldCheck className="w-6 h-6 text-blue-600" />,
      title: "Secure & Transparent",
      description: "Your data and transactions are protected with bank-grade encryption."
    },
    {
      icon: <Users className="w-6 h-6 text-blue-600" />,
      title: "Peer-to-Peer",
      description: "Connect directly with lenders and borrowers for better rates and terms."
    },
    {
      icon: <TrendingUp className="w-6 h-6 text-blue-600" />,
      title: "Competitive Rates",
      description: "Access lower interest rates compared to traditional banking institutions."
    }
  ];

  return (
    <div className="min-h-screen bg-[#030712] font-sans text-slate-50 selection:bg-indigo-500/30 selection:text-indigo-200">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#030712]/80 backdrop-blur-xl border-b border-slate-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-500/20">
                <span className="text-white font-bold text-xl">L</span>
              </div>
              <span className="text-xl font-bold tracking-tight text-white">Lendriva</span>
            </div>
            
            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-sm font-medium text-slate-400 hover:text-indigo-400 transition-colors">Features</a>
              <a href="#about" className="text-sm font-medium text-slate-400 hover:text-indigo-400 transition-colors">About</a>
              <a href="#waitlist" className="bg-indigo-600 text-white px-5 py-2 rounded-full text-sm font-semibold hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-500/20">Join Waitlist</a>
            </div>

            {/* Mobile Menu Toggle */}
            <button 
              className="md:hidden p-2 text-slate-400"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X /> : <Menu />}
            </button>
          </div>
        </div>

        {/* Mobile Nav */}
        {isMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="md:hidden bg-[#030712] border-b border-slate-800/50 px-4 py-6 flex flex-col gap-4"
          >
            <a href="#features" onClick={() => setIsMenuOpen(false)} className="text-lg font-medium text-slate-400">Features</a>
            <a href="#about" onClick={() => setIsMenuOpen(false)} className="text-lg font-medium text-slate-400">About</a>
            <a href="#waitlist" onClick={() => setIsMenuOpen(false)} className="bg-indigo-600 text-white px-5 py-3 rounded-xl text-center font-semibold">Join Waitlist</a>
          </motion.div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        {/* Background Glows */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-indigo-600/10 rounded-full blur-[120px] -z-10 pointer-events-none"></div>
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-blue-600/5 rounded-full blur-[100px] -z-10 pointer-events-none"></div>

        <div className="max-w-7xl mx-auto text-center">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="inline-flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 px-3 py-1 rounded-full text-sm font-medium mb-6">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
                </span>
                Coming Soon
              </div>
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-white leading-[1.1] mb-6">
                Lending Made <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-blue-400">Simple</span> and <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-blue-400">Fair</span>.
              </h1>
              <p className="text-lg text-slate-400 mb-8 max-w-2xl mx-auto leading-relaxed">
                Lendriva is the next generation of peer-to-peer lending. We connect borrowers and lenders directly, cutting out the middleman to provide better rates for everyone.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a href="#waitlist" className="bg-indigo-600 text-white px-8 py-4 rounded-2xl font-bold text-lg hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-500/30 flex items-center justify-center gap-2 group">
                  Join the Waitlist
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </a>
                <a href="#features" className="bg-slate-900/50 border border-slate-800 text-slate-300 px-8 py-4 rounded-2xl font-bold text-lg hover:bg-slate-800 transition-all flex items-center justify-center">
                  Learn More
                </a>
              </div>
              
              <div className="mt-12 flex items-center justify-center gap-4">
                <div className="flex -space-x-2">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="w-10 h-10 rounded-full border-2 border-[#030712] bg-slate-800 flex items-center justify-center overflow-hidden">
                      <img 
                        src={`https://i.pravatar.cc/150?u=${i}`} 
                        alt="User" 
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                  ))}
                </div>
                <p className="text-sm text-slate-500 font-medium">
                  Join <span className="text-slate-200 font-bold">500+</span> people already on the waitlist
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 bg-[#030712] relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">Why Choose Lendriva?</h2>
            <p className="text-lg text-slate-400">We're reimagining the lending experience from the ground up, focusing on speed, security, and fairness.</p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="bg-slate-900/40 p-8 rounded-[2rem] border border-slate-800/50 backdrop-blur-xl hover:border-indigo-500/30 transition-all group"
              >
                <div className="w-12 h-12 bg-indigo-500/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  {React.cloneElement(feature.icon as React.ReactElement, { className: "w-6 h-6 text-indigo-400" })}
                </div>
                <h3 className="text-xl font-bold text-white mb-3">{feature.title}</h3>
                <p className="text-slate-400 leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-24 relative overflow-hidden">
        <div className="absolute top-1/2 left-0 w-[400px] h-[400px] bg-indigo-600/5 rounded-full blur-[100px] -z-10 pointer-events-none"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="order-2 lg:order-1">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-4">
                  <img 
                    src="https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?auto=format&fit=crop&w=800&q=80" 
                    alt="No hidden fees - Transparent finance" 
                    className="rounded-3xl h-64 w-full object-cover shadow-2xl border border-slate-800/50"
                    referrerPolicy="no-referrer"
                  />
                  <img 
                    src="https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&w=800&q=80" 
                    alt="Flexible repayment terms - Agreement" 
                    className="rounded-3xl h-48 w-full object-cover shadow-2xl border border-slate-800/50"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div className="space-y-4 pt-8">
                  <img 
                    src="https://images.unsplash.com/photo-1556761175-b413da4baf72?auto=format&fit=crop&w=800&q=80" 
                    alt="Direct communication between parties" 
                    className="rounded-3xl h-48 w-full object-cover shadow-2xl border border-slate-800/50"
                    referrerPolicy="no-referrer"
                  />
                  <img 
                    src="https://images.unsplash.com/photo-1518186285589-2f7649de83e0?auto=format&fit=crop&w=800&q=80" 
                    alt="Advanced risk assessment models" 
                    className="rounded-3xl h-64 w-full object-cover shadow-2xl border border-slate-800/50"
                    referrerPolicy="no-referrer"
                  />
                </div>
              </div>
            </div>
            
            <div className="order-1 lg:order-2">
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">Built for the Modern Borrower and Lender</h2>
              <p className="text-lg text-slate-400 mb-6 leading-relaxed">
                Traditional banks are slow, bureaucratic, and often unfair. Lendriva uses advanced technology to connect people directly, creating a more efficient marketplace for capital.
              </p>
              <div className="space-y-4">
                {[
                  "No hidden fees or surprise charges",
                  "Flexible repayment terms tailored to you",
                  "Direct communication between parties",
                  "Advanced risk assessment models"
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-indigo-500 flex-shrink-0" />
                    <span className="text-slate-300 font-medium">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Waitlist Section */}
      <section id="waitlist" className="py-24 bg-[#030712] relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full opacity-20 pointer-events-none">
          <div className="absolute top-0 left-1/2 w-[800px] h-[400px] bg-indigo-600/20 rounded-full -translate-x-1/2 -translate-y-1/2 blur-[120px]"></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">Be the First to Know</h2>
            <p className="text-slate-400 text-lg mb-10">
              We're launching soon. Join the waitlist to get early access and exclusive benefits when we go live.
            </p>
            
            {isSubmitted ? (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-slate-900/60 p-10 rounded-[2.5rem] border border-slate-800/50 backdrop-blur-xl shadow-2xl text-center"
              >
                <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                  <CheckCircle2 className="w-10 h-10 text-green-400" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">You're on the list!</h3>
                <p className="text-slate-400">We'll notify you as soon as we're ready to launch. Keep an eye on your inbox.</p>
                <button 
                  onClick={() => setShowResetConfirm(true)}
                  className="mt-8 text-indigo-400 font-bold hover:underline"
                >
                  Add another email
                </button>

                {showResetConfirm && (
                  <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-[#030712]/80 backdrop-blur-md">
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.95, y: 20 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      className="bg-slate-900 p-8 rounded-[2rem] border border-slate-800 shadow-2xl max-w-sm w-full text-center"
                    >
                      <div className="w-16 h-16 bg-indigo-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                        <AlertCircle className="w-8 h-8 text-indigo-400" />
                      </div>
                      <h4 className="text-xl font-bold text-white mb-2">Add another email?</h4>
                      <p className="text-slate-400 mb-8">This will clear your current success message and allow you to join the waitlist with a different email.</p>
                      <div className="flex flex-col gap-3">
                        <button 
                          onClick={() => {
                            setIsSubmitted(false);
                            setShowResetConfirm(false);
                          }}
                          className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-bold hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-500/20"
                        >
                          Yes, add another
                        </button>
                        <button 
                          onClick={() => setShowResetConfirm(false)}
                          className="w-full bg-slate-800 text-slate-300 py-4 rounded-2xl font-bold hover:bg-slate-700 transition-all"
                        >
                          Cancel
                        </button>
                      </div>
                    </motion.div>
                  </div>
                )}
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="bg-slate-900/60 p-8 sm:p-10 rounded-[2.5rem] border border-slate-800/50 backdrop-blur-xl shadow-2xl">
                <div className="space-y-6">
                  <div className="text-left">
                    <label className="block text-sm font-bold text-slate-300 mb-2 ml-1">Full Name</label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                      <input 
                        type="text" 
                        name="name"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="John Doe"
                        className="w-full pl-12 pr-4 py-4 bg-slate-950/50 border border-slate-800 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-slate-950 transition-all text-white placeholder:text-slate-600"
                      />
                    </div>
                  </div>
                  
                  <div className="text-left">
                    <label className="block text-sm font-bold text-slate-300 mb-2 ml-1">Email Address</label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                      <input 
                        type="email" 
                        name="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="john@example.com"
                        className="w-full pl-12 pr-4 py-4 bg-slate-950/50 border border-slate-800 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-slate-950 transition-all text-white placeholder:text-slate-600"
                      />
                    </div>
                  </div>
                  
                  {error && (
                    <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-2xl text-sm flex items-center gap-2">
                      <AlertCircle className="w-4 h-4" />
                      {error}
                    </div>
                  )}
                  
                  <button 
                    type="submit" 
                    disabled={isLoading}
                    className="w-full bg-indigo-600 text-white py-5 rounded-2xl font-bold text-lg hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-500/20 flex items-center justify-center gap-3 disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {isLoading ? (
                      <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin"></div>
                    ) : (
                      <>
                        Get Early Access
                        <ArrowRight className="w-5 h-5" />
                      </>
                    )}
                  </button>
                </div>
                <p className="mt-6 text-xs text-slate-500">
                  By joining, you agree to our <a href="#" className="underline hover:text-indigo-400">Privacy Policy</a> and <a href="#" className="underline hover:text-indigo-400">Terms of Service</a>.
                </p>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-slate-800/50 bg-[#030712]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-indigo-600 rounded flex items-center justify-center">
                <span className="text-white font-bold text-sm">L</span>
              </div>
              <span className="text-lg font-bold tracking-tight text-white">Lendriva</span>
            </div>
            
            <div className="flex gap-8">
              <a href="#" className="text-sm text-slate-500 hover:text-indigo-400 transition-colors">Privacy</a>
              <a href="#" className="text-sm text-slate-500 hover:text-indigo-400 transition-colors">Terms</a>
              <a href="#" className="text-sm text-slate-500 hover:text-indigo-400 transition-colors">Contact</a>
            </div>
            
            <div className="text-sm text-slate-500">
              © {new Date().getFullYear()} Lendriva. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

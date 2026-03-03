import React, { useState } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { Navbar } from '../sections/Navbar';
import { Footer } from '../sections/Footer';
import { MapPin, Phone, Mail, Send, Loader2, CheckCircle } from 'lucide-react';

export const ContactPage = () => {
  const { theme, toggleTheme } = useTheme();
  
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate API Call
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSuccess(true);
      setFormData({ name: '', email: '', subject: '', message: '' });
      
      // Reset success message after 5 seconds
      setTimeout(() => setIsSuccess(false), 5000);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0B0F19] transition-colors duration-300 flex flex-col">
      <Navbar theme={theme} setTheme={toggleTheme} />
      
      <main className="flex-grow pt-32 pb-24 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          
          {/* Header */}
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-serif font-black text-slate-900 dark:text-white mb-4">
              Get in <span className="text-orange-600">Touch</span>
            </h1>
            <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
              Have questions about bulk orders, shipping, or our content? Drop us a message and our team will get back to you within 24 hours.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 items-start">
            
            {/* Contact Form (Left Side) */}
            <div className="lg:col-span-3 bg-white dark:bg-slate-900 rounded-3xl p-8 md:p-10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-none border border-slate-200 dark:border-slate-800 relative overflow-hidden">
              
              {isSuccess ? (
                <div className="absolute inset-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm z-10 flex flex-col items-center justify-center text-center p-8 animate-[fadeIn_0.3s_ease-out]">
                  <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-6">
                    <CheckCircle className="text-green-500 w-10 h-10" />
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Message Sent!</h3>
                  <p className="text-slate-500 dark:text-slate-400">Thank you for reaching out. We will respond to your email shortly.</p>
                </div>
              ) : null}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Full Name</label>
                    <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all" placeholder="John Doe" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Email Address</label>
                    <input required type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all" placeholder="john@example.com" />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Subject</label>
                  <select value={formData.subject} onChange={e => setFormData({...formData, subject: e.target.value})} className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all">
                    <option value="" disabled>Select a topic...</option>
                    <option value="General Inquiry">General Inquiry</option>
                    <option value="Order Support">Order & Shipping Support</option>
                    <option value="Bulk Orders">Bulk Orders & Corporate</option>
                    <option value="Partnership">Partnership Opportunities</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Your Message</label>
                  <textarea required rows="5" value={formData.message} onChange={e => setFormData({...formData, message: e.target.value})} className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all resize-none" placeholder="How can we help you?"></textarea>
                </div>

                <button type="submit" disabled={isSubmitting} className="w-full py-4 bg-orange-600 hover:bg-orange-700 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-all disabled:opacity-70">
                  {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : <Send size={20} />}
                  {isSubmitting ? 'Sending...' : 'Send Message'}
                </button>
              </form>
            </div>

            {/* Contact Information (Right Side) */}
            <div className="lg:col-span-2 space-y-6">
              
              <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 flex flex-col gap-4 shadow-sm hover:border-orange-500/30 transition-colors">
                <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 text-orange-600 rounded-full flex items-center justify-center mb-2">
                  <Mail size={24} />
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Email Us</h3>
                <p className="text-slate-500 dark:text-slate-400 text-sm">For general inquiries and support, drop us an email anytime.</p>
                <a href="mailto:hello@sahakarstree.in" className="text-orange-600 font-bold hover:underline mt-2">hello@sahakarstree.in</a>
              </div>

              <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 flex flex-col gap-4 shadow-sm hover:border-orange-500/30 transition-colors">
                <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 text-orange-600 rounded-full flex items-center justify-center mb-2">
                  <Phone size={24} />
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Call Us</h3>
                <p className="text-slate-500 dark:text-slate-400 text-sm">Mon-Fri from 9am to 6pm IST.</p>
                <a href="tel:+919876543210" className="text-orange-600 font-bold hover:underline mt-2">+91 98765 43210</a>
              </div>

              <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 flex flex-col gap-4 shadow-sm hover:border-orange-500/30 transition-colors">
                <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 text-orange-600 rounded-full flex items-center justify-center mb-2">
                  <MapPin size={24} />
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Visit Us</h3>
                <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">
                  SahakarStree Headquarters<br />
                  FC Road, Shivaji Nagar<br />
                  Pune, Maharashtra 411004
                </p>
              </div>

            </div>

          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};
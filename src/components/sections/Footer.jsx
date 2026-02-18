import React from 'react';
import { motion } from 'framer-motion';
import { Play, Feather, BookOpen } from 'lucide-react';
import { SectionHeading } from '../ui/SectionHeading';
import { Button } from '../ui/Button';

export const Footer = () => (
    <div>
        {/* Footer */}
      <footer className="bg-slate-950 text-white pt-20 pb-10 border-t border-slate-900">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-12 mb-16">
            <div className="col-span-1 md:col-span-2">
              <div className="text-3xl font-serif font-bold flex items-center gap-2 mb-6">
                <BookOpen className="text-orange-600" />
                <span>चिंतनातून चिंतामुक्तीकडे.</span>
              </div>
              <p className="text-slate-400 max-w-sm mb-8 leading-relaxed">
                Empowering the next generation of thinkers and doers in Maharashtra through the power of native language.
              </p>
              <div className="flex gap-2 w-full max-w-md">
                <input 
                  type="email" 
                  placeholder="Join our newsletter" 
                  className="bg-slate-900 border border-slate-800 rounded-full px-6 py-3 text-white focus:ring-2 focus:ring-orange-500 outline-none w-full"
                />
                <button className="bg-orange-600 hover:bg-orange-700 px-6 py-3 rounded-full font-medium transition-colors">
                  Join
                </button>
              </div>
            </div>
            
            <div>
              <h4 className="font-bold mb-6 text-lg tracking-wide">Explore</h4>
              <ul className="space-y-4 text-slate-400">
                {['Home', 'About Author', 'Chapters', 'Reviews', 'Bulk Orders'].map(link => (
                  <li key={link}><a href="#" className="hover:text-orange-500 transition-colors">{link}</a></li>
                ))}
              </ul>
            </div>
            
            <div>
              <h4 className="font-bold mb-6 text-lg tracking-wide">Contact</h4>
              <ul className="space-y-4 text-slate-400">
                <li>hello@book.in</li>
                <li>+91 98765 43210</li>
                <li>FC Road, Pune, Maharashtra 411004</li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-slate-900 pt-8 flex flex-col md:flex-row justify-between items-center text-slate-500 text-sm">
            <p>&copy; {new Date().getFullYear()} Book. All rights reserved.</p>
            <div className="flex gap-6 mt-4 md:mt-0">
              <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
);
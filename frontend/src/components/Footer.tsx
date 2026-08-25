import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Shield } from 'lucide-react';
import InfoModal from './InfoModal';
import type { InfoContentType } from './InfoModal';

const Footer = () => {
  const [modalType, setModalType] = useState<InfoContentType | null>(null);

  const openModal = (type: InfoContentType, e: React.MouseEvent) => {
    e.preventDefault();
    setModalType(type);
  };

  return (
    <>
      <footer className="bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 pt-12 pb-8 mt-auto w-full">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 mb-12">
            
            {/* Branding Section */}
            <div className="lg:col-span-2 space-y-4">
              <Link to="/" className="flex items-center gap-2 group w-fit">
                <div className="bg-primary-600 p-1.5 rounded-lg group-hover:bg-primary-700 transition-colors shadow-sm">
                  <Shield className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300">
                  CivicShield
                </span>
              </Link>
              <p className="text-sm text-slate-600 dark:text-slate-400 max-w-sm leading-relaxed">
                CivicShield is a smart civic issue reporting platform that helps citizens report, track, and follow community issues.
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-500 font-medium">
                Making communities safer, more responsive, and better connected.
              </p>
            </div>

            {/* About Navigation */}
            <div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-4">About</h4>
              <ul className="space-y-3">
                <li><a href="#" onClick={(e) => openModal('ABOUT', e)} className="text-sm text-slate-600 dark:text-slate-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">About CivicShield</a></li>
                <li><a href="#" onClick={(e) => openModal('HOW_IT_WORKS', e)} className="text-sm text-slate-600 dark:text-slate-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">How It Works</a></li>
                <li><a href="#" onClick={(e) => openModal('FEATURES', e)} className="text-sm text-slate-600 dark:text-slate-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">Features</a></li>
              </ul>
            </div>

            {/* Platform Navigation */}
            <div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-4">Platform</h4>
              <ul className="space-y-3">
                <li><Link to="/citizen/create" className="text-sm text-slate-600 dark:text-slate-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">Report an Issue</Link></li>
                <li><Link to="/my-complaints" className="text-sm text-slate-600 dark:text-slate-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">My Complaints</Link></li>
                <li><Link to="/track" className="text-sm text-slate-600 dark:text-slate-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">Track Complaint</Link></li>
              </ul>
            </div>

            {/* Support & Legal */}
            <div className="space-y-8">
              <div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-4">Support</h4>
                <ul className="space-y-3">
                  <li><a href="#" onClick={(e) => openModal('SUPPORT', e)} className="text-sm text-slate-600 dark:text-slate-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">Contact Support</a></li>
                  <li><a href="#" onClick={(e) => openModal('FAQ', e)} className="text-sm text-slate-600 dark:text-slate-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">Help & FAQ</a></li>
                </ul>
              </div>
              
              <div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-4">Legal</h4>
                <ul className="space-y-3">
                  <li><a href="#" onClick={(e) => openModal('PRIVACY', e)} className="text-sm text-slate-600 dark:text-slate-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">Privacy Policy</a></li>
                  <li><a href="#" onClick={(e) => openModal('TERMS', e)} className="text-sm text-slate-600 dark:text-slate-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">Terms of Use</a></li>
                  <li><a href="#" onClick={(e) => openModal('SECURITY', e)} className="text-sm text-slate-600 dark:text-slate-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">Security</a></li>
                </ul>
              </div>
            </div>

          </div>

          {/* Bottom Bar */}
          <div className="border-t border-slate-200 dark:border-slate-800 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="text-center md:text-left">
              <p className="text-sm font-medium text-slate-900 dark:text-white">
                &copy; {new Date().getFullYear()} CivicShield. All rights reserved.
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-500 mt-1">
                CivicShield is a demonstration platform developed for civic issue reporting and management.
              </p>
            </div>
            <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
              Built for smarter communities.
            </p>
          </div>

        </div>
      </footer>

      <InfoModal 
        isOpen={modalType !== null} 
        onClose={() => setModalType(null)} 
        contentType={modalType} 
      />
    </>
  );
};

export default Footer;

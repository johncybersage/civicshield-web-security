import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../hooks/ThemeProvider';
import { Shield, UserCircle, LogOut, Sun, Moon, Menu, X } from 'lucide-react';
import NotificationBell from './NotificationBell';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setMobileOpen(false);
    navigate('/');
  };

  return (
    <nav className="fixed top-0 w-full z-50 glass-panel border-b border-slate-200 dark:border-slate-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2" onClick={() => setMobileOpen(false)}>
              <Shield className="h-8 w-8 text-primary-600" />
              <span className="font-bold text-xl text-slate-900 dark:text-white tracking-tight">CivicShield</span>
            </Link>
          </div>
          
          {/* Desktop Nav */}
          <div className="hidden md:flex items-center space-x-3">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
            >
              {theme === 'light' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
            </button>

            {user && <NotificationBell />}

            {user ? (
              <>
                <Link to="/dashboard" className="text-slate-600 dark:text-slate-300 hover:text-primary-600 dark:hover:text-primary-400 font-medium transition-colors">
                  Dashboard
                </Link>
                {(user.role === 'ADMIN' || user.role === 'OFFICER') && (
                  <Link to="/security-lab" className="text-red-600 dark:text-red-400 hover:text-red-700 font-bold px-3 py-1 bg-red-50 dark:bg-red-900/30 rounded-md border border-red-200 dark:border-red-800 transition-colors">
                    Security Lab
                  </Link>
                )}
                <div className="flex items-center space-x-2 pl-3 border-l border-slate-200 dark:border-slate-700">
                  {user.role === 'CITIZEN' ? (
                    <Link to="/profile" className="flex items-center space-x-2 text-slate-500 hover:text-primary-600 dark:text-slate-400 dark:hover:text-primary-400 transition-colors">
                      <UserCircle className="h-5 w-5" />
                      <span className="text-sm font-medium">{user.name}</span>
                    </Link>
                  ) : (
                    <>
                      <UserCircle className="h-5 w-5 text-slate-500 dark:text-slate-400" />
                      <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{user.name}</span>
                    </>
                  )}
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-1 text-sm text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Logout</span>
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="text-slate-600 dark:text-slate-300 hover:text-primary-600 dark:hover:text-primary-400 font-medium transition-colors">
                  Login
                </Link>
                <Link to="/register" className="bg-primary-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-primary-700 transition-colors shadow-sm">
                  Register
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center gap-2 md:hidden">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
            >
              {theme === 'light' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
            </button>
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="p-2 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 animation-fade-in">
          <div className="px-4 py-4 space-y-3">
            {user ? (
              <>
                {user.role === 'CITIZEN' ? (
                  <Link to="/profile" onClick={() => setMobileOpen(false)} className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800 text-slate-500 hover:text-primary-600 dark:text-slate-400 dark:hover:text-primary-400">
                    <UserCircle className="h-5 w-5" />
                    <span className="text-sm font-medium">{user.name}</span>
                  </Link>
                ) : (
                  <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
                    <UserCircle className="h-5 w-5 text-slate-500 dark:text-slate-400" />
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{user.name}</span>
                  </div>
                )}
                <Link to="/dashboard" onClick={() => setMobileOpen(false)} className="block py-2 text-slate-600 dark:text-slate-300 hover:text-primary-600 font-medium">
                  Dashboard
                </Link>
                {(user.role === 'ADMIN' || user.role === 'OFFICER') && (
                  <Link to="/security-lab" onClick={() => setMobileOpen(false)} className="block py-2 text-red-600 dark:text-red-400 font-bold">
                    Security Lab
                  </Link>
                )}
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 py-2 text-slate-500 dark:text-slate-400 hover:text-slate-700 font-medium w-full"
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" onClick={() => setMobileOpen(false)} className="block py-2 text-slate-600 dark:text-slate-300 hover:text-primary-600 font-medium">
                  Login
                </Link>
                <Link to="/register" onClick={() => setMobileOpen(false)} className="block py-2 bg-primary-600 text-white px-4 rounded-lg font-medium text-center">
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;

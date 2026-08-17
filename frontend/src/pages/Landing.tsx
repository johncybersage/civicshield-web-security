import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, Activity, Users, AlertTriangle } from 'lucide-react';

const Landing = () => {
  return (
    <div className="flex flex-col min-h-[calc(100vh-4rem)]">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="relative z-10 pb-8 bg-white sm:pb-16 md:pb-20 lg:max-w-2xl lg:w-full lg:pb-28 xl:pb-32 pt-20 px-4 sm:px-6 lg:px-8">
            <main className="mx-auto max-w-7xl">
              <div className="sm:text-center lg:text-left">
                <h1 className="text-4xl tracking-tight font-extrabold text-slate-900 sm:text-5xl md:text-6xl">
                  <span className="block xl:inline">Secure Community</span>{' '}
                  <span className="block text-primary-600 xl:inline">Incident Reporting</span>
                </h1>
                <p className="mt-3 text-base text-slate-500 sm:mt-5 sm:text-lg sm:max-w-xl sm:mx-auto md:mt-5 md:text-xl lg:mx-0">
                  Report. Analyze. Protect. Resolve. An AI-powered platform for citizens to report local issues securely, helping authorities maintain safe and functional communities.
                </p>
                <div className="mt-5 sm:mt-8 sm:flex sm:justify-center lg:justify-start">
                  <div className="rounded-md shadow">
                    <Link
                      to="/register"
                      className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 md:py-4 md:text-lg md:px-10 transition-colors"
                    >
                      Report an Issue
                    </Link>
                  </div>
                  <div className="mt-3 sm:mt-0 sm:ml-3">
                    <Link
                      to="/login"
                      className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-primary-700 bg-primary-100 hover:bg-primary-200 md:py-4 md:text-lg md:px-10 transition-colors"
                    >
                      Officer Login
                    </Link>
                  </div>
                </div>
              </div>
            </main>
          </div>
        </div>
        <div className="lg:absolute lg:inset-y-0 lg:right-0 lg:w-1/2 bg-slate-50 flex items-center justify-center p-12">
          <div className="relative w-full max-w-lg">
            <div className="absolute top-0 -left-4 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
            <div className="absolute top-0 -right-4 w-72 h-72 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
            <div className="absolute -bottom-8 left-20 w-72 h-72 bg-primary-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
            <div className="m-8 relative space-y-4">
              <div className="p-5 bg-white rounded-xl shadow-lg flex items-center space-x-4">
                <div className="p-3 bg-red-100 rounded-full"><AlertTriangle className="h-6 w-6 text-red-600" /></div>
                <div><p className="font-semibold">Pothole on Main St</p><p className="text-sm text-slate-500">AI Priority: High</p></div>
              </div>
              <div className="p-5 bg-white rounded-xl shadow-lg flex items-center space-x-4">
                <div className="p-3 bg-blue-100 rounded-full"><Activity className="h-6 w-6 text-blue-600" /></div>
                <div><p className="font-semibold">Broken Streetlight</p><p className="text-sm text-slate-500">Status: In Progress</p></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Feature section */}
      <div className="py-12 bg-slate-50 flex-grow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 hover-lift">
              <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mb-4">
                <Shield className="h-6 w-6 text-primary-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Secure by Design</h3>
              <p className="text-slate-500">Built with robust security measures to protect user data and prevent common web vulnerabilities like Stored XSS.</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 hover-lift">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                <Activity className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">AI-Powered Analysis</h3>
              <p className="text-slate-500">Utilizes Google Gemini AI to automatically categorize and prioritize complaints for faster resolution.</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 hover-lift">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                <Users className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Community Driven</h3>
              <p className="text-slate-500">Empowers citizens to take an active role in maintaining their local environment and infrastructure.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Landing;

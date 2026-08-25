import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import api from '../utils/api';
import { User, Phone, Mail, Calendar, CheckCircle, Clock, CheckCircle2, TrendingUp, AlertCircle, Settings, Camera, Shield, Save, X } from 'lucide-react';
import { format } from 'date-fns';

interface UserStats {
  total_complaints: number;
  submitted: number;
  in_progress: number;
  resolved: number;
  resolution_rate: number;
}

const CitizenProfile = () => {
  const { user, login } = useAuth();
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Edit Profile State
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(user?.name || '');
  const [editPhone, setEditPhone] = useState(user?.phone_number || '');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get('/users/me/stats');
        setStats(res.data);
      } catch (err) {
        console.error('Failed to load user stats');
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const res = await api.patch('/users/me', {
        name: editName,
        phone_number: editPhone
      });
      // Update local context manually or wait for next load
      // For a robust app, useAuth should expose an updateUser method
      // We'll update the context state by simulating login with existing token but new user data if possible,
      // But it's usually better to just reload or let context sync if it fetches on mount.
      window.location.reload(); 
    } catch (err) {
      alert('Failed to update profile');
      setIsSaving(false);
    }
  };

  const getInitials = (name: string) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animation-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Settings className="w-8 h-8 text-primary-600" />
          My Profile
        </h1>
        {!isEditing && (
          <button 
            onClick={() => setIsEditing(true)}
            className="flex items-center gap-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-primary-300 px-4 py-2 rounded-xl text-sm font-medium transition-all shadow-sm text-slate-700 dark:text-slate-300"
          >
            Edit Profile
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Profile Details Card */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
            <div className="h-32 bg-gradient-to-r from-primary-500 to-indigo-600 relative">
              <div className="absolute -bottom-12 left-6">
                <div className="w-24 h-24 bg-white dark:bg-slate-900 rounded-full flex items-center justify-center p-1 shadow-md">
                  <div className="w-full h-full bg-primary-100 dark:bg-primary-900/50 rounded-full flex items-center justify-center text-primary-700 dark:text-primary-300 text-3xl font-bold border-2 border-white dark:border-slate-800">
                    {getInitials(user?.name || '')}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="pt-16 pb-6 px-6">
              {isEditing ? (
                <form onSubmit={handleSaveProfile} className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Full Name</label>
                    <input 
                      type="text" 
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      required
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Phone Number</label>
                    <input 
                      type="tel" 
                      value={editPhone}
                      onChange={(e) => setEditPhone(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                  
                  <div className="flex gap-2 pt-2">
                    <button 
                      type="button" 
                      onClick={() => setIsEditing(false)}
                      className="flex-1 px-4 py-2 border border-slate-200 dark:border-slate-600 rounded-lg text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700"
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit" 
                      disabled={isSaving}
                      className="flex-1 flex items-center justify-center gap-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg text-sm font-medium disabled:opacity-50"
                    >
                      {isSaving ? 'Saving...' : <><Save className="w-4 h-4"/> Save</>}
                    </button>
                  </div>
                </form>
              ) : (
                <>
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-1">{user?.name}</h2>
                  <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 mb-6">
                    <Shield className="w-4 h-4 text-emerald-500" />
                    <span>Citizen Account</span>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-700/50 flex items-center justify-center text-slate-500">
                        <Mail className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-xs text-slate-400 font-medium">Email</p>
                        <p className="text-sm font-medium text-slate-900 dark:text-slate-200">{user?.email}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-700/50 flex items-center justify-center text-slate-500">
                        <Phone className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-xs text-slate-400 font-medium">Phone</p>
                        <p className="text-sm font-medium text-slate-900 dark:text-slate-200">{user?.phone_number || 'Not provided'}</p>
                      </div>
                      {user?.phone_number && (
                        <div className="ml-auto text-xs flex items-center gap-1 text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 px-2 py-1 rounded-full">
                          <CheckCircle className="w-3 h-3" /> Verified
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-700/50 flex items-center justify-center text-slate-500">
                        <Calendar className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-xs text-slate-400 font-medium">Joined</p>
                        <p className="text-sm font-medium text-slate-900 dark:text-slate-200">
                          {user?.created_at ? format(new Date(user.created_at), 'MMMM yyyy') : 'Unknown'}
                        </p>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Stats Section */}
        <div className="lg:col-span-2 space-y-6">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-700 pb-2">
            Civic Impact Dashboard
          </h3>
          
          {loading ? (
            <div className="grid grid-cols-2 gap-4">
              <div className="h-32 bg-slate-100 dark:bg-slate-800 rounded-2xl animate-pulse"></div>
              <div className="h-32 bg-slate-100 dark:bg-slate-800 rounded-2xl animate-pulse"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
                <div className="w-14 h-14 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-xl flex items-center justify-center shrink-0">
                  <TrendingUp className="w-7 h-7" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Total Reports</p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats?.total_complaints || 0}</p>
                </div>
              </div>

              <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
                <div className="w-14 h-14 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-xl flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-7 h-7" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Resolved Issues</p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats?.resolved || 0}</p>
                </div>
              </div>

              <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
                <div className="w-14 h-14 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-xl flex items-center justify-center shrink-0">
                  <Clock className="w-7 h-7" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Under Review</p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats?.submitted || 0}</p>
                </div>
              </div>

              <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
                <div className="w-14 h-14 bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded-xl flex items-center justify-center shrink-0">
                  <AlertCircle className="w-7 h-7" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-500 dark:text-slate-400">In Progress</p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats?.in_progress || 0}</p>
                </div>
              </div>
              
            </div>
          )}

          {/* Resolution Rate Bar */}
          {!loading && stats && stats.total_complaints > 0 && (
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm">
              <div className="flex justify-between items-end mb-2">
                <div>
                  <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Personal Resolution Rate</p>
                  <p className="text-xl font-bold text-slate-900 dark:text-white">{stats.resolution_rate.toFixed(1)}%</p>
                </div>
                <div className="text-xs text-slate-400">
                  {stats.resolved} of {stats.total_complaints} resolved
                </div>
              </div>
              <div className="w-full h-3 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-emerald-400 to-emerald-600 transition-all duration-1000 ease-out rounded-full"
                  style={{ width: `${stats.resolution_rate}%` }}
                ></div>
              </div>
            </div>
          )}
        </div>
        
      </div>
    </div>
  );
};

export default CitizenProfile;

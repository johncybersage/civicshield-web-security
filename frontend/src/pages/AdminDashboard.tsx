import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { Activity, ShieldAlert, Users } from 'lucide-react';

const AdminDashboard = () => {
  const [logs, setLogs] = useState([]);
  const [securityEvents, setSecurityEvents] = useState([]);

  useEffect(() => {
    fetchLogs();
    fetchSecurityEvents();
  }, []);

  const fetchLogs = async () => {
    try {
      const res = await api.get('/admin/audit-logs');
      setLogs(res.data);
    } catch (err) {}
  };

  const fetchSecurityEvents = async () => {
    try {
      const res = await api.get('/admin/security-events');
      setSecurityEvents(res.data);
    } catch (err) {}
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div className="flex items-center justify-between border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Admin Dashboard</h1>
          <p className="mt-2 text-sm text-slate-500">System monitoring and security oversight.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Security Events */}
        <div className="bg-white rounded-xl shadow border border-slate-200 overflow-hidden">
          <div className="px-4 py-5 border-b border-slate-200 sm:px-6 flex items-center justify-between bg-slate-50">
            <h3 className="text-lg leading-6 font-medium text-slate-900 flex items-center">
              <ShieldAlert className="h-5 w-5 text-red-500 mr-2" />
              Security Events
            </h3>
          </div>
          <ul className="divide-y divide-slate-200 max-h-[400px] overflow-y-auto">
            {securityEvents.map((event: any) => (
              <li key={event.id} className="p-4 hover:bg-slate-50">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm font-bold text-red-600">{event.event_type}</p>
                    <p className="text-xs text-slate-500 mt-1">{event.description}</p>
                  </div>
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
                    {event.severity}
                  </span>
                </div>
                <div className="mt-2 text-xs text-slate-400">
                  {new Date(event.timestamp).toLocaleString()} | IP: {event.source_ip}
                </div>
              </li>
            ))}
            {securityEvents.length === 0 && (
              <li className="p-4 text-sm text-slate-500 text-center">No security events logged.</li>
            )}
          </ul>
        </div>

        {/* Audit Logs */}
        <div className="bg-white rounded-xl shadow border border-slate-200 overflow-hidden">
          <div className="px-4 py-5 border-b border-slate-200 sm:px-6 flex items-center justify-between bg-slate-50">
            <h3 className="text-lg leading-6 font-medium text-slate-900 flex items-center">
              <Activity className="h-5 w-5 text-blue-500 mr-2" />
              Audit Logs
            </h3>
          </div>
          <ul className="divide-y divide-slate-200 max-h-[400px] overflow-y-auto">
            {logs.map((log: any) => (
              <li key={log.id} className="p-4 hover:bg-slate-50">
                <p className="text-sm font-medium text-slate-900">{log.action}</p>
                {log.metadata_info && (
                  <p className="text-xs text-slate-500 mt-1">{log.metadata_info}</p>
                )}
                <div className="mt-2 flex justify-between text-xs text-slate-400">
                  <span>User ID: {log.user_id || 'System'}</span>
                  <span>{new Date(log.timestamp).toLocaleString()}</span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;

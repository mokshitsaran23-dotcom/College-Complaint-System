import React, { useState } from 'react';
import { User } from '../types';

interface NavbarProps {
  user: User | null;
  onLogout: () => void;
  onSwitchUser?: (collegeId: string) => void;
  notifications: Array<{ id: string; title: string; time: string; referenceId?: string }>;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  user,
  onLogout,
  onSwitchUser,
  notifications,
  activeTab,
  setActiveTab
}) => {
  const [showNotifs, setShowNotifs] = useState(false);

  return (
    <header className="sticky top-0 z-50 glass-panel border-b border-slate-200/80 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Brand Logo */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab(user?.role === 'admin' ? 'queue' : 'my_complaints')}>
            <div className="w-10 h-10 rounded-xl brand-gradient flex items-center justify-center text-white font-bold text-xl shadow-md shadow-blue-500/20">
              ⚡
            </div>
            <div>
              <span className="text-xl font-extrabold brand-text-gradient tracking-tight">CampusCare</span>
              <span className="hidden sm:inline-block ml-2 text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">
                Complaint System
              </span>
            </div>
          </div>

          {/* Navigation Tabs depending on role */}
          {user && (
            <div className="flex items-center gap-1 sm:gap-2">
              {user.role === 'student' && (
                <>
                  <button
                    onClick={() => setActiveTab('submit')}
                    className={`px-3 py-1.5 text-sm font-semibold rounded-lg transition-all ${
                      activeTab === 'submit'
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                  >
                    + Report Issue
                  </button>
                  <button
                    onClick={() => setActiveTab('my_complaints')}
                    className={`px-3 py-1.5 text-sm font-semibold rounded-lg transition-all ${
                      activeTab === 'my_complaints'
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                  >
                    My Complaints
                  </button>
                </>
              )}

              {user.role === 'admin' && (
                <>
                  <button
                    onClick={() => setActiveTab('queue')}
                    className={`px-3 py-1.5 text-sm font-semibold rounded-lg transition-all ${
                      activeTab === 'queue'
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                  >
                    Triage Queue
                  </button>
                  <button
                    onClick={() => setActiveTab('reports')}
                    className={`px-3 py-1.5 text-sm font-semibold rounded-lg transition-all ${
                      activeTab === 'reports'
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                  >
                    Analytics & Reports
                  </button>
                </>
              )}

              {user.role === 'staff' && (
                <button
                  onClick={() => setActiveTab('staff_queue')}
                  className={`px-3 py-1.5 text-sm font-semibold rounded-lg transition-all ${
                    activeTab === 'staff_queue'
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  Assigned Work Orders ({user.department})
                </button>
              )}
            </div>
          )}

          {/* User Controls & Notifications */}
          {user ? (
            <div className="flex items-center gap-3">
              {/* Notification Bell */}
              <div className="relative">
                <button
                  onClick={() => setShowNotifs(!showNotifs)}
                  className="relative p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition"
                  aria-label="Notifications"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                  {notifications.length > 0 && (
                    <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full ring-2 ring-white animate-ping" />
                  )}
                  {notifications.length > 0 && (
                    <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full ring-2 ring-white" />
                  )}
                </button>

                {/* Notifications Dropdown */}
                {showNotifs && (
                  <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-slate-100 py-2 z-50">
                    <div className="px-4 py-2 border-b border-slate-100 font-semibold text-xs text-slate-400 uppercase tracking-wider">
                      Live Updates & Alerts
                    </div>
                    {notifications.length === 0 ? (
                      <div className="p-4 text-center text-xs text-slate-400">No new notifications</div>
                    ) : (
                      <div className="max-h-60 overflow-y-auto divide-y divide-slate-50">
                        {notifications.map((n) => (
                          <div key={n.id} className="p-3 hover:bg-slate-50 text-xs">
                            <p className="font-semibold text-slate-800">{n.title}</p>
                            <span className="text-slate-400 text-[10px]">{n.time}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* User Pill */}
              <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-bold text-xs flex items-center justify-center">
                  {user.name.charAt(0)}
                </div>
                <div className="hidden md:block text-left">
                  <div className="text-xs font-bold text-slate-800 leading-tight">{user.name}</div>
                  <div className="text-[10px] text-slate-500 font-medium">
                    {user.collegeId} • <span className="capitalize font-semibold text-blue-600">{user.role}</span>
                  </div>
                </div>
                <button
                  onClick={onLogout}
                  className="ml-2 text-xs font-medium text-slate-500 hover:text-red-600 p-1.5 rounded-lg hover:bg-red-50 transition"
                  title="Logout"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                </button>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </header>
  );
};

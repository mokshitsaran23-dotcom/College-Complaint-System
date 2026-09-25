import React, { useState, useEffect, useRef, useMemo } from 'react';
import { User, AppNotification } from '../types';

interface NavbarProps {
  user: User | null;
  onLogout: () => void;
  onSwitchUser?: (collegeId: string) => void;
  notifications: AppNotification[];
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onMarkNotificationRead?: (id: string) => void;
  onMarkAllNotificationsRead?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  user,
  onLogout,
  notifications,
  activeTab,
  setActiveTab,
  onMarkNotificationRead,
  onMarkAllNotificationsRead
}) => {
  const [showNotifs, setShowNotifs] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside or Escape key
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setShowNotifs(false);
      }
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setShowNotifs(false);
      }
    }
    if (showNotifs) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [showNotifs]);

  // Deduplicate notifications to avoid any duplicate listings
  const deduplicatedNotifications = useMemo(() => {
    const seen = new Set<string>();
    return notifications.filter(n => {
      const key = n.id || `${n.referenceId}-${n.title}-${n.message}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }, [notifications]);

  const unreadCount = deduplicatedNotifications.filter(n => !n.read).length;

  const isSubmitter = user?.role === 'student' || user?.role === 'staff';

  return (
    <header className="sticky top-0 z-50 glass-panel border-b border-slate-200/80 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Brand Logo */}
          <div
            className="flex items-center gap-3 cursor-pointer"
            onClick={() => setActiveTab(user?.role === 'admin' ? 'queue' : user?.role === 'worker' ? 'worker_queue' : 'my_complaints')}
          >
            <div className="w-10 h-10 rounded-xl brand-gradient flex items-center justify-center text-white font-bold text-xl shadow-md shadow-blue-500/20">
              🏛️
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
              {isSubmitter && (
                <>
                  <button
                    onClick={() => setActiveTab('submit')}
                    className={`px-3 py-1.5 text-xs sm:text-sm font-semibold rounded-lg transition-all ${
                      activeTab === 'submit'
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                  >
                    + Report Issue
                  </button>
                  <button
                    onClick={() => setActiveTab('my_complaints')}
                    className={`px-3 py-1.5 text-xs sm:text-sm font-semibold rounded-lg transition-all ${
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
                    className={`px-3 py-1.5 text-xs sm:text-sm font-semibold rounded-lg transition-all ${
                      activeTab === 'queue'
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                  >
                    Triage & Verifications
                  </button>
                  <button
                    onClick={() => setActiveTab('reports')}
                    className={`px-3 py-1.5 text-xs sm:text-sm font-semibold rounded-lg transition-all ${
                      activeTab === 'reports'
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                  >
                    Analytics & Reports
                  </button>
                </>
              )}

              {user.role === 'worker' && (
                <button
                  onClick={() => setActiveTab('worker_queue')}
                  className={`px-3 py-1.5 text-xs sm:text-sm font-semibold rounded-lg transition-all ${
                    activeTab === 'worker_queue'
                      ? 'bg-amber-600 text-white shadow-sm'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-amber-50'
                  }`}
                >
                  👷 Worker Tasks ({user.department || 'Crew'})
                  Supervisor Queue ({user.department})
                </button>
              )}

              {user.role === 'worker' && (
                <button
                  onClick={() => setActiveTab('worker_queue')}
                  className={`px-3 py-1.5 text-sm font-semibold rounded-lg transition-all ${
                    activeTab === 'worker_queue'
                      ? 'bg-amber-600 text-white shadow-sm'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-amber-50'
                  }`}
                >
                  👷 Worker Tasks ({user.department})
                </button>
              )}
            </div>
          )}

          {/* User Controls & Notifications */}
          {user ? (
            <div className="flex items-center gap-3">
              {/* Notification Bell */}
              <div className="relative" ref={notifRef}>
                <button
                  type="button"
                  id="navbar-notification-bell"
                  onClick={() => setShowNotifs((prev) => !prev)}
                  className={`relative p-2 rounded-xl transition flex items-center justify-center ${
                    showNotifs
                      ? 'bg-blue-50 text-blue-600 ring-2 ring-blue-500/20'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                  aria-label={`Notifications ${unreadCount > 0 ? `(${unreadCount} unread)` : ''}`}
                  title={unreadCount > 0 ? `${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}` : 'Notifications'}
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                    />
                  </svg>

                  {/* Red Badge with unread count */}
                  {unreadCount > 0 && (
                    <>
                      <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-red-600 text-white text-[10px] font-black rounded-full flex items-center justify-center ring-2 ring-white shadow-xs">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                      <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full animate-ping opacity-75 pointer-events-none" />
                    </>
                  )}
                </button>

                {/* Notifications Dropdown */}
                {showNotifs && (
                  <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-slate-200/90 py-2 z-50 animate-in zoom-in-95 duration-150">
                    <div className="px-4 py-2.5 border-b border-slate-100 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-xs text-slate-800 uppercase tracking-wider">
                          Notifications
                        </span>
                        {unreadCount > 0 ? (
                          <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-blue-100 text-blue-800 font-mono">
                            {unreadCount} unread
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 text-[10px] font-medium rounded-full bg-slate-100 text-slate-500">
                            All read
                          </span>
                        )}
                      </div>

                      {unreadCount > 0 && onMarkAllNotificationsRead && (
                        <button
                          type="button"
                          onClick={() => onMarkAllNotificationsRead()}
                          className="text-[11px] text-blue-600 hover:text-blue-800 font-bold hover:underline transition"
                        >
                          Mark all as read
                        </button>
                      )}
                    </div>

                    {deduplicatedNotifications.length === 0 ? (
                      <div className="p-8 text-center text-xs text-slate-400 space-y-1.5">
                        <div className="text-2xl mb-1">🔔</div>
                        <p className="font-semibold text-slate-700">No notifications yet</p>
                        <p className="text-[11px] text-slate-400">
                          Status updates and ticket notifications will appear here.
                        </p>
                      </div>
                    ) : (
                      <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                        {deduplicatedNotifications.map((n) => {
                          const isUnread = n.read === false;
                          return (
                            <div
                              key={n.id}
                              onClick={() => {
                                if (isUnread && onMarkNotificationRead) {
                                  onMarkNotificationRead(n.id);
                                }
                              }}
                              className={`p-3.5 text-xs transition cursor-pointer flex gap-3 items-start ${
                                isUnread
                                  ? 'bg-blue-50/50 hover:bg-blue-50/80 border-l-4 border-l-blue-600'
                                  : 'hover:bg-slate-50 border-l-4 border-l-transparent text-slate-600'
                              }`}
                            >
                              {/* Read/Unread Indicator Dot */}
                              <div className="pt-1">
                                <span
                                  className={`block w-2 h-2 rounded-full ${
                                    isUnread ? 'bg-blue-600 ring-2 ring-blue-200' : 'bg-slate-300'
                                  }`}
                                />
                              </div>

                              <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-start gap-1">
                                  <p className={`font-bold truncate ${isUnread ? 'text-slate-900' : 'text-slate-700'}`}>
                                    {n.title}
                                  </p>
                                  {n.referenceId && (
                                    <span className="font-mono text-[10px] text-blue-700 bg-blue-100/70 px-1.5 py-0.5 rounded border border-blue-200 shrink-0 font-bold">
                                      {n.referenceId}
                                    </span>
                                  )}
                                </div>
                                {n.message && (
                                  <p className="text-slate-600 text-[11px] mt-1 leading-relaxed line-clamp-2">
                                    {n.message}
                                  </p>
                                )}
                                <div className="flex items-center justify-between mt-1.5 pt-0.5">
                                  <span className="text-slate-400 text-[10px] font-medium">
                                    {n.time || (n.timestamp ? new Date(n.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Recently')}
                                  </span>
                                  {isUnread && onMarkNotificationRead && (
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        onMarkNotificationRead(n.id);
                                      }}
                                      className="text-[10px] text-blue-600 hover:text-blue-800 font-semibold"
                                    >
                                      Mark read ✓
                                    </button>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })}
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

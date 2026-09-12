import React, { useEffect, useState } from 'react';
import { Complaint, ReportSummary, User } from './types';
import { Navbar } from './components/Navbar';
import { NotificationToast, ToastItem } from './components/NotificationToast';
import { LoginPage } from './pages/LoginPage';
import { StudentDashboard } from './pages/StudentDashboard';
import { AdminDashboard } from './pages/AdminDashboard';
import { StaffDashboard } from './pages/StaffDashboard';
import { api } from './services/api';
import { subscribeToUserNotifications } from './services/socket';

export const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('auth_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [reportSummary, setReportSummary] = useState<ReportSummary | null>(null);
  const [activeTab, setActiveTab] = useState<string>('my_complaints');
  const [notifications, setNotifications] = useState<Array<{ id: string; title: string; time: string; referenceId?: string }>>([]);
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  // Auto-set default tab on login or role switch
  useEffect(() => {
    if (!user) return;
    if (user.role === 'student') setActiveTab('my_complaints');
    else if (user.role === 'admin') setActiveTab('queue');
    else if (user.role === 'staff') setActiveTab('staff_queue');
  }, [user?.role]);

  // Load complaints and reports
  const refreshData = async () => {
    if (!user) return;
    try {
      const list = await api.getComplaints();
      setComplaints(list);
      if (user.role === 'admin') {
        const rep = await api.getReports();
        setReportSummary(rep);
      }
    } catch (err) {
      console.error('Error refreshing data:', err);
    }
  };

  useEffect(() => {
    refreshData();
  }, [user?.collegeId, user?.role]);

  // Real-time Socket.io Notification Listener
  useEffect(() => {
    if (!user) return;
    const unsubscribe = subscribeToUserNotifications(user.collegeId, (event: any) => {
      console.log('[Real-time] Received notification:', event);
      const newToast: ToastItem = {
        id: 'toast_' + Date.now(),
        referenceId: event.referenceId || 'COMPLAINT',
        title: `Status updated to ${event.toStatus}`,
        status: event.toStatus,
        note: event.note,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setToasts(prev => [newToast, ...prev].slice(0, 3));
      setNotifications(prev => [
        {
          id: 'n_' + Date.now(),
          title: `[${event.referenceId}] Progressed to ${event.toStatus}`,
          time: 'Just now',
          referenceId: event.referenceId
        },
        ...prev
      ]);

      // Refresh complaints list to reflect changes in real time
      refreshData();
    });

    return () => {
      unsubscribe();
    };
  }, [user?.collegeId]);

  const handleLoginSuccess = (loggedInUser: User) => {
    setUser(loggedInUser);
  };

  const handleLogout = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
    setUser(null);
    setComplaints([]);
    setToasts([]);
    setNotifications([]);
  };

  const handleComplaintCreated = (newC: Complaint) => {
    setComplaints(prev => [newC, ...prev]);
    if (user?.role === 'admin') refreshData();
  };

  const handleComplaintUpdated = (updated: Complaint) => {
    setComplaints(prev => prev.map(c => c.id === updated.id ? updated : c));
    if (user?.role === 'admin') refreshData();
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 via-blue-50/20 to-slate-100">
      <Navbar
        user={user}
        onLogout={handleLogout}
        notifications={notifications}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      <main className="flex-1">
        {!user ? (
          <LoginPage onLoginSuccess={handleLoginSuccess} />
        ) : (
          <>
            {user.role === 'student' && (
              <StudentDashboard
                user={user}
                complaints={complaints}
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                onComplaintCreated={handleComplaintCreated}
                onComplaintUpdated={handleComplaintUpdated}
              />
            )}

            {user.role === 'admin' && (
              <AdminDashboard
                user={user}
                complaints={complaints}
                reportSummary={reportSummary}
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                onComplaintUpdated={handleComplaintUpdated}
              />
            )}

            {user.role === 'staff' && (
              <StaffDashboard
                user={user}
                complaints={complaints}
                onComplaintUpdated={handleComplaintUpdated}
              />
            )}
          </>
        )}
      </main>

      <footer className="py-6 border-t border-slate-200/80 text-center text-xs text-slate-400">
        <p>© 2026 CampusCare • Higher Education Facilities & Complaint Management System</p>
      </footer>

      {/* Floating Real-Time Toasts */}
      <NotificationToast
        toasts={toasts}
        onDismiss={(id) => setToasts(prev => prev.filter(t => t.id !== id))}
      />
    </div>
  );
};

export default App;

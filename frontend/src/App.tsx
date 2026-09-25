import React, { useEffect, useState } from 'react';
import { Complaint, ReportSummary, User, AppNotification } from './types';
import { Navbar } from './components/Navbar';
import { LoginPage } from './pages/LoginPage';
import { StudentDashboard } from './pages/StudentDashboard';
import { StaffDashboard } from './pages/StaffDashboard';
import { AdminDashboard } from './pages/AdminDashboard';
import { WorkerDashboard } from './pages/WorkerDashboard';
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
  const [notifications, setNotifications] = useState<AppNotification[]>([]);

  // Auto-set default tab on login or role switch
  useEffect(() => {
    if (!user) return;
    if (user.role === 'student' || user.role === 'staff') {
      setActiveTab('my_complaints');
    } else if (user.role === 'admin') {
      setActiveTab('queue');
    } else if (user.role === 'worker') {
      setActiveTab('worker_queue');
    }
  }, [user?.role]);

  // Load complaints, notifications, and reports
  const refreshData = async () => {
    if (!user) return;
    try {
      const list = await api.getComplaints();
      setComplaints(list);

      if (user.role === 'admin') {
        const rep = await api.getReports();
        setReportSummary(rep);
      }

      const notifs = await api.getNotifications();
      if (notifs) {
        setNotifications(prev => {
          const map = new Map<string, AppNotification>();
          prev.forEach(p => map.set(p.id, p));
          notifs.forEach(n => {
            const existing = map.get(n.id);
            map.set(n.id, {
              ...n,
              read: existing?.read !== undefined ? existing.read : n.read
            });
          });
          return Array.from(map.values()).sort((a, b) => {
            const timeA = a.timestamp ? new Date(a.timestamp).getTime() : 0;
            const timeB = b.timestamp ? new Date(b.timestamp).getTime() : 0;
            return timeB - timeA;
          });
        });
      }
    } catch (err) {
      console.error('Error refreshing data:', err);
    }
  };

  useEffect(() => {
    refreshData();
  }, [user?.collegeId, user?.role]);

  // Real-time Socket.io Notification Listener (exclusively updates bell icon dropdown)
  useEffect(() => {
    if (!user) return;
    const unsubscribe = subscribeToUserNotifications(user, (event: any) => {
      console.log('[Real-time Event Received]', event);

      const notifTitle = event.title || `Status updated to ${event.toStatus || event.status || 'Updated'}`;
      const notifNote = event.message || event.note || '';
      const notifId = event.id || ('notif_rt_' + Date.now());

      setNotifications(prev => {
        // Prevent duplicate alerts
        const alreadyExists = prev.some(n =>
          n.id === notifId ||
          (n.referenceId === event.referenceId && n.title === notifTitle && n.message === notifNote)
        );
        if (alreadyExists) return prev;

        const newNotif: AppNotification = {
          id: notifId,
          title: notifTitle,
          message: notifNote,
          time: 'Just now',
          referenceId: event.referenceId,
          read: false,
          timestamp: new Date().toISOString()
        };
        return [newNotif, ...prev];
      });

      // Refresh complaints in real time to reflect state transitions
      api.getComplaints().then(setComplaints).catch(console.error);
      if (user.role === 'admin') {
        api.getReports().then(setReportSummary).catch(console.error);
      }
    });

    return () => {
      unsubscribe();
    };
  }, [user?.collegeId, user?.role, user?.department]);

  const handleLoginSuccess = (loggedInUser: User) => {
    setUser(loggedInUser);
  };

  const handleLogout = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
    setUser(null);
    setComplaints([]);
    setNotifications([]);
  };

  const handleComplaintCreated = (newC: Complaint) => {
    setComplaints(prev => [newC, ...prev]);
    refreshData();
  };

  const handleComplaintUpdated = (updated: Complaint) => {
    setComplaints(prev => prev.map(c => c.id === updated.id ? updated : c));
    refreshData();
  };

  const handleMarkNotificationRead = async (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    try {
      await api.markNotificationRead(id);
    } catch {
      // ignore
    }
  };

  const handleMarkAllNotificationsRead = async () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    try {
      await api.markAllNotificationsRead();
    } catch {
      // ignore
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 via-blue-50/20 to-slate-100">
      <Navbar
        user={user}
        onLogout={handleLogout}
        notifications={notifications}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onMarkNotificationRead={handleMarkNotificationRead}
        onMarkAllNotificationsRead={handleMarkAllNotificationsRead}
      />

      <main className="flex-1">
        {!user ? (
          <LoginPage onLoginSuccess={handleLoginSuccess} />
        ) : (
          <>
            {/* Student Dashboard */}
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

            {/* Staff Dashboard */}
            {user.role === 'staff' && (
              <StaffDashboard
                user={user}
                complaints={complaints}
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                onComplaintCreated={handleComplaintCreated}
                onComplaintUpdated={handleComplaintUpdated}
              />
            )}

            {/* Admin Management Dashboard */}
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

            {/* Worker Field Maintenance Dashboard */}
            {user.role === 'worker' && (
              <WorkerDashboard
                user={user}
                complaints={complaints}
                onComplaintUpdated={handleComplaintUpdated}
              />
            )}
          </>
        )}
      </main>

      <footer className="py-6 border-t border-slate-200/80 text-center text-xs text-slate-400">
        <p>© 2026 CampusCare • Smart Complaint Management System</p>
      </footer>
    </div>
  );
};

export default App;

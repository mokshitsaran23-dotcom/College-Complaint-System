import React, { useState } from 'react';
import { User } from '../types';
import { api } from '../services/api';

interface LoginPageProps {
  onLoginSuccess: (user: User, token: string) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess }) => {
  const [collegeId, setCollegeId] = useState('STU101');
  const [password, setPassword] = useState('student123');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const data = await api.login(collegeId, password);
      localStorage.setItem('auth_token', data.token);
      localStorage.setItem('auth_user', JSON.stringify(data.user));
      onLoginSuccess(data.user, data.token);
    } catch (err: any) {
      setError(err.message || 'Login failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  const setDemoPersona = (id: string, pwd: string) => {
    setCollegeId(id);
    setPassword(pwd);
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4">
      <div className="max-w-md w-full glass-card rounded-2xl p-8 border border-slate-200/80 shadow-2xl">
        <div className="text-center mb-8">
          <div className="w-14 h-14 mx-auto rounded-2xl brand-gradient flex items-center justify-center text-white text-2xl font-bold shadow-lg shadow-blue-500/30 mb-3">
            🏛️
          </div>
          <h2 className="text-2xl font-extrabold text-slate-800 tracking-tight">Institutional Portal Sign-In</h2>
          <p className="text-xs text-slate-500 mt-1">
            Access CampusCare digital ticketing using verified college credentials.
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2">
            <span>⚠️</span>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">College ID / Roll Number</label>
            <input
              type="text"
              required
              value={collegeId}
              onChange={(e) => setCollegeId(e.target.value)}
              placeholder="e.g. STU101, ADM001, STF201"
              className="w-full px-4 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Institutional password"
              className="w-full px-4 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xs rounded-xl shadow-md shadow-blue-500/20 transition-all hover:shadow-lg disabled:opacity-50"
          >
            {loading ? 'Authenticating...' : 'Sign In with SSO'}
          </button>
        </form>

        {/* Demo Persona Quick-Fill */}
        <div className="mt-8 pt-6 border-t border-slate-100">
          <span className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider text-center mb-3">
            Quick Persona Switcher (For Evaluation)
          </span>
          <div className="grid grid-cols-2 gap-2 text-[11px]">
            <button
              type="button"
              onClick={() => setDemoPersona('STU101', 'student123')}
              className="p-2 border border-slate-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 text-left font-medium transition"
            >
              🎓 <span className="font-bold text-slate-800">Student Login</span>
              <div className="text-[10px] text-slate-400">STU101</div>
            </button>
            <button
              type="button"
              onClick={() => setDemoPersona('WRK301', 'worker123')}
              className="p-2 border border-amber-200 bg-amber-50/50 hover:border-amber-500 hover:bg-amber-100/50 text-left font-medium transition"
            >
              👷 <span className="font-bold text-slate-800">Worker Login</span>
              <div className="text-[10px] text-amber-700">WRK301 (Electrical)</div>
            </button>
            <button
              type="button"
              onClick={() => setDemoPersona('STF201', 'staff123')}
              className="p-2 border border-slate-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 text-left font-medium transition"
            >
              ⚡ <span className="font-bold text-slate-800">Staff Login</span>
              <div className="text-[10px] text-slate-400">STF201 (Supervisor)</div>
            </button>
            <button
              type="button"
              onClick={() => setDemoPersona('ADM001', 'admin123')}
              className="p-2 border border-slate-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 text-left font-medium transition"
            >
              🛡️ <span className="font-bold text-slate-800">Admin Login</span>
              <div className="text-[10px] text-slate-400">ADM001 (Director)</div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { User, Role } from '../types';
import { api } from '../services/api';

interface LoginPageProps {
  onLoginSuccess: (user: User, token: string) => void;
}

type AuthMode = 'login' | 'register';

export const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess }) => {
  const [authMode, setAuthMode] = useState<AuthMode>('login');

  // Common Login Form State
  const [loginRole, setLoginRole] = useState<Role>('student');
  const [identifier, setIdentifier] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  // Registration Form State (Student and Staff only - Workers cannot register)
  const [regRole, setRegRole] = useState<'student' | 'staff'>('student');
  const [studentForm, setStudentForm] = useState({
    name: '',
    registerNumber: '',
    department: 'Computer Science',
    year: '1st Year',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });

  const [staffForm, setStaffForm] = useState({
    name: '',
    staffId: '',
    department: 'Electrical Engineering',
    designation: 'Assistant Professor',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });

  const [showRegPassword, setShowRegPassword] = useState(false);

  // Common UI State
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Handle Login Submission
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMessage(null);

    if (!identifier.trim() || !loginPassword) {
      if (loginRole === 'worker') {
        setError('Please enter your Worker ID/Email and password.');
      } else {
        setError('Please provide both your Email/ID and password.');
      }
      setLoading(false);
      return;
    }

    try {
      const data = await api.login(loginRole, identifier.trim(), loginPassword);
      localStorage.setItem('auth_token', data.token);
      localStorage.setItem('auth_user', JSON.stringify(data.user));
      onLoginSuccess(data.user, data.token);
    } catch (err: any) {
      setError(err.message || 'Login failed. Please verify your credentials and selected role.');
    } finally {
      setLoading(false);
    }
  };

  // Handle Registration Submission (Students & Staff Only)
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMessage(null);

    let payload: any = null;

    if (regRole === 'student') {
      const { name, registerNumber, department, year, email, phone, password, confirmPassword } = studentForm;
      if (!name || !registerNumber || !department || !year || !email || !phone || !password) {
        setError('All student registration fields are required.');
        setLoading(false);
        return;
      }
      if (password.length < 6) {
        setError('Password must be at least 6 characters long.');
        setLoading(false);
        return;
      }
      if (password !== confirmPassword) {
        setError('Passwords do not match.');
        setLoading(false);
        return;
      }
      payload = { ...studentForm };
    } else if (regRole === 'staff') {
      const { name, staffId, department, designation, email, phone, password, confirmPassword } = staffForm;
      if (!name || !staffId || !department || !designation || !email || !phone || !password) {
        setError('All staff registration fields are required.');
        setLoading(false);
        return;
      }
      if (password.length < 6) {
        setError('Password must be at least 6 characters long.');
        setLoading(false);
        return;
      }
      if (password !== confirmPassword) {
        setError('Passwords do not match.');
        setLoading(false);
        return;
      }
      payload = { ...staffForm };
    }

    try {
      const res = await api.register(regRole, payload);
      setSuccessMessage(
        res.message ||
        `Registration successful for ${regRole.toUpperCase()}! You can now log in using your ID and password.`
      );
      // Auto pre-fill login credentials
      const createdId =
        regRole === 'student'
          ? studentForm.registerNumber
          : staffForm.staffId;
      const createdPwd =
        regRole === 'student'
          ? studentForm.password
          : staffForm.password;

      setLoginRole(regRole);
      setIdentifier(createdId);
      setLoginPassword('');
      setAuthMode('login');
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please check your inputs.');
    } finally {
      setLoading(false);
    }
  };

  const roleMeta: Record<Role, { label: string; icon: string; idLabel: string; idPlaceholder: string; color: string }> = {
    student: {
      label: 'Student',
      icon: '🎓',
      idLabel: 'Email or Register Number',
      idPlaceholder: 'Enter Register Number (e.g. STU101) or College Email',
      color: 'blue'
    },
    staff: {
      label: 'Staff / Faculty',
      icon: '🏛️',
      idLabel: 'Email or Staff ID',
      idPlaceholder: 'Enter Staff ID (e.g. STF201) or College Email',
      color: 'indigo'
    },
    worker: {
      label: 'Worker',
      icon: '👷',
      idLabel: 'Worker ID or Email',
      idPlaceholder: 'Enter Worker ID (e.g. WRK301) or Email',
      color: 'amber'
    },
    admin: {
      label: 'Campus Admin',
      icon: '🛡️',
      idLabel: 'Admin Email or Admin ID',
      idPlaceholder: 'Enter Admin ID (e.g. ADM001) or Admin Email',
      color: 'rose'
    }
  };

  return (
    <div className="min-h-[calc(100vh-4.5rem)] flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="max-w-xl w-full glass-card rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-2xl backdrop-blur-xl bg-white/95">
        
        {/* Header Branding */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-sky-500 text-white text-3xl shadow-lg shadow-blue-500/25 mb-3 ring-4 ring-blue-50">
            🏛️
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-800 tracking-tight">
            Digital College Complaint & Maintenance Portal
          </h1>
          <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
            Role-based institutional authentication for campus facilities, issue reporting, and workflow tracking.
          </p>
        </div>

        {/* Auth Mode Tabs: Sign In vs Register */}
        <div className="flex bg-slate-100/80 p-1 rounded-2xl mb-6 border border-slate-200/60">
          <button
            type="button"
            onClick={() => {
              setAuthMode('login');
              setError(null);
            }}
            className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all ${
              authMode === 'login'
                ? 'bg-white text-blue-700 shadow-sm shadow-slate-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            🔐 Sign In to Account
          </button>
          <button
            type="button"
            onClick={() => {
              setAuthMode('register');
              setError(null);
            }}
            className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all ${
              authMode === 'register'
                ? 'bg-white text-blue-700 shadow-sm shadow-slate-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            📝 New Registration
          </button>
        </div>

        {/* Global Error Banner */}
        {error && (
          <div className="mb-5 p-3.5 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-2xl flex items-start gap-2.5 animate-in fade-in shadow-xs">
            <span className="text-base leading-none">⚠️</span>
            <div className="flex-1 font-medium leading-relaxed">{error}</div>
          </div>
        )}

        {/* Global Success Banner */}
        {successMessage && (
          <div className="mb-5 p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-2xl flex items-start gap-2.5 animate-in fade-in shadow-xs">
            <span className="text-base leading-none">✅</span>
            <div className="flex-1 font-medium leading-relaxed">{successMessage}</div>
          </div>
        )}

        {/* -------------------- TAB 1: COMMON LOGIN FORM -------------------- */}
        {authMode === 'login' && (
          <div>
            <form onSubmit={handleLogin} className="space-y-4">
              {/* Role Selection */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">
                  Select Your Role <span className="text-rose-500">*</span>
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {(['student', 'staff', 'worker', 'admin'] as Role[]).map((r) => {
                    const isSelected = loginRole === r;
                    return (
                      <button
                        key={r}
                        type="button"
                        onClick={() => {
                          setLoginRole(r);
                          setError(null);
                        }}
                        className={`p-2.5 rounded-xl border text-center transition-all flex flex-col items-center gap-1 ${
                          isSelected
                            ? 'border-blue-600 bg-blue-50/80 text-blue-800 font-bold shadow-xs ring-2 ring-blue-500/20'
                            : 'border-slate-200 bg-slate-50/50 text-slate-600 hover:bg-slate-100 hover:text-slate-900 font-medium'
                        }`}
                      >
                        <span className="text-lg">{roleMeta[r].icon}</span>
                        <span className="text-[11px] capitalize">{roleMeta[r].label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Email or ID */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {roleMeta[loginRole].idLabel} <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder={roleMeta[loginRole].idPlaceholder}
                    className="w-full px-4 py-2.5 text-xs bg-slate-50/80 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white focus:outline-none transition font-medium"
                  />
                  <div className="absolute right-3 top-2.5 text-xs text-slate-400">
                    {loginRole === 'admin' ? '🛡️' : loginRole === 'worker' ? '👷' : '👤'}
                  </div>
                </div>
                <p className="text-[10px] text-slate-400 mt-1">
                  {loginRole === 'admin'
                    ? 'Enter your institutional Admin ID (ADM001) or registered admin email.'
                    : loginRole === 'worker'
                    ? 'Enter your assigned Worker ID or institutional email, and password.'
                    : `Authenticate using your assigned ${roleMeta[loginRole].label} ID or verified email address.`}
                </p>
              </div>

              {/* Password */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Password <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showLoginPassword ? 'text' : 'password'}
                    required
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="Institutional password"
                    className="w-full px-4 py-2.5 text-xs bg-slate-50/80 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white focus:outline-none transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowLoginPassword(!showLoginPassword)}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 text-xs"
                  >
                    {showLoginPassword ? '🙈' : '👁️'}
                  </button>
                </div>
              </div>

              {/* Login Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 via-indigo-600 to-sky-600 hover:from-blue-700 hover:to-indigo-700 text-white font-extrabold text-xs rounded-xl shadow-lg shadow-blue-500/25 transition-all hover:shadow-xl disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <span className="animate-spin text-sm">🔄</span>
                    <span>Validating Credentials...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In as {roleMeta[loginRole].label}</span>
                    <span>➔</span>
                  </>
                )}
              </button>
            </form>
          </div>
        )}

        {/* -------------------- TAB 2: REGISTRATION FORM (STUDENTS & STAFF ONLY) -------------------- */}
        {authMode === 'register' && (
          <div>
            {/* Role Selection for Registration (Admin & Worker Disabled / Not Allowed) */}
            <div className="mb-4">
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Register as: <span className="text-rose-500">*</span>
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setRegRole('student')}
                  className={`p-2.5 rounded-xl border text-center transition flex flex-col items-center gap-1 ${
                    regRole === 'student'
                      ? 'border-blue-600 bg-blue-50 text-blue-800 font-bold ring-2 ring-blue-500/20'
                      : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100 font-medium'
                  }`}
                >
                  <span className="text-lg">🎓</span>
                  <span className="text-[11px]">Student</span>
                </button>

                <button
                  type="button"
                  onClick={() => setRegRole('staff')}
                  className={`p-2.5 rounded-xl border text-center transition flex flex-col items-center gap-1 ${
                    regRole === 'staff'
                      ? 'border-indigo-600 bg-indigo-50 text-indigo-800 font-bold ring-2 ring-indigo-500/20'
                      : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100 font-medium'
                  }`}
                >
                  <span className="text-lg">🏛️</span>
                  <span className="text-[11px]">Staff</span>
                </button>
              </div>

              {/* Institutional Notice regarding Admin & Worker */}
              <div className="mt-2.5 p-2.5 bg-slate-100/80 rounded-xl border border-slate-200/60 flex items-center gap-2 text-[11px] text-slate-500">
                <span>🛡️</span>
                <span>
                  <strong>Notice:</strong> Admin and Worker accounts cannot register publicly. Worker IDs and Admin accounts are assigned and managed directly by the Administration.
                </span>
              </div>
            </div>

            <form onSubmit={handleRegister} className="space-y-3.5">
              {/* STUDENT REGISTRATION FIELDS */}
              {regRole === 'student' && (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        Full Name <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Alex Johnson"
                        value={studentForm.name}
                        onChange={(e) => setStudentForm({ ...studentForm, name: e.target.value })}
                        className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        Register Number (Unique) <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. STU202601"
                        value={studentForm.registerNumber}
                        onChange={(e) => setStudentForm({ ...studentForm, registerNumber: e.target.value.toUpperCase() })}
                        className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white font-mono"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        Department <span className="text-rose-500">*</span>
                      </label>
                      <select
                        value={studentForm.department}
                        onChange={(e) => setStudentForm({ ...studentForm, department: e.target.value })}
                        className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white"
                      >
                        <option value="Computer Science">Computer Science</option>
                        <option value="Electrical Engineering">Electrical Engineering</option>
                        <option value="Mechanical Engineering">Mechanical Engineering</option>
                        <option value="Civil Engineering">Civil Engineering</option>
                        <option value="Electronics & Comm">Electronics & Comm</option>
                        <option value="Information Technology">Information Technology</option>
                        <option value="Management Studies">Management Studies</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        Year <span className="text-rose-500">*</span>
                      </label>
                      <select
                        value={studentForm.year}
                        onChange={(e) => setStudentForm({ ...studentForm, year: e.target.value })}
                        className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white"
                      >
                        <option value="1st Year">1st Year</option>
                        <option value="2nd Year">2nd Year</option>
                        <option value="3rd Year">3rd Year</option>
                        <option value="4th Year">4th Year</option>
                        <option value="Postgraduate">Postgraduate</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        College Email (Unique) <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="email"
                        required
                        placeholder="alex@college.edu"
                        value={studentForm.email}
                        onChange={(e) => setStudentForm({ ...studentForm, email: e.target.value })}
                        className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        Phone Number <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="tel"
                        required
                        placeholder="10-digit mobile"
                        value={studentForm.phone}
                        onChange={(e) => setStudentForm({ ...studentForm, phone: e.target.value })}
                        className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        Password <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type={showRegPassword ? 'text' : 'password'}
                        required
                        placeholder="Min 6 characters"
                        value={studentForm.password}
                        onChange={(e) => setStudentForm({ ...studentForm, password: e.target.value })}
                        className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        Confirm Password <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type={showRegPassword ? 'text' : 'password'}
                        required
                        placeholder="Re-enter password"
                        value={studentForm.confirmPassword}
                        onChange={(e) => setStudentForm({ ...studentForm, confirmPassword: e.target.value })}
                        className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white"
                      />
                    </div>
                  </div>
                </>
              )}

              {/* STAFF REGISTRATION FIELDS */}
              {regRole === 'staff' && (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        Full Name <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Dr. Robert Davis"
                        value={staffForm.name}
                        onChange={(e) => setStaffForm({ ...staffForm, name: e.target.value })}
                        className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        Staff ID (Unique) <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. STF202601"
                        value={staffForm.staffId}
                        onChange={(e) => setStaffForm({ ...staffForm, staffId: e.target.value.toUpperCase() })}
                        className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white font-mono"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        Department <span className="text-rose-500">*</span>
                      </label>
                      <select
                        value={staffForm.department}
                        onChange={(e) => setStaffForm({ ...staffForm, department: e.target.value })}
                        className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white"
                      >
                        <option value="Electrical Engineering">Electrical Engineering</option>
                        <option value="Computer Science">Computer Science</option>
                        <option value="Mechanical Engineering">Mechanical Engineering</option>
                        <option value="Civil Engineering">Civil Engineering</option>
                        <option value="Administration">Administration</option>
                        <option value="Student Affairs">Student Affairs</option>
                        <option value="Library Services">Library Services</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        Designation <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Professor / Lab Incharge"
                        value={staffForm.designation}
                        onChange={(e) => setStaffForm({ ...staffForm, designation: e.target.value })}
                        className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        College Email (Unique) <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="email"
                        required
                        placeholder="staff.member@college.edu"
                        value={staffForm.email}
                        onChange={(e) => setStaffForm({ ...staffForm, email: e.target.value })}
                        className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        Phone Number <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="tel"
                        required
                        placeholder="10-digit mobile"
                        value={staffForm.phone}
                        onChange={(e) => setStaffForm({ ...staffForm, phone: e.target.value })}
                        className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        Password <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type={showRegPassword ? 'text' : 'password'}
                        required
                        placeholder="Min 6 characters"
                        value={staffForm.password}
                        onChange={(e) => setStaffForm({ ...staffForm, password: e.target.value })}
                        className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        Confirm Password <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type={showRegPassword ? 'text' : 'password'}
                        required
                        placeholder="Re-enter password"
                        value={staffForm.confirmPassword}
                        onChange={(e) => setStaffForm({ ...staffForm, confirmPassword: e.target.value })}
                        className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white"
                      />
                    </div>
                  </div>
                </>
              )}

              {/* Password visibility toggle */}
              <div className="flex items-center gap-2 pt-1 text-xs text-slate-500">
                <input
                  type="checkbox"
                  id="showRegPwd"
                  checked={showRegPassword}
                  onChange={(e) => setShowRegPassword(e.target.checked)}
                  className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="showRegPwd" className="cursor-pointer">
                  Show passwords while typing
                </label>
              </div>

              {/* Submit Registration Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 mt-2 bg-gradient-to-r from-blue-600 via-indigo-600 to-sky-600 hover:from-blue-700 hover:to-indigo-700 text-white font-extrabold text-xs rounded-xl shadow-lg shadow-blue-500/25 transition-all hover:shadow-xl disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <span className="animate-spin text-sm">🔄</span>
                    <span>Creating Encrypted Account in Database...</span>
                  </>
                ) : (
                  <>
                    <span>Complete {regRole.toUpperCase()} Registration</span>
                    <span>✓</span>
                  </>
                )}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { authenticateUser } from './LoginLogic';

export interface LoginFormProps {
  onLoginSuccess?: (data: { token: string; user: any; redirectUrl: string }) => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({ onLoginSuccess }) => {
  const [collegeId, setCollegeId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const result = await authenticateUser(collegeId, password);
    setLoading(false);

    if (!result.success) {
      setError(result.error || 'Login failed');
      return;
    }

    if (onLoginSuccess) {
      onLoginSuccess(result as any);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-xl shadow-lg border border-gray-100">
      <h2 className="text-2xl font-bold text-gray-900 mb-2">College Portal Login</h2>
      <p className="text-sm text-gray-500 mb-6">Enter institutional credentials to manage complaints.</p>

      {error && (
        <div data-testid="login-error-alert" className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">College ID / Roll No</label>
          <input
            data-testid="college-id-input"
            type="text"
            placeholder="e.g. STU101 or ADM001"
            value={collegeId}
            onChange={e => setCollegeId(e.target.value)}
            className="mt-1 block w-full p-2 border rounded shadow-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Password</label>
          <input
            data-testid="password-input"
            type="password"
            placeholder="Institutional password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            className="mt-1 block w-full p-2 border rounded shadow-sm"
          />
        </div>
        <button
          data-testid="login-submit-btn"
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 rounded"
        >
          {loading ? 'Authenticating...' : 'Sign In'}
        </button>
      </form>
    </div>
  );
};

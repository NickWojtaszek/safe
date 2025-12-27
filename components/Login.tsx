import React, { useState } from 'react';
import { Lock, Mail, AlertCircle, Loader } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const Login: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await login(username, password);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo/Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-cyan-900/30 rounded-lg border border-cyan-800/50 mb-4">
            <Lock className="w-8 h-8 text-cyan-400" />
          </div>
          <h1 className="text-3xl font-bold text-slate-100 tracking-tight">SAFE-ARCH</h1>
          <p className="text-cyan-400 text-sm mt-2 font-mono">Clinical Research Workstation</p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="bg-slate-900 rounded-lg border border-slate-800 shadow-2xl p-8 space-y-6">
          {/* Error Alert */}
          {error && (
            <div className="bg-red-950/30 border border-red-500/30 rounded-lg p-4 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-red-300 text-sm font-medium">Authentication Failed</p>
                <p className="text-red-400 text-xs mt-1">{error}</p>
              </div>
            </div>
          )}

          {/* Username Field */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="admin"
              disabled={loading}
              className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/20 disabled:opacity-50 transition-colors"
            />
            <p className="text-xs text-slate-500 mt-1">Demo: <code className="text-slate-400 font-mono">admin</code> or <code className="text-slate-400 font-mono">user1</code> or <code className="text-slate-400 font-mono">user2</code></p>
          </div>

          {/* Password Field */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              disabled={loading}
              className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/20 disabled:opacity-50 transition-colors"
            />
            <p className="text-xs text-slate-500 mt-1">
              Admin: <code className="text-slate-400 font-mono">SafeArch2024!</code> | 
              Users: <code className="text-slate-400 font-mono">User123456!</code>
            </p>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading || !username || !password}
            className="w-full bg-cyan-600 hover:bg-cyan-500 disabled:bg-slate-700 disabled:cursor-not-allowed text-white font-semibold py-2.5 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            {loading && <Loader className="w-4 h-4 animate-spin" />}
            {loading ? 'Signing in...' : 'Sign In'}
          </button>

          {/* Footer Info */}
          <div className="pt-4 border-t border-slate-800">
            <p className="text-xs text-slate-400 text-center">
              SAFE-ARCH Protocol v1.1.9 • Production Ready
            </p>
            <p className="text-xs text-amber-600/70 text-center mt-2 font-mono">
              LOCAL DEVELOPMENT MODE
            </p>
          </div>
        </form>

        {/* Info Cards */}
        <div className="mt-8 grid grid-cols-2 gap-4">
          <div className="bg-slate-900/50 border border-slate-800 rounded-lg p-4">
            <Mail className="w-5 h-5 text-cyan-400 mb-2" />
            <p className="text-slate-400 text-xs">Admin Access</p>
            <p className="text-slate-500 text-[10px] mt-1">Full system control & AI analysis</p>
          </div>
          <div className="bg-slate-900/50 border border-slate-800 rounded-lg p-4">
            <Lock className="w-5 h-5 text-slate-400 mb-2" />
            <p className="text-slate-400 text-xs">Role-Based Access</p>
            <p className="text-slate-500 text-[10px] mt-1">Secure multi-user capability</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;

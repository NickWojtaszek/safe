import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Shield, Clock, User, LogOut } from 'lucide-react';

const AdminPanel: React.FC = () => {
  const { user, logout, loginHistory } = useAuth();

  if (!user || user.role !== 'admin') {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="bg-amber-950/30 border border-amber-500/30 rounded-lg p-6 text-center">
          <Shield className="w-8 h-8 text-amber-500 mx-auto mb-3" />
          <p className="text-amber-300">Admin Access Required</p>
          <p className="text-amber-400 text-sm mt-2">This panel is only available to administrators.</p>
        </div>
      </div>
    );
  }

  const formatTime = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleString('en-US', { 
      year: 'numeric',
      month: 'short',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    });
  };

  const getTimeAgo = (isoString: string) => {
    const date = new Date(isoString);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (seconds < 60) return 'just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="bg-slate-950 p-8 rounded border border-slate-800 shadow-inner">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-slate-400 font-bold uppercase tracking-widest text-[11px] flex items-center">
              <Shield className="w-5 h-5 mr-2 text-cyan-400" /> 
              Admin Control Panel
            </h3>
            <p className="text-slate-500 text-[10px] mt-1">System administration and access monitoring</p>
          </div>
          <button
            onClick={logout}
            className="flex items-center gap-2 px-4 py-2 bg-red-950/30 hover:bg-red-950/50 border border-red-500/30 rounded-lg text-red-400 text-sm font-medium transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>

        {/* Current User Info */}
        <div className="mb-8 p-4 bg-cyan-950/20 border border-cyan-500/30 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-[9px] uppercase tracking-widest font-bold mb-1">Logged In As</p>
              <p className="text-cyan-400 font-semibold text-lg">{user.username}</p>
              <p className="text-slate-400 text-[10px] mt-1">Role: <span className="text-cyan-300">Administrator</span></p>
            </div>
            <div className="text-right">
              <div className="w-3 h-3 bg-green-500 rounded-full mx-auto mb-2 animate-pulse"></div>
              <p className="text-green-400 text-[10px] font-mono">ACTIVE</p>
            </div>
          </div>
        </div>

        {/* Login History */}
        <div>
          <h4 className="text-slate-300 font-bold uppercase text-[9px] tracking-widest mb-4">Login History</h4>
          
          {loginHistory.length === 0 ? (
            <div className="bg-slate-900/50 border border-slate-700 rounded-lg p-6 text-center">
              <Clock className="w-8 h-8 text-slate-600 mx-auto mb-2" />
              <p className="text-slate-500 text-sm">No login history recorded</p>
            </div>
          ) : (
            <div className="space-y-2">
              {loginHistory.map((record, idx) => (
                <div 
                  key={record.sessionId}
                  className={`p-4 rounded-lg border transition-colors ${
                    idx === 0 
                      ? 'bg-green-950/20 border-green-500/30' 
                      : 'bg-slate-900/50 border-slate-700 hover:border-slate-600'
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <User className="w-4 h-4 text-slate-400" />
                        <p className="text-slate-300 font-medium">{record.username}</p>
                        {idx === 0 && (
                          <span className="text-[8px] uppercase font-bold bg-green-500/20 text-green-400 px-2 py-1 rounded">
                            Current Session
                          </span>
                        )}
                      </div>
                      <p className="text-slate-500 text-[10px] font-mono">{record.sessionId}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-slate-400 text-[9px]">{getTimeAgo(record.timestamp)}</p>
                      <p className="text-slate-600 text-[9px] mt-1">{formatTime(record.timestamp)}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Access Control Info */}
        <div className="mt-8 pt-6 border-t border-slate-700">
          <h4 className="text-slate-300 font-bold uppercase text-[9px] tracking-widest mb-4">Access Control Summary</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-slate-900 p-4 rounded border border-slate-700">
              <p className="text-slate-400 text-[9px] uppercase tracking-widest font-bold mb-2">Admin Privileges</p>
              <ul className="space-y-1 text-slate-500 text-[10px]">
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                  Full data access
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                  AI analysis enabled
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                  User management
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                  Audit logs access
                </li>
              </ul>
            </div>
            <div className="bg-slate-900 p-4 rounded border border-slate-700">
              <p className="text-slate-400 text-[9px] uppercase tracking-widest font-bold mb-2">User Privileges</p>
              <ul className="space-y-1 text-slate-500 text-[10px]">
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-amber-500 rounded-full"></span>
                  Data entry
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-amber-500 rounded-full"></span>
                  View statistics
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-red-500 rounded-full"></span>
                  AI analysis disabled
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-red-500 rounded-full"></span>
                  No audit logs access
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Security Notice */}
        <div className="mt-6 p-4 bg-yellow-950/30 border border-yellow-500/30 rounded-lg">
          <p className="text-yellow-600 text-[9px] font-mono">
            ⚠ SECURITY NOTICE: Monitor login history to detect unauthorized access attempts. Each login creates a unique session ID for audit tracking.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;

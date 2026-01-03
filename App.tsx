
import React, { useState, useEffect } from 'react';
import { Layers, Database, Activity, Monitor, LogOut, Trash2 } from 'lucide-react';
import Wizard from './components/Wizard';
import DataDisplay from './components/DataDisplay';
import Analysis from './components/Analysis';
import Login from './components/Login';
import AdminPanel from './components/AdminPanel';
import { CollectionRecord } from './types';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { supabaseService } from './services/supabaseService';

enum Tab {
  COLLECT = 'collect',
  DATA = 'data',
  ANALYSIS = 'analysis',
  ADMIN = 'admin'
}

const AppContent: React.FC = () => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>(Tab.COLLECT);
  const [records, setRecords] = useState<CollectionRecord[]>([]);
  const [selectedParameters, setSelectedParameters] = useState<string[]>([]);
  const [notification, setNotification] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Load records from Supabase on mount and when user changes
  useEffect(() => {
    const loadRecords = async () => {
      if (!user) {
        setRecords([]);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        // Get user's study or create default one
        const studies = await supabaseService.getUserStudies();
        
        if (studies.length === 0) {
          // Create a default study for this user
          const newStudy = await supabaseService.createStudy('Default Study', []);
          setRecords([]);
        } else {
          // Load records from the first study
          const study = studies[0];
          setRecords(study.records_data || []);
        }
      } catch (error) {
        console.error('Error loading records:', error);
        showNotification('Error loading data from database');
      } finally {
        setLoading(false);
      }
    };

    loadRecords();
  }, [user]);

  // Save records to Supabase whenever they change
  const saveRecordsToDatabase = async (newRecords: CollectionRecord[]) => {
    if (!user) return;

    try {
      const studies = await supabaseService.getUserStudies();
      if (studies.length > 0) {
        await supabaseService.updateStudy(studies[0].id, newRecords);
      }
    } catch (error) {
      console.error('Error saving records:', error);
      showNotification('Warning: Data not saved to database');
    }
  };

  const handleRecordComplete = (record: CollectionRecord) => {
    const newRecords = [...records, record];
    setRecords(newRecords);
    saveRecordsToDatabase(newRecords);
    showNotification("Rekord v1.1.9 zapisany pomyślnie");
  };

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  const handleToggleParameter = (paramId: string) => {
    setSelectedParameters(prev => 
      prev.includes(paramId) 
        ? prev.filter(p => p !== paramId)
        : [...prev, paramId]
    );
  };

  const clearAllRecords = () => {
    if (window.confirm('Are you sure you want to delete ALL records? This cannot be undone.')) {
      const emptyRecords: CollectionRecord[] = [];
      setRecords(emptyRecords);
      saveRecordsToDatabase(emptyRecords);
      showNotification('All records deleted successfully');
      setActiveTab(Tab.COLLECT);
    }
  };

  const handleImportRecords = (newRecords: CollectionRecord[]) => {
    const currentIds = new Set(records.map(r => r.id));
    const uniqueNewRecords = newRecords.filter(r => !currentIds.has(r.id));
    
    if (uniqueNewRecords.length === 0) {
      showNotification("Brak nowych unikalnych rekordów.");
      return;
    }

    const allRecords = [...records, ...uniqueNewRecords];
    setRecords(allRecords);
    saveRecordsToDatabase(allRecords);
    showNotification(`Zaimportowano ${uniqueNewRecords.length} rekordów (v1.1.9).`);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col font-sans text-slate-100">
      <header className="bg-slate-900 border-b border-slate-800 sticky top-0 z-20 shadow-md">
        <div className="w-full px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center">
              <div className="bg-cyan-900/30 p-2 rounded border border-cyan-800/50 mr-4">
                <Monitor className="h-6 w-6 text-cyan-400" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-100 tracking-tight">SAFE-ARCH <span className="text-cyan-500 font-light">Workstation</span></h1>
                <p className="text-[10px] text-cyan-500 font-mono tracking-widest uppercase font-black">Protocol v1.1.9-STABLE • LIVE_DEPLOY</p>
              </div>
            </div>
            
            <div className="flex space-x-4 items-center">
              {/* User Info */}
              <div className="hidden sm:block text-right">
                <p className="text-xs font-medium text-slate-300">{user?.username}</p>
                <p className="text-[9px] text-slate-500 uppercase font-bold tracking-widest">
                  {user?.role === 'admin' ? '👑 Admin' : '👤 User'}
                </p>
              </div>

              {/* Logout Button */}
              <button
                onClick={logout}
                className="flex items-center px-3 py-2 text-xs font-bold text-red-400 bg-red-950/30 border border-red-900/50 rounded hover:bg-red-950/50 transition-colors"
              >
                <LogOut className="w-3 h-3 mr-1.5" /> Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="bg-slate-900/50 border-b border-slate-800 backdrop-blur-sm">
         <div className="w-full px-6 lg:px-8">
           <nav className="-mb-px flex space-x-1">
             <button
               onClick={() => setActiveTab(Tab.COLLECT)}
               className={`${
                 activeTab === Tab.COLLECT
                   ? 'border-cyan-500 text-cyan-400 bg-slate-800/50'
                   : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/30'
               } whitespace-nowrap py-4 px-6 border-b-2 font-medium text-xs flex items-center transition-all uppercase tracking-widest`}
             >
               <Layers className="w-4 h-4 mr-2" />
               1. Gromadzenie (v1.1.9)
             </button>

             <button
               onClick={() => setActiveTab(Tab.DATA)}
               className={`${
                 activeTab === Tab.DATA
                   ? 'border-cyan-500 text-cyan-400 bg-slate-800/50'
                   : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/30'
               } whitespace-nowrap py-4 px-6 border-b-2 font-medium text-xs flex items-center transition-all uppercase tracking-widest`}
             >
               <Database className="w-4 h-4 mr-2" />
               2. Rejestr (v1.1.9)
               <span className="ml-2 bg-slate-700 text-slate-200 py-0.5 px-2 rounded text-[10px] font-mono">
                 {records.length}
               </span>
             </button>

             <button
               onClick={() => setActiveTab(Tab.ANALYSIS)}
               className={`${
                 activeTab === Tab.ANALYSIS
                   ? 'border-cyan-500 text-cyan-400 bg-slate-800/50'
                   : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/30'
               } whitespace-nowrap py-4 px-6 border-b-2 font-medium text-xs flex items-center transition-all uppercase tracking-widest`}
             >
               <Activity className="w-4 h-4 mr-2" />
               3. Analityka (v1.1.9)
             </button>

             {user?.role === 'admin' && (
               <button
                 onClick={() => setActiveTab(Tab.ADMIN)}
                 className={`${
                   activeTab === Tab.ADMIN
                     ? 'border-amber-500 text-amber-400 bg-slate-800/50'
                     : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/30'
                 } whitespace-nowrap py-4 px-6 border-b-2 font-medium text-xs flex items-center transition-all uppercase tracking-widest`}
               >
                 <Database className="w-4 h-4 mr-2" />
                 👑 Admin Panel
               </button>
             )}
           </nav>
           
           {/* Clear Data Button - for testing */}
           {records.length > 0 && (
             <div className="absolute right-6 top-4">
               <button 
                 onClick={clearAllRecords}
                 className="flex items-center px-4 py-2 text-xs font-bold text-red-400 bg-red-950/50 border border-red-900/50 rounded hover:bg-red-900/50 transition-colors uppercase tracking-wider"
               >
                 <Trash2 className="w-3 h-3 mr-2" /> Clear All Data
               </button>
             </div>
           )}
         </div>
      </div>

      <main className="flex-1 w-full px-6 py-6 overflow-x-hidden">
        <div className="animate-fade-in w-full max-w-[98%] mx-auto">
          {activeTab === Tab.COLLECT && (
            <div className="space-y-6">
              <Wizard onComplete={handleRecordComplete} />
            </div>
          )}

          {activeTab === Tab.DATA && (
            <DataDisplay 
              records={records} 
              selectedParameters={selectedParameters}
              onToggleParameter={handleToggleParameter}
              onImport={handleImportRecords}
            />
          )}

          {activeTab === Tab.ANALYSIS && (
            <Analysis 
              records={records} 
              selectedParameters={selectedParameters} 
            />
          )}

          {activeTab === Tab.ADMIN && user?.role === 'admin' && (
            <AdminPanel />
          )}
        </div>
      </main>

      <footer className="bg-slate-900 border-t border-slate-800 px-8 py-3 flex justify-between items-center text-[10px] text-slate-500 font-mono">
         <div>SAFE-ARCH WORKSTATION • ENGINE v1.1.9 • NO_CACHE_READY</div>
         <div className="flex gap-4">
            <span>MODALITY: CT/ECHO/HEMO/NIRS</span>
            <span className="text-cyan-600 font-bold">ALL_SERVICES_SYNC_v1.1.9</span>
         </div>
      </footer>

      {notification && (
        <div className="fixed bottom-12 right-6 bg-slate-900 border border-cyan-500/50 text-cyan-100 px-6 py-4 rounded shadow-[0_0_20px_rgba(6,182,212,0.4)] flex items-center animate-bounce-in z-50">
          <div className="h-2 w-2 bg-cyan-400 rounded-full mr-3 animate-pulse"></div>
          <span className="font-mono text-xs font-bold uppercase tracking-wider">{notification}</span>
        </div>
      )}
    </div>
  );
};

const App: React.FC = () => {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Login />;
  }

  return <AppContent />;
};

export default App;

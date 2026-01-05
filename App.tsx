
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
  const [selectedRecord, setSelectedRecord] = useState<CollectionRecord | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [currentStudyId, setCurrentStudyId] = useState<string | null>(null);
  const [currentPatientName, setCurrentPatientName] = useState<string>('Nowy rekord');

  // Load records from Supabase on mount and when user changes
  useEffect(() => {
    const loadRecords = async () => {
      if (!user) {
        setRecords([]);
        setCurrentStudyId(null);
        return;
      }

      try {
        console.log('🔄 Loading records for user:', user.email);
        // Get user's study or create default one
        const studies = await supabaseService.getUserStudies();
        console.log('📚 Studies found:', studies.length);

        if (studies.length === 0) {
          // Create a default study for this user
          console.log('➕ Creating new study for user');
          const newStudy = await supabaseService.createStudy('Default Study', []);
          setCurrentStudyId(newStudy.id);
          setRecords([]);
          console.log('✅ New study created:', newStudy.id);
        } else {
          // Load records from the first study
          const study = studies[0];
          setCurrentStudyId(study.id);
          setRecords(study.records_data || []);
          console.log('✅ Loaded', study.records_data?.length || 0, 'records from study:', study.id);
        }
      } catch (error) {
        console.error('❌ Error loading records:', error);
        showNotification('Error loading data from database');
      }
    };

    loadRecords();
  }, [user]);

  // Save records to Supabase whenever they change
  const saveRecordsToDatabase = async (newRecords: CollectionRecord[]): Promise<boolean> => {
    if (!user) {
      console.warn('⚠️ Cannot save: No user logged in');
      return false;
    }

    if (!currentStudyId) {
      console.warn('⚠️ Cannot save: No study ID available');
      showNotification('Error: Study not initialized');
      return false;
    }

    setIsSaving(true);
    try {
      console.log('💾 Saving', newRecords.length, 'records to study:', currentStudyId);
      await supabaseService.updateStudy(currentStudyId, newRecords);
      console.log('✅ Successfully saved to database');
      return true;
    } catch (error: any) {
      console.error('❌ Error saving records:', error);
      const errorMessage = error?.message || 'Unknown error';
      showNotification(`Error saving data: ${errorMessage}`);
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  const handleRecordComplete = async (record: CollectionRecord) => {
    let newRecords: CollectionRecord[];

    if (selectedRecord) {
      // Update existing record
      newRecords = records.map(r => r.id === record.id ? record : r);
      showNotification("📝 Rekord zaktualizowany");
    } else {
      // Create new record
      newRecords = [...records, record];
      showNotification("➕ Nowy rekord dodany");
    }

    setRecords(newRecords);

    const success = await saveRecordsToDatabase(newRecords);
    if (success) {
      showNotification("✅ Zapisano do bazy danych");
      setSelectedRecord(null);  // Clear selection
      setActiveTab(Tab.DATA);  // Return to table view
    } else {
      showNotification("❌ Błąd: Rekord nie został zapisany");
    }
  };

  const handleSaveProgress = async (partialData: Record<string, any>): Promise<boolean> => {
    if (!currentStudyId) {
      showNotification('⚠️ Nie można zapisać - brak aktywnego studium');
      return false;
    }

    setIsSaving(true);

    // If editing existing record, update it; otherwise create new draft record
    let updatedRecords: CollectionRecord[];

    if (selectedRecord) {
      // Update existing record
      updatedRecords = records.map(r =>
        r.id === selectedRecord.id
          ? { ...r, data: partialData, timestamp: new Date().toISOString() }
          : r
      );
    } else {
      // Create new draft record with temporary ID
      const draftRecord: CollectionRecord = {
        id: crypto.randomUUID(),
        timestamp: new Date().toISOString(),
        data: partialData,
        version: '1.1.5'
      };
      updatedRecords = [...records, draftRecord];
      setSelectedRecord(draftRecord); // Set as selected so subsequent saves update it
    }

    setRecords(updatedRecords);

    const success = await saveRecordsToDatabase(updatedRecords);
    setIsSaving(false);

    if (success) {
      showNotification('✅ Postęp zapisany');
    } else {
      showNotification('❌ Błąd podczas zapisywania postępu');
    }

    return success;
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

  const clearAllRecords = async () => {
    if (window.confirm('Are you sure you want to delete ALL records? This cannot be undone.')) {
      const emptyRecords: CollectionRecord[] = [];
      setRecords(emptyRecords);

      const success = await saveRecordsToDatabase(emptyRecords);
      if (success) {
        showNotification('✅ All records deleted from database');
      } else {
        showNotification('❌ Error deleting records');
      }
      setActiveTab(Tab.COLLECT);
    }
  };

  const handleSelectRecord = (record: CollectionRecord) => {
    setSelectedRecord(record);
    setActiveTab(Tab.COLLECT);
  };

  const handleDeleteRecord = async (recordId: string) => {
    const newRecords = records.filter(r => r.id !== recordId);
    setRecords(newRecords);

    const success = await saveRecordsToDatabase(newRecords);
    if (success) {
      showNotification('🗑️ Rekord usunięty z bazy danych');
    } else {
      showNotification('❌ Błąd podczas usuwania rekordu');
    }
  };

  const handlePatientNameChange = (firstName: string, lastName: string) => {
    const fullName = `${firstName || ''} ${lastName || ''}`.trim();
    setCurrentPatientName(fullName || 'Nowy rekord');
  };

  // Update patient name when selectedRecord changes
  useEffect(() => {
    if (selectedRecord?.data) {
      const firstName = selectedRecord.data.patient_first_name || '';
      const lastName = selectedRecord.data.patient_last_name || '';
      const fullName = `${firstName} ${lastName}`.trim();
      setCurrentPatientName(fullName || 'Nowy rekord');
    } else {
      setCurrentPatientName('Nowy rekord');
    }
  }, [selectedRecord]);

  const handleImportRecords = async (newRecords: CollectionRecord[]) => {
    const currentIds = new Set(records.map(r => r.id));
    const uniqueNewRecords = newRecords.filter(r => !currentIds.has(r.id));

    if (uniqueNewRecords.length === 0) {
      showNotification("Brak nowych unikalnych rekordów.");
      return;
    }

    const allRecords = [...records, ...uniqueNewRecords];
    setRecords(allRecords);

    const success = await saveRecordsToDatabase(allRecords);
    if (success) {
      showNotification(`✅ Zaimportowano ${uniqueNewRecords.length} rekordów do bazy`);
    } else {
      showNotification(`❌ Błąd importu: dane nie zapisane`);
    }
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
                {activeTab === Tab.COLLECT && (
                  <p className="text-[11px] text-amber-400 font-mono mt-0.5">
                    <span className="font-bold">Pacjent:</span> {currentPatientName}
                  </p>
                )}
              </div>
            </div>
            
            <div className="flex space-x-4 items-center">
              {/* User Info */}
              <div className="hidden sm:block text-right">
                <p className="text-xs font-medium text-slate-300">{user?.email}</p>
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
              <Wizard
                onComplete={handleRecordComplete}
                initialRecord={selectedRecord}
                onPatientNameChange={handlePatientNameChange}
                onSaveProgress={handleSaveProgress}
                isSaving={isSaving}
              />
            </div>
          )}

          {activeTab === Tab.DATA && (
            <DataDisplay
              records={records}
              selectedParameters={selectedParameters}
              onToggleParameter={handleToggleParameter}
              onImport={handleImportRecords}
              onSelectRecord={handleSelectRecord}
              onDeleteRecord={handleDeleteRecord}
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

      {isSaving && (
        <div className="fixed top-20 right-6 bg-amber-950/90 border border-amber-500/50 text-amber-100 px-4 py-2 rounded shadow-lg flex items-center z-50">
          <div className="animate-spin h-3 w-3 border-2 border-amber-400 border-t-transparent rounded-full mr-2"></div>
          <span className="font-mono text-xs font-bold">SAVING...</span>
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

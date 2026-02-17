import React, { useState, useEffect } from 'react';
import { PatientData, initialPatientData } from './types';
import { PatientForm } from './components/PatientForm';
import { PatientList } from './components/PatientList';
import { PatientSummary } from './components/PatientSummary';
import { ClipboardList, Users, Plus, ShieldAlert, Copy, Check, ExternalLink, CloudCheck, RefreshCw } from 'lucide-react';
import { db } from './firebase';
import { 
  collection, 
  onSnapshot, 
  doc, 
  setDoc, 
  deleteDoc,
  query, 
  orderBy 
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

type ViewState = 'list' | 'form' | 'summary';

const App: React.FC = () => {
  const [view, setView] = useState<ViewState>('list');
  const [patients, setPatients] = useState<PatientData[]>([]);
  const [activePatient, setActivePatient] = useState<PatientData>(initialPatientData);
  const [loading, setLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncError, setSyncError] = useState<string | null>(null);
  const [copiedRules, setCopiedRules] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);

  const firestoreRules = `rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true;
    }
  }
}`;

  useEffect(() => {
    const q = query(collection(db, "patients"), orderBy("lastUpdated", "desc"));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const patientList: PatientData[] = [];
      snapshot.forEach((doc) => {
        patientList.push(doc.data() as PatientData);
      });
      setPatients(patientList);
      setLoading(false);
      setSyncError(null); 
      setLastSyncTime(new Date());
    }, (error: any) => {
      console.error("Firestore sync error:", error);
      setLoading(false);
      const isPermissionError = 
        error.code === 'permission-denied' || 
        error.message?.toLowerCase().includes('permission') ||
        error.message?.toLowerCase().includes('insufficient');

      if (isPermissionError) {
        setSyncError('permission-denied');
      } else {
        setSyncError(error.message || 'Unknown sync error');
      }
    });

    return () => unsubscribe();
  }, []);

  const handleAddNew = () => {
    setActivePatient({ ...initialPatientData, id: `PAT-${Date.now()}` });
    setView('form');
  };

  const handleSave = async (data: PatientData) => {
    setIsSyncing(true);
    try {
      const patientRef = doc(db, "patients", data.id);
      const payload = { 
        ...data, 
        lastUpdated: Date.now() 
      };
      await setDoc(patientRef, payload, { merge: true });
      
      setActivePatient(payload);
      setView('summary');
    } catch (e: any) {
      alert("Cloud Sync Failed: " + e.message);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleUpdate = async (updatedData: PatientData) => {
    setIsSyncing(true);
    try {
      const patientRef = doc(db, "patients", updatedData.id);
      const payload = { 
        ...updatedData, 
        lastUpdated: Date.now() 
      };
      await setDoc(patientRef, payload, { merge: true });
      setActivePatient(payload);
    } catch (e: any) {
      alert("Cloud Update Failed: " + e.message);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleDelete = async (id: string) => {
    setIsSyncing(true);
    try {
      await deleteDoc(doc(db, "patients", id));
      if (activePatient.id === id) {
        setView('list');
        setActivePatient(initialPatientData);
      }
    } catch (e: any) {
      alert("Delete Failed: " + e.message);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleSelectPatient = (patient: PatientData) => {
    setActivePatient(patient);
    setView('summary');
  };

  const copyRules = () => {
    navigator.clipboard.writeText(firestoreRules);
    setCopiedRules(true);
    setTimeout(() => setCopiedRules(false), 2000);
  };

  if (syncError === 'permission-denied') {
    return (
      <div className="min-h-screen bg-zinc-50 flex items-center justify-center p-6">
        <div className="max-w-2xl w-full bg-white rounded-[3.5rem] shadow-2xl overflow-hidden border border-zinc-100 p-12 md:p-20">
          <div className="w-24 h-24 bg-rose-50 rounded-[2rem] flex items-center justify-center mb-12 text-rose-500 shadow-inner">
            <ShieldAlert size={48} />
          </div>
          <h1 className="text-4xl font-black text-zinc-900 tracking-tighter mb-6">Database Rules Needed</h1>
          <p className="text-zinc-500 font-medium text-lg mb-12 leading-relaxed">
            Your current Firestore setup is blocking access. To fix the <strong>"Missing or insufficient permissions"</strong> error, follow these steps in your Firebase console:
          </p>
          
          <div className="space-y-12">
            <div className="flex gap-8">
              <div className="flex-shrink-0 w-12 h-12 bg-black text-white rounded-2xl flex items-center justify-center font-black text-lg shadow-xl shadow-zinc-200">1</div>
              <div className="flex-grow">
                <p className="font-bold text-zinc-900 mb-2">Open Firestore Rules Tab</p>
                <a 
                  href="https://console.firebase.google.com/project/_/firestore/rules" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-zinc-400 hover:text-black transition-all flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em]"
                >
                  Click to open Firebase console <ExternalLink size={12}/>
                </a>
              </div>
            </div>

            <div className="flex gap-8">
              <div className="flex-shrink-0 w-12 h-12 bg-black text-white rounded-2xl flex items-center justify-center font-black text-lg shadow-xl shadow-zinc-200">2</div>
              <div className="flex-grow">
                <p className="font-bold text-zinc-900 mb-4">Paste this code to allow access:</p>
                <div className="relative">
                  <pre className="bg-zinc-50 p-8 rounded-[2rem] text-[13px] font-mono text-zinc-600 overflow-x-auto border border-zinc-100 leading-relaxed shadow-inner">
                    {firestoreRules}
                  </pre>
                  <button 
                    onClick={copyRules}
                    className="absolute top-4 right-4 p-3 bg-white border border-zinc-100 rounded-xl text-zinc-400 hover:text-black transition-all shadow-md active:scale-90"
                  >
                    {copiedRules ? <Check size={18} className="text-emerald-500" /> : <Copy size={18} />}
                  </button>
                </div>
              </div>
            </div>

            <div className="flex gap-8">
              <div className="flex-shrink-0 w-12 h-12 bg-black text-white rounded-2xl flex items-center justify-center font-black text-lg shadow-xl shadow-zinc-200">3</div>
              <div>
                <p className="font-bold text-zinc-900 mb-2">Publish the changes</p>
                <p className="text-sm text-zinc-400 font-medium leading-relaxed italic">Wait roughly 10-30 seconds for the new rules to take effect, then reload this app.</p>
              </div>
            </div>

            <button 
              onClick={() => window.location.reload()}
              className="w-full bg-black text-white py-6 rounded-[2.5rem] font-black text-xs uppercase tracking-[0.3em] shadow-[0_20px_50px_rgba(0,0,0,0.15)] hover:scale-[1.02] active:scale-[0.98] transition-all"
            >
              I have published the rules — Refresh
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#FCFCFC]">
      <header className="glass border-b border-zinc-100 sticky top-0 z-40 bg-white/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div 
            className="flex items-center gap-3 cursor-pointer group" 
            onClick={() => setView('list')}
          >
            <div className="bg-black text-white p-2.5 rounded-xl shadow-lg group-hover:scale-105 transition-transform">
              <ClipboardList size={22} />
            </div>
            <div>
              <h1 className="font-extrabold text-xl tracking-tight text-zinc-900 leading-none uppercase">PHN Patient Profiler</h1>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-zinc-400 block">Class Section N4D</span>
                {lastSyncTime && (
                  <>
                    <span className="text-zinc-200 text-[10px]">•</span>
                    <span className="flex items-center gap-1 text-[9px] font-bold text-emerald-500 uppercase tracking-widest">
                      <CloudCheck size={10} /> Online
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            {isSyncing && (
              <div className="flex items-center gap-2 px-3 py-1.5 bg-zinc-900 text-white rounded-full animate-pulse">
                <RefreshCw size={12} className="animate-spin" />
                <span className="text-[9px] font-black uppercase tracking-widest">Syncing...</span>
              </div>
            )}
            <div className="hidden md:flex items-center gap-2 bg-zinc-50 px-3 py-1.5 rounded-full border border-zinc-100">
              <Users size={14} className="text-zinc-400" />
              <span className="text-xs font-bold text-zinc-600">
                {loading ? "..." : patients.length} Records
              </span>
            </div>
            {view === 'list' && (
              <button 
                onClick={handleAddNew}
                className="bg-black text-white text-xs font-black uppercase tracking-widest px-6 py-2.5 rounded-full hover:bg-zinc-800 transition-all transform hover:-translate-y-0.5 shadow-md active:scale-95"
              >
                <Plus size={14} className="inline mr-1" /> New Record
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="flex-grow p-6 md:p-10 max-w-7xl mx-auto w-full">
        <div className="animate-fadeIn">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-40">
              <div className="w-10 h-10 border-4 border-zinc-200 border-t-black rounded-full animate-spin"></div>
              <p className="mt-4 text-xs font-bold text-zinc-400 uppercase tracking-widest">Connecting to N4D Database...</p>
            </div>
          ) : (
            <>
              {syncError && (
                <div className="mb-10 p-6 bg-rose-50 border border-rose-100 rounded-[2rem] flex items-center gap-5 text-rose-600 text-[10px] font-black uppercase tracking-[0.25em] animate-fadeIn shadow-sm">
                  <ShieldAlert size={20} />
                  <span>Syncing issue detected: {syncError}</span>
                </div>
              )}

              {view === 'list' && (
                <PatientList 
                  patients={patients} 
                  onAddNew={handleAddNew} 
                  onSelectPatient={handleSelectPatient} 
                  onDeletePatient={handleDelete}
                />
              )}

              {view === 'form' && (
                <PatientForm 
                  initialData={activePatient} 
                  onSave={handleSave} 
                  onCancel={() => setView(patients.find(p => p.id === activePatient.id) ? 'summary' : 'list')} 
                />
              )}

              {view === 'summary' && (
                <PatientSummary 
                  data={activePatient} 
                  onBack={() => setView('list')} 
                  onEdit={() => setView('form')} 
                  onUpdate={handleUpdate}
                  isSyncing={isSyncing}
                />
              )}
            </>
          )}
        </div>
      </main>

      <footer className="py-12 border-t border-zinc-100 text-center bg-white mt-auto">
        <p className="text-zinc-300 text-[10px] font-black uppercase tracking-[0.3em]">
          &copy; {new Date().getFullYear()} PHN Patient Profiler • N4D Clinical Rotation • Cloud Storage Active
        </p>
      </footer>
    </div>
  );
};

export default App;
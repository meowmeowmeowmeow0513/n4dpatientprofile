import React, { useState } from 'react';
import { PatientData } from '../types';
import { Search, ChevronRight, UserPlus, Filter, Trash2, ArrowUpDown, AlertCircle } from 'lucide-react';

interface PatientListProps {
  patients: PatientData[];
  onAddNew: () => void;
  onSelectPatient: (patient: PatientData) => void;
  onDeletePatient: (id: string) => void;
}

type SortOption = 'lastUpdated' | 'initials' | 'patientId' | 'oldest';

export const PatientList: React.FC<PatientListProps> = ({ patients, onAddNew, onSelectPatient, onDeletePatient }) => {
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('lastUpdated');
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const filteredAndSorted = patients
    .filter(p => 
      p.patientId.toLowerCase().includes(search.toLowerCase()) || 
      p.initials.toLowerCase().includes(search.toLowerCase()) ||
      p.primaryDiagnosis.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === 'lastUpdated') return b.lastUpdated - a.lastUpdated;
      if (sortBy === 'oldest') return a.lastUpdated - b.lastUpdated;
      if (sortBy === 'initials') return a.initials.localeCompare(b.initials);
      if (sortBy === 'patientId') return a.patientId.localeCompare(b.patientId);
      return 0;
    });

  const handleDeleteClick = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (confirmDeleteId === id) {
      onDeletePatient(id);
      setConfirmDeleteId(null);
    } else {
      setConfirmDeleteId(id);
      // Auto-reset warning after 3 seconds
      setTimeout(() => setConfirmDeleteId(prev => prev === id ? null : prev), 3000);
    }
  };

  return (
    <div className="max-w-6xl mx-auto pb-20">
      <div className="flex flex-col md:flex-row justify-between items-end gap-8 mb-12">
        <div>
          <h2 className="text-5xl font-black text-zinc-900 tracking-tighter">Directory</h2>
          <p className="text-zinc-500 font-medium mt-3">Active database for PHN clinical rotations.</p>
        </div>
        <div className="flex flex-wrap w-full md:w-auto gap-4">
          <div className="relative flex-grow md:w-80">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
            <input 
              type="text" 
              placeholder="Search patients..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-white border border-zinc-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-zinc-100 focus:border-black transition-all text-sm font-semibold shadow-sm"
            />
          </div>
          
          <div className="flex items-center gap-2 bg-white border border-zinc-100 rounded-2xl px-4 py-2 shadow-sm">
            <ArrowUpDown size={16} className="text-zinc-400" />
            <select 
              value={sortBy} 
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="bg-transparent text-xs font-black uppercase tracking-widest text-zinc-600 focus:outline-none cursor-pointer"
            >
              <option value="lastUpdated">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="initials">By Initials</option>
              <option value="patientId">By ID</option>
            </select>
          </div>
        </div>
      </div>

      {patients.length === 0 ? (
        <div className="bg-white border-2 border-dashed border-zinc-100 rounded-[3rem] p-24 text-center">
          <div className="w-20 h-20 bg-zinc-50 rounded-full flex items-center justify-center mx-auto mb-8">
            <UserPlus size={32} className="text-zinc-200" />
          </div>
          <h3 className="text-2xl font-black text-zinc-900 mb-2">No Records Found</h3>
          <p className="text-zinc-400 max-w-sm mx-auto font-medium">Click "New" in the header to start your first patient profile encoding.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredAndSorted.map((patient) => (
            <div 
              key={patient.id} 
              onClick={() => onSelectPatient(patient)}
              className="group bg-white border border-zinc-50 p-6 rounded-[2rem] flex items-center justify-between cursor-pointer hover:shadow-2xl hover:shadow-zinc-200 hover:scale-[1.01] transition-all relative overflow-hidden"
            >
              <div className="flex items-center gap-6">
                <div className="w-14 h-14 bg-zinc-900 text-white rounded-2xl flex items-center justify-center font-black text-lg group-hover:bg-black transition-colors">
                  {patient.initials.slice(0, 1).toUpperCase()}
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">{patient.patientId}</span>
                    <span className="w-1 h-1 bg-zinc-200 rounded-full" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-zinc-900">{patient.category}</span>
                  </div>
                  <h4 className="text-xl font-black text-zinc-900 group-hover:text-black">{patient.initials}</h4>
                  <p className="text-xs font-bold text-zinc-400 mt-0.5 truncate max-w-[200px] md:max-w-xs">{patient.primaryDiagnosis}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-4 md:gap-8 pr-4">
                 <div className="hidden lg:flex flex-col items-end">
                    <span className="text-[9px] font-black uppercase tracking-widest text-zinc-300">Last Encounter</span>
                    <span className="text-xs font-bold text-zinc-900">{new Date(patient.lastUpdated).toLocaleDateString()}</span>
                 </div>
                 
                 <button 
                  onClick={(e) => handleDeleteClick(e, patient.id)}
                  className={`p-3 rounded-xl transition-all flex items-center gap-2 ${confirmDeleteId === patient.id ? 'bg-rose-500 text-white shadow-lg scale-105' : 'bg-zinc-50 text-zinc-300 hover:text-rose-500 hover:bg-rose-50'}`}
                 >
                   {confirmDeleteId === patient.id ? (
                     <><AlertCircle size={16}/><span className="text-[10px] font-black uppercase tracking-widest">Delete?</span></>
                   ) : (
                     <Trash2 size={18} />
                   )}
                 </button>
                 
                 <ChevronRight size={24} className="text-zinc-100 group-hover:text-black transition-colors" />
              </div>
            </div>
          ))}
          
          {filteredAndSorted.length === 0 && (
            <div className="py-20 text-center font-bold text-zinc-300 uppercase tracking-widest text-xs">No matches found for "{search}"</div>
          )}
        </div>
      )}
    </div>
  );
};

import React, { useState } from 'react';
import { PatientData, ProgressNote } from '../types';
import { 
  ArrowLeft, Copy, Check, Activity, FileText, Plus, Clock, Edit3, 
  Trash2, Save, X, Download, Loader2, Heart, Thermometer, Weight, 
  Stethoscope, User, MapPin, ShieldAlert, HeartPulse, Wind, Ruler,
  Target, ClipboardList, Send, Info, ChevronRight, Hash
} from 'lucide-react';
import { jsPDF } from 'https://esm.sh/jspdf';

interface PatientSummaryProps {
  data: PatientData;
  onBack: () => void;
  onEdit: () => void;
  onUpdate: (updatedData: PatientData) => void;
  isSyncing?: boolean;
}

// Fixed StatusBadge type to allow React key prop by using React.FC
const StatusBadge: React.FC<{ label: string; color?: string }> = ({ label, color = 'zinc' }) => {
  const colors: Record<string, string> = {
    rose: 'bg-rose-50 text-rose-600 border-rose-100',
    emerald: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    blue: 'bg-blue-50 text-blue-600 border-blue-100',
    zinc: 'bg-zinc-100/60 text-zinc-600 border-zinc-200'
  };
  return (
    <span className={`px-3 py-1 md:px-4 md:py-1.5 rounded-full text-[8px] md:text-[9px] font-black uppercase tracking-widest border ${colors[color]}`}>
      {label}
    </span>
  );
};

const BaselineCard = ({ title, icon: Icon, children, accent = false }: any) => (
  <div className={`bg-white border ${accent ? 'border-zinc-900 ring-4 ring-zinc-50' : 'border-zinc-100'} rounded-[1.5rem] md:rounded-[2.5rem] p-6 md:p-10 shadow-soft hover:shadow-soft transition-all group overflow-hidden relative`}>
     <div className="flex items-center gap-4 mb-8 pb-5 border-b border-zinc-50 relative z-10">
        <div className={`w-10 h-10 md:w-12 md:h-12 rounded-xl flex items-center justify-center ${accent ? 'bg-zinc-900 text-white' : 'bg-zinc-50 text-zinc-400'} group-hover:scale-110 transition-transform`}>
           <Icon size={20} />
        </div>
        <h3 className={`text-[10px] md:text-[11px] font-black uppercase tracking-[0.3em] ${accent ? 'text-zinc-900' : 'text-zinc-600'}`}>{title}</h3>
     </div>
     <div className="space-y-6 md:space-y-8 relative z-10">{children}</div>
  </div>
);

const DetailItem = ({ label, value, fullWidth = false, highlight = false }: { label: string, value: any, fullWidth?: boolean, highlight?: boolean }) => (
  <div className={`${fullWidth ? 'col-span-full' : ''} space-y-1.5`}>
    <span className="text-[8px] md:text-[9px] font-black uppercase tracking-[0.25em] text-zinc-300 block">{label}</span>
    <span className={`text-sm md:text-base ${highlight ? 'font-black text-black' : 'font-bold text-zinc-900'} leading-relaxed block break-words whitespace-pre-wrap`}>{value || '-'}</span>
  </div>
);

export const PatientSummary: React.FC<PatientSummaryProps> = ({ data, onBack, onEdit, onUpdate, isSyncing }) => {
  const [copied, setCopied] = useState<'text' | 'json' | null>(null);
  const [activeTab, setActiveTab] = useState<'profile' | 'monitoring'>('profile');
  const [showNoteForm, setShowNoteForm] = useState(false);
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [newNote, setNewNote] = useState<Partial<ProgressNote>>({
    bpSystolic: '', bpDiastolic: '', hr: '', rr: '', temp: '', weight: '', notes: ''
  });

  const handleAddOrUpdateNote = () => {
    if (editingNoteId) {
      const updatedNotes = data.progressNotes.map(n => 
        n.id === editingNoteId ? { ...n, ...newNote } as ProgressNote : n
      );
      onUpdate({ ...data, progressNotes: updatedNotes });
      setEditingNoteId(null);
    } else {
      const note: ProgressNote = {
        id: Date.now().toString(),
        date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        timestamp: Date.now(),
        bpSystolic: newNote.bpSystolic || '',
        bpDiastolic: newNote.bpDiastolic || '',
        hr: newNote.hr || '',
        rr: newNote.rr || '',
        temp: newNote.temp || '',
        weight: newNote.weight || '',
        notes: newNote.notes || ''
      };
      onUpdate({ ...data, progressNotes: [note, ...(data.progressNotes || [])] });
    }
    
    setShowNoteForm(false);
    setNewNote({ bpSystolic: '', bpDiastolic: '', hr: '', rr: '', temp: '', weight: '', notes: '' });
  };

  const handleEditNote = (note: ProgressNote) => {
    setEditingNoteId(note.id);
    setNewNote({
      bpSystolic: note.bpSystolic,
      bpDiastolic: note.bpDiastolic,
      hr: note.hr,
      rr: note.rr,
      temp: note.temp,
      weight: note.weight,
      notes: note.notes
    });
    setShowNoteForm(true);
  };

  const handleDeleteNote = (id: string) => {
    if (window.confirm("Permanently delete this monitoring entry?")) {
      const updatedNotes = data.progressNotes.filter(n => n.id !== id);
      onUpdate({ ...data, progressNotes: updatedNotes });
    }
  };

  const generatePDF = () => {
    setIsGeneratingPdf(true);
    try {
      const doc = new jsPDF();
      const margin = 20;
      const pageWidth = doc.internal.pageSize.getWidth();
      let y = 25;

      const drawSectionHeader = (title: string) => {
        if (y > 250) { doc.addPage(); y = 25; }
        doc.setFillColor(245, 248, 251);
        doc.rect(margin, y - 6, pageWidth - (margin * 2), 11, 'F');
        doc.setDrawColor(200);
        doc.line(margin, y + 5, pageWidth - margin, y + 5);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(10);
        doc.setTextColor(30);
        doc.text(title.toUpperCase(), margin + 3, y + 1.5);
        y += 15;
      };

      const addDetail = (label: string, value: string, xPos: number, yPos: number, width: number) => {
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8);
        doc.setTextColor(150);
        doc.text(label.toUpperCase(), xPos, yPos);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        doc.setTextColor(30);
        const splitVal = doc.splitTextToSize(String(value || '-'), width);
        doc.text(splitVal, xPos, yPos + 6);
        return splitVal.length * 6 + 10;
      };

      // Header
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(22);
      doc.setTextColor(15, 23, 42);
      doc.text('PUBLIC HEALTH NURSING RECORD', margin, y);
      y += 8;
      doc.setFontSize(11);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(120);
      doc.text(`N4D ENCODING QUESTIONNAIRE • GENERATED: ${new Date().toLocaleString()}`, margin, y);
      y += 15;

      // 1. Identification
      drawSectionHeader('Section 1: Patient Identification');
      addDetail('Initials', data.initials, margin, y, 40);
      addDetail('Age / Gender', `${data.age} / ${data.gender}`, margin + 50, y, 50);
      addDetail('Patient ID', data.patientId, margin + 110, y, 50);
      y += 18;
      addDetail('Address', data.address, margin, y, pageWidth - (margin * 2 + 10));
      y += 22;

      // 2. Clinical Data
      drawSectionHeader('Section 2: Initial Clinical Assessment');
      addDetail('Primary Health Problem', data.primaryDiagnosis, margin, y, pageWidth - (margin * 2 + 10));
      y += 20;

      // Vitals Grid in PDF
      doc.setFillColor(250, 250, 250);
      doc.rect(margin, y, pageWidth - (margin * 2), 16, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.text(`BP: ${data.bpSystolic}/${data.bpDiastolic}`, margin + 5, y + 10);
      doc.text(`HR: ${data.hr} bpm`, margin + 40, y + 10);
      doc.text(`RR: ${data.rr} cpm`, margin + 75, y + 10);
      doc.text(`TEMP: ${data.temp} C`, margin + 110, y + 10);
      doc.text(`WT: ${data.weight} kg`, margin + 145, y + 10);
      y += 28;

      // 3. Care Plan
      drawSectionHeader('Section 3: Nursing Care Plan');
      const pLen = addDetail('Identified Nursing Problems', data.otherProblems, margin, y, pageWidth - (margin * 2 + 10));
      y += pLen;
      const gLen = addDetail('Short-Term Goals', data.shortTermGoals, margin, y, pageWidth - (margin * 2 + 10));
      y += gLen;
      const iLen = addDetail('Planned Interventions', data.nursingInterventions, margin, y, pageWidth - (margin * 2 + 10));
      y += iLen + 10;

      // 4. Referrals
      if (data.referredTo.length > 0) {
        drawSectionHeader('Section 4: Clinical Referral Tracker');
        addDetail('Referred To', data.referredTo.join(', '), margin, y, pageWidth - (margin * 2 + 10));
        y += 18;
        addDetail('Urgency', data.referralUrgency, margin, y, 40);
        addDetail('Reason / Outcome', data.referralReason, margin + 50, y, pageWidth - (margin * 2 + 60));
        y += 25;
      }

      // Monitoring
      if (data.progressNotes.length > 0) {
        doc.addPage();
        y = 25;
        drawSectionHeader('Clinical Progress Journal (SOAP Notes)');
        data.progressNotes.forEach(note => {
          if (y > 240) { doc.addPage(); y = 25; }
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(11);
          doc.text(`Journal Entry: ${note.date}`, margin, y);
          y += 6;
          doc.setFont('helvetica', 'italic');
          doc.setFontSize(9);
          doc.text(`Vitals: BP ${note.bpSystolic}/${note.bpDiastolic} | HR ${note.hr} | TEMP ${note.temp}C | WT ${note.weight}kg`, margin, y);
          y += 7;
          doc.setFont('helvetica', 'normal');
          doc.setFontSize(10);
          const splitNotes = doc.splitTextToSize(note.notes, pageWidth - (margin * 2 + 5));
          doc.text(splitNotes, margin + 3, y);
          y += (splitNotes.length * 6) + 12;
          doc.setDrawColor(245);
          doc.line(margin, y - 8, pageWidth - margin, y - 8);
        });
      }

      doc.save(`N4D_PatientReport_${data.initials}.pdf`);
    } catch (err) {
      alert("Error generating formal clinical PDF.");
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const handleCopy = (type: 'text' | 'json') => {
    const content = type === 'json' ? JSON.stringify(data, null, 2) : 
      `PATIENT: ${data.initials} | ID: ${data.patientId}\nCARE PLAN: ${data.otherProblems}\nINTERVENTIONS: ${data.nursingInterventions}`;
    navigator.clipboard.writeText(content);
    setCopied(type);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 md:px-0 pb-32">
      {/* RESPONSIVE HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-14">
        <div className="flex items-start md:items-center gap-6 md:gap-10">
          <div className="w-20 h-20 md:w-32 md:h-32 bg-black rounded-[2rem] md:rounded-[3.5rem] flex items-center justify-center text-white text-3xl md:text-6xl font-black shadow-heavy ring-[8px] md:ring-[15px] ring-zinc-50/50 flex-shrink-0 transition-transform hover:scale-105">
            {data.initials.slice(0, 1).toUpperCase()}
          </div>
          <div className="space-y-2 md:space-y-4">
            <div className="flex flex-wrap items-center gap-3">
              <StatusBadge label={data.category} color="blue" />
              <span className="text-zinc-200 text-xs hidden sm:block">•</span>
              <span className="text-zinc-400 text-[9px] md:text-[10px] font-black uppercase tracking-widest flex items-center gap-1"><Hash size={10}/>{data.patientId}</span>
            </div>
            <h1 className="text-4xl md:text-7xl font-black text-zinc-900 tracking-tighter leading-none">{data.initials}</h1>
            <p className="text-[10px] md:text-[12px] font-bold text-zinc-300 uppercase tracking-widest leading-none">BS Nursing Section N4D Public Health</p>
          </div>
        </div>
        
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <button onClick={generatePDF} disabled={isGeneratingPdf} className="flex-1 md:flex-none flex items-center justify-center gap-3 bg-zinc-900 text-white px-8 py-4 md:px-12 md:py-6 rounded-2xl md:rounded-[2.5rem] font-black text-[9px] md:text-[11px] uppercase tracking-widest hover:bg-black transition-all shadow-heavy disabled:opacity-50">
            {isGeneratingPdf ? <Loader2 size={18} className="animate-spin" /> : <Download size={18} />}
            {isGeneratingPdf ? 'Processing...' : 'Export Formal PDF'}
          </button>
          <button onClick={onEdit} className="flex-1 md:flex-none flex items-center justify-center gap-3 bg-white border border-zinc-200 text-zinc-900 px-6 py-4 md:px-10 md:py-6 rounded-2xl md:rounded-[2.5rem] font-black text-[9px] md:text-[11px] uppercase tracking-widest hover:bg-zinc-50 transition-all shadow-soft">
            <Edit3 size={18} /> Update
          </button>
        </div>
      </div>

      {/* MOBILE TABS */}
      <div className="flex bg-zinc-100/50 p-2 rounded-2xl md:rounded-[4rem] mb-10 border border-zinc-100 shadow-inner overflow-hidden">
        <button onClick={() => setActiveTab('profile')} className={`flex-1 flex items-center justify-center gap-2 md:gap-4 py-4 md:py-6 rounded-xl md:rounded-[3.5rem] text-[9px] md:text-[12px] font-black uppercase tracking-widest transition-all ${activeTab === 'profile' ? 'bg-white text-black shadow-soft border border-zinc-50' : 'text-zinc-400 hover:text-zinc-600'}`}>
          <ClipboardList size={16} /> Clinical Profile
        </button>
        <button onClick={() => setActiveTab('monitoring')} className={`flex-1 flex items-center justify-center gap-2 md:gap-4 py-4 md:py-6 rounded-xl md:rounded-[3.5rem] text-[9px] md:text-[12px] font-black uppercase tracking-widest transition-all ${activeTab === 'monitoring' ? 'bg-white text-black shadow-soft border border-zinc-50' : 'text-zinc-400 hover:text-zinc-600'}`}>
          <Clock size={16} /> Progress Journal
        </button>
      </div>

      {activeTab === 'profile' ? (
        <div className="space-y-8 md:space-y-12 animate-fadeIn">
          {/* VITALS DASHBOARD - HIGHLY RESPONSIVE */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4 md:gap-8 bg-zinc-900 p-8 md:p-14 rounded-[2rem] md:rounded-[4rem] shadow-heavy relative overflow-hidden">
             <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full translate-x-10 -translate-y-10 blur-2xl" />
             {[
               { label: 'BP SYS/DIA', val: `${data.bpSystolic}/${data.bpDiastolic}`, unit: 'mmHg', icon: HeartPulse },
               { label: 'Heart Rate', val: data.hr, unit: 'bpm', icon: Activity },
               { label: 'Breath Rate', val: data.rr, unit: 'cpm', icon: Wind },
               { label: 'Body Temp', val: data.temp, unit: '°C', icon: Thermometer },
               { label: 'Weight', val: data.weight, unit: 'kg', icon: Weight },
               { label: 'Height', val: data.height, unit: 'cm', icon: Ruler }
             ].map((v, i) => (
               <div key={i} className="text-center md:border-r border-zinc-800 last:border-0 pr-0 md:pr-4 group">
                  <div className="flex items-center justify-center gap-2 mb-3">
                     <v.icon size={12} className="text-zinc-600 group-hover:text-white transition-colors" />
                     <span className="text-[8px] font-black uppercase tracking-widest text-zinc-600 group-hover:text-zinc-400">{v.label}</span>
                  </div>
                  <div className="flex items-baseline justify-center gap-1">
                     <span className="text-2xl md:text-4xl font-black text-white tracking-tighter">{v.val || '--'}</span>
                     <span className="text-[9px] font-bold text-zinc-700 uppercase tracking-widest">{v.unit}</span>
                  </div>
               </div>
             ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 md:gap-12">
            <div className="lg:col-span-2 space-y-8 md:space-y-12">
               {/* CLINICAL PROBLEM & PLAN CARD - EMPHASIZED */}
               <div className="bg-zinc-50 border-2 border-zinc-900 rounded-[2.5rem] md:rounded-[4rem] p-8 md:p-14 shadow-heavy relative overflow-hidden group hover:scale-[1.01] transition-transform">
                  <div className="absolute top-0 left-0 w-2 h-full bg-zinc-900" />
                  <div className="flex items-center gap-5 mb-10 pb-8 border-b border-zinc-200">
                    <div className="w-12 h-12 md:w-16 md:h-16 rounded-[1.5rem] bg-zinc-900 flex items-center justify-center text-white">
                       <Target size={28} />
                    </div>
                    <div>
                       <h3 className="text-[11px] md:text-[13px] font-black uppercase tracking-[0.4em] text-zinc-900">Nursing Care Strategy</h3>
                       <p className="text-[9px] md:text-[10px] font-bold text-zinc-400 uppercase tracking-widest mt-1">Problem & Outcome Plan</p>
                    </div>
                  </div>
                  <div className="space-y-12">
                     <DetailItem label="Primary Nursing Diagnosis / Problems Identified" value={data.otherProblems} highlight fullWidth />
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-10 border-t border-zinc-200 pt-10">
                        <DetailItem label="Short-Term Expected Goals" value={data.shortTermGoals} />
                        <DetailItem label="Planned Interventions & Teachings" value={data.nursingInterventions} />
                     </div>
                  </div>
               </div>

               <BaselineCard title="Initial Assessment Summary" icon={Stethoscope}>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-10">
                    <DetailItem label="Medical Diagnosis" value={data.primaryDiagnosis} fullWidth />
                    <DetailItem label="Subjective Narrative" value={data.subjectiveSymptoms} />
                    <DetailItem label="Objective Findings" value={data.objectiveFindings} />
                    <DetailItem label="Procedures & Procedures" value={data.treatments} fullWidth />
                    <div className="col-span-full pt-6">
                       <label className="text-[9px] font-black uppercase tracking-[0.25em] text-zinc-300 block mb-4">Chronic History</label>
                       <div className="flex flex-wrap gap-2.5">
                          {data.chronicDiseases.length > 0 ? data.chronicDiseases.map(d => <StatusBadge key={d} label={d} />) : <span className="text-xs font-bold text-zinc-300 italic">No chronic diseases recorded</span>}
                       </div>
                    </div>
                  </div>
               </BaselineCard>

               <BaselineCard title="Social & Lifestyle Profile" icon={User}>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-10">
                    <DetailItem label="Living Situation" value={data.livingSituation} />
                    <DetailItem label="Education / Work" value={`${data.education} • ${data.sourceOfIncome}`} />
                    <DetailItem label="Cost Difficulties" value={data.difficultyMedicines === 'Yes' ? 'Reported financial barriers to treatment' : 'No cost barriers reported'} fullWidth />
                    <DetailItem label="Physical Habits" value={`${data.physicalActivity}: ${data.activityType} (${data.activityFreq})`} />
                    <DetailItem label="Substance Profile" value={`${data.tobaccoUse || 'No'} Tobacco / Alcohol: ${data.alcoholUse || 'None'}`} />
                  </div>
               </BaselineCard>
            </div>

            <div className="space-y-8 md:space-y-12">
               {/* REFERRAL CARD */}
               {data.referredTo.length > 0 && (
                 <div className="bg-emerald-50/50 border border-emerald-100 p-8 md:p-10 rounded-[2.5rem] md:rounded-[3.5rem] relative group border-t-8 border-t-emerald-500">
                    <Send className="absolute top-10 right-10 text-emerald-200 group-hover:text-emerald-400 transition-all" size={40} />
                    <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-600 mb-8">Active Clinical Referral</h4>
                    <div className="space-y-8">
                      <DetailItem label="Referred To" value={data.referredTo.join(', ')} />
                      <DetailItem label="Priority Level" value={data.referralUrgency} />
                      <DetailItem label="Referral Date" value={data.referralDate} />
                      <DetailItem label="Current Feedback" value={data.referralOutcome || 'Awaiting outcome...'} />
                    </div>
                 </div>
               )}

               <div className="bg-rose-50/50 border border-rose-100 p-8 md:p-10 rounded-[2.5rem] md:rounded-[3.5rem] group border-t-8 border-t-rose-500">
                  <ShieldAlert className="text-rose-200 mb-8 group-hover:text-rose-400 transition-colors" size={32} />
                  <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-rose-600 mb-8">Patient Safety Watch</h4>
                  <div className="space-y-8">
                    <DetailItem label="Reported Allergies" value={`${data.drugAllergies || ''} ${data.foodAllergies || ''}`.trim() || 'NONE REPORTED'} />
                    <DetailItem label="Relevant Family History" value={data.familyHistory.join(', ') || 'NONE REPORTED'} />
                  </div>
               </div>

               <BaselineCard title="Emergency Liaisons" icon={MapPin}>
                  <div className="space-y-8">
                    <DetailItem label="Address Registered" value={data.address} />
                    <DetailItem label="Kin Contact" value={data.emergencyContact} />
                    <DetailItem label="Relation & Number" value={`${data.emergencyRelation} • ${data.emergencyNumber}`} />
                  </div>
               </BaselineCard>
            </div>
          </div>
        </div>
      ) : (
        /* MONITORING JOURNAL - NO SCROLLING VISUALS FOR MOBILE */
        <div className="space-y-10 animate-fadeIn">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-6">
            <h3 className="text-3xl md:text-5xl font-black text-zinc-900 tracking-tighter">Clinical Monitoring</h3>
            <button onClick={() => { setEditingNoteId(null); setShowNoteForm(!showNoteForm); }} className="w-full sm:w-auto bg-black text-white px-10 py-5 rounded-2xl md:rounded-full font-black text-[10px] md:text-[12px] uppercase tracking-widest hover:scale-[1.05] transition-all flex items-center justify-center gap-3 shadow-heavy">
              {showNoteForm ? <X size={20} /> : <><Plus size={20} /> Add Progress Note</>}
            </button>
          </div>

          {showNoteForm && (
            <div className="bg-white p-8 md:p-14 rounded-[2.5rem] md:rounded-[4rem] border border-zinc-100 shadow-heavy mb-12 relative overflow-hidden">
               <div className="absolute top-0 left-0 w-full h-2 bg-zinc-900" />
               <h4 className="text-[11px] font-black uppercase tracking-[0.5em] text-zinc-300 mb-12 text-center">New Monitoring Entry</h4>
               <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-6 mb-12">
                  {['bpSystolic', 'bpDiastolic', 'hr', 'rr', 'temp', 'weight'].map(k => (
                    <div key={k} className="space-y-2">
                      <label className="text-[8px] md:text-[9px] font-black uppercase tracking-widest text-zinc-300">{k.replace('bp', 'BP ')}</label>
                      <input type="number" className="w-full bg-zinc-50 border border-zinc-100 rounded-xl p-4 text-sm font-black focus:bg-white focus:outline-none focus:ring-4 focus:ring-zinc-50 transition-all" value={(newNote as any)[k]} onChange={e => setNewNote({...newNote, [k]: e.target.value})} />
                    </div>
                  ))}
               </div>
               <div className="space-y-3 mb-12">
                  <label className="text-[9px] font-black uppercase tracking-widest text-zinc-300">Detailed Observation (SOAP Format Recommended)</label>
                  <textarea className="w-full bg-zinc-50 border border-zinc-100 rounded-[2rem] p-8 text-sm md:text-base font-medium focus:bg-white focus:outline-none focus:ring-4 focus:ring-zinc-50 transition-all" rows={6} placeholder="Type findings and assessment here..." value={newNote.notes} onChange={e => setNewNote({...newNote, notes: e.target.value})} />
               </div>
               <div className="flex justify-center">
                  <button onClick={handleAddOrUpdateNote} disabled={isSyncing} className="w-full sm:w-auto bg-zinc-900 text-white px-16 py-6 rounded-full font-black text-xs md:text-sm uppercase tracking-widest transition-all flex items-center justify-center gap-4 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 shadow-heavy">
                    {isSyncing ? <Loader2 size={20} className="animate-spin" /> : <Save size={20} />}
                    Commit to Chart
                  </button>
               </div>
            </div>
          )}

          <div className="space-y-8">
            {(!data.progressNotes || data.progressNotes.length === 0) ? (
              <div className="text-center py-32 bg-zinc-50/50 rounded-[3rem] border-2 border-dashed border-zinc-100">
                <FileText size={48} className="mx-auto text-zinc-100 mb-6" />
                <p className="text-zinc-300 font-black uppercase tracking-widest text-[10px]">No progress records in database</p>
              </div>
            ) : (
              data.progressNotes.map(note => (
                <div key={note.id} className="bg-white border border-zinc-50 p-8 md:p-12 rounded-[2.5rem] md:rounded-[4rem] shadow-sm hover:shadow-heavy transition-all group border-l-8 border-l-zinc-50 hover:border-l-zinc-900">
                   <div className="flex flex-col md:flex-row justify-between md:items-center gap-6 mb-10 pb-10 border-b border-zinc-50">
                      <div className="flex items-center gap-6">
                         <div className="w-14 h-14 bg-zinc-50 rounded-2xl flex items-center justify-center text-zinc-300 group-hover:bg-black group-hover:text-white transition-all shadow-inner"><Clock size={20} /></div>
                         <div>
                            <span className="text-xl md:text-2xl font-black text-zinc-900 block">{note.date}</span>
                            <span className="text-[9px] font-bold text-zinc-300 uppercase tracking-widest">Clinical Encoding Session</span>
                         </div>
                      </div>
                      <div className="flex flex-wrap gap-4 items-center">
                         <div className="flex gap-2 bg-zinc-50 px-4 py-2.5 rounded-2xl border border-zinc-100">
                            <span className="text-[10px] font-black text-zinc-700">BP {note.bpSystolic}/{note.bpDiastolic}</span>
                            <span className="text-zinc-200 text-[10px]">|</span>
                            <span className="text-[10px] font-black text-zinc-700">HR {note.hr} BPM</span>
                         </div>
                         <div className="flex gap-2">
                            <button onClick={() => handleEditNote(note)} className="p-3 text-zinc-200 hover:text-black transition-colors rounded-xl hover:bg-zinc-50"><Edit3 size={18}/></button>
                            <button onClick={() => handleDeleteNote(note.id)} className="p-3 text-zinc-200 hover:text-rose-500 transition-colors rounded-xl hover:bg-rose-50"><Trash2 size={18}/></button>
                         </div>
                      </div>
                   </div>
                   <p className="text-base md:text-lg text-zinc-600 leading-relaxed font-medium whitespace-pre-wrap px-4">{note.notes}</p>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

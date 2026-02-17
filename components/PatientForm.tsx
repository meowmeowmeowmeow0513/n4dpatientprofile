import React, { useState, useEffect } from 'react';
import { PatientData, Category, Gender, Medication } from '../types';
import { Plus, Trash2, ChevronDown, ChevronUp, Save, AlertCircle, ArrowLeft } from 'lucide-react';

const InputField = ({ label, field, value, onChange, error, type = 'text', required = false, placeholder = '' }: any) => (
  <div className="space-y-1.5 group">
    <label className="block text-[10px] md:text-[11px] font-black uppercase tracking-widest text-zinc-400 group-focus-within:text-black transition-colors">
      {label} {required && <span className="text-rose-500">*</span>}
    </label>
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(field, type === 'number' ? (e.target.value ? Number(e.target.value) : '') : e.target.value)}
      className={`w-full rounded-xl md:rounded-2xl border ${error ? 'border-rose-300 bg-rose-50/20' : 'border-zinc-200 bg-white focus:border-zinc-900 focus:ring-zinc-100'} px-4 py-4 md:px-5 md:py-4.5 text-sm transition-all focus:outline-none shadow-sm`}
      placeholder={placeholder}
      autoComplete="off"
    />
    {error && <p className="text-[10px] font-bold text-rose-500 uppercase flex items-center gap-1 mt-1 tracking-wider"><AlertCircle size={10}/> {error}</p>}
  </div>
);

const TextareaField = ({ label, field, value, onChange, error, required = false, placeholder = '' }: any) => (
  <div className="col-span-full space-y-1.5 group">
    <label className="block text-[10px] md:text-[11px] font-black uppercase tracking-widest text-zinc-400 group-focus-within:text-black transition-colors">
      {label} {required && <span className="text-rose-500">*</span>}
    </label>
    <textarea
      value={value}
      onChange={(e) => onChange(field, e.target.value)}
      rows={3}
      placeholder={placeholder}
      className={`w-full rounded-xl md:rounded-2xl border ${error ? 'border-rose-300 bg-rose-50/20' : 'border-zinc-200 bg-white focus:border-zinc-900 focus:ring-zinc-100'} px-4 py-4 md:px-5 md:py-4.5 text-sm transition-all focus:outline-none shadow-sm`}
    />
    {error && <p className="text-[10px] font-bold text-rose-500 uppercase mt-1 tracking-wider">{error}</p>}
  </div>
);

const FormSection = ({ id, title, expandedSection, toggleSection, children }: any) => (
  <div className="bg-white border border-zinc-100 rounded-[1.5rem] md:rounded-[2.5rem] mb-4 md:mb-6 overflow-hidden shadow-soft transition-all duration-300">
    <button
      type="button"
      onClick={() => toggleSection(id)}
      className={`w-full flex items-center justify-between p-6 md:p-8 text-left transition-all ${expandedSection === id ? 'bg-zinc-50/40 border-b border-zinc-50' : 'bg-white hover:bg-zinc-50/20'}`}
    >
      <span className="text-sm md:text-base font-extrabold uppercase tracking-widest text-zinc-900">{title}</span>
      {expandedSection === id ? <ChevronUp size={20} className="text-zinc-400" /> : <ChevronDown size={20} className="text-zinc-400" />}
    </button>
    {expandedSection === id && (
      <div className="p-6 md:p-10 space-y-8 md:space-y-10 bg-white animate-fadeIn">
        {children}
      </div>
    )}
  </div>
);

interface PatientFormProps {
  initialData: PatientData;
  onSave: (data: PatientData) => void;
  onCancel: () => void;
}

export const PatientForm: React.FC<PatientFormProps> = ({ initialData, onSave, onCancel }) => {
  const [formData, setFormData] = useState<PatientData>(initialData);
  const [errors, setErrors] = useState<Partial<Record<keyof PatientData, string>>>({});
  const [expandedSection, setExpandedSection] = useState<string>('meta');

  useEffect(() => {
    setFormData(initialData);
  }, [initialData]);

  const handleChange = (field: keyof PatientData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleCheckbox = (field: keyof PatientData, value: string) => {
    const currentList = (formData[field] as string[]) || [];
    if (currentList.includes(value)) {
      handleChange(field, currentList.filter(item => item !== value));
    } else {
      handleChange(field, [...currentList, value]);
    }
  };

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? '' : section);
  };

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof PatientData, string>> = {};
    if (!formData.patientId) newErrors.patientId = 'Required';
    if (!formData.category) newErrors.category = 'Required';
    if (!formData.initials) newErrors.initials = 'Required';
    if (!formData.age) newErrors.age = 'Required';
    if (!formData.primaryDiagnosis) newErrors.primaryDiagnosis = 'Required';

    setErrors(newErrors);
    
    if (Object.keys(newErrors).length > 0) {
      if (newErrors.patientId || newErrors.category) setExpandedSection('meta');
      else if (newErrors.initials || newErrors.age) setExpandedSection('profile');
      else if (newErrors.primaryDiagnosis) setExpandedSection('medical');
    }

    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      onSave({ ...formData, lastUpdated: Date.now() });
    }
  };

  const addMedication = () => {
    const newMed: Medication = {
      id: Date.now().toString(),
      name: '', dose: '', route: '', frequency: '', purpose: '', compliance: 'Yes'
    };
    setFormData(prev => ({ ...prev, medications: [...prev.medications, newMed] }));
  };

  const updateMedication = (id: string, field: keyof Medication, value: string) => {
    setFormData(prev => ({
      ...prev,
      medications: prev.medications.map(med => med.id === id ? { ...med, [field]: value } : med)
    }));
  };

  const removeMedication = (id: string) => {
    setFormData(prev => ({
      ...prev,
      medications: prev.medications.filter(med => med.id !== id)
    }));
  };

  return (
    <div className="max-w-4xl mx-auto px-4 md:px-0 pb-32 md:pb-48">
      <div className="mb-10 md:mb-14 flex flex-col md:flex-row md:items-end justify-between gap-6 md:gap-8">
        <div>
          <button type="button" onClick={onCancel} className="flex items-center text-zinc-400 hover:text-black mb-4 md:mb-6 transition-colors font-black text-[9px] md:text-[10px] uppercase tracking-widest group">
            <ArrowLeft size={14} className="mr-2 group-hover:-translate-x-1 transition-transform" /> Back to Dashboard
          </button>
          <h2 className="text-3xl md:text-5xl font-black text-zinc-900 tracking-tighter leading-tight">Clinical Encoding</h2>
          <p className="text-zinc-400 font-medium text-sm md:text-lg mt-1">Section N4D Public Health Nursing</p>
        </div>
        <button type="button" onClick={handleSubmit} className="w-full md:w-auto bg-black text-white px-8 py-5 rounded-2xl md:rounded-[2.5rem] font-black text-xs uppercase tracking-[0.2em] hover:scale-[1.02] active:scale-[0.98] transition-all shadow-heavy flex items-center justify-center gap-3">
          <Save size={18} /> Commit Record
        </button>
      </div>

      <div className="space-y-4">
        <FormSection id="meta" title="1. Meta & Header" expandedSection={expandedSection} toggleSection={toggleSection}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 md:gap-8">
            <InputField label="Patient ID" field="patientId" value={formData.patientId} onChange={handleChange} error={errors.patientId} required placeholder="e.g. 2024-N4D-001" />
            <InputField label="Student In-Charge" field="studentInCharge" value={formData.studentInCharge} onChange={handleChange} placeholder="Encoded by..." />
            <InputField label="Family Code" field="familyCode" value={formData.familyCode} onChange={handleChange} placeholder="Optional" />
            <div className="space-y-2 group">
              <label className="block text-[10px] md:text-[11px] font-bold uppercase tracking-widest text-zinc-400">Category *</label>
              <div className="relative">
                <select
                  value={formData.category as string}
                  onChange={(e) => handleChange('category', e.target.value)}
                  className={`w-full rounded-xl md:rounded-2xl border ${errors.category ? 'border-rose-300 bg-rose-50/20' : 'border-zinc-200 bg-white'} px-4 py-4 md:px-5 text-sm appearance-none cursor-pointer focus:border-black focus:ring-4 focus:ring-zinc-100 transition-all`}
                >
                  <option value="">Select Category</option>
                  {Object.values(Category).map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" size={16} />
              </div>
            </div>
          </div>
        </FormSection>

        <FormSection id="profile" title="2. Patient Profile" expandedSection={expandedSection} toggleSection={toggleSection}>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 md:gap-8">
            <InputField label="Initials" field="initials" value={formData.initials} onChange={handleChange} error={errors.initials} required placeholder="e.g. ABC" />
            <InputField label="Age" field="age" type="number" value={formData.age} onChange={handleChange} error={errors.age} required />
            <InputField label="Date of Birth" field="dob" type="date" value={formData.dob} onChange={handleChange} />
            
            <div className="sm:col-span-2 bg-zinc-50/50 p-6 rounded-2xl border border-zinc-100">
              <label className="block text-[10px] md:text-[11px] font-black uppercase tracking-widest text-zinc-400 mb-4">Gender</label>
              <div className="flex flex-wrap gap-x-8 gap-y-4">
                {Object.values(Gender).map(g => (
                  <label key={g} className="flex items-center gap-3 text-sm font-bold text-zinc-600 cursor-pointer group">
                    <input type="radio" name="gender" value={g} checked={formData.gender === g} onChange={() => handleChange('gender', g)} className="w-5 h-5 text-black border-zinc-300" />
                    <span className="group-hover:text-black transition-colors">{g}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="space-y-2 group">
              <label className="block text-[10px] md:text-[11px] font-bold uppercase tracking-widest text-zinc-400">Civil Status</label>
              <div className="relative">
                <select value={formData.civilStatus} onChange={(e) => handleChange('civilStatus', e.target.value)} className="w-full rounded-xl md:rounded-2xl border border-zinc-200 bg-white px-4 py-4 md:px-5 text-sm appearance-none cursor-pointer">
                  <option value="">Select Status</option>
                  {['Single', 'Married', 'Widowed', 'Live-in', 'Separated'].map(s => <option key={s} value={s}>{s}</option>)}
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" size={16} />
              </div>
            </div>

            <TextareaField label="Address" field="address" value={formData.address} onChange={handleChange} placeholder="House No./Purok/Street, Barangay, City" />
            
            <InputField label="Contact Number" field="contactNumber" value={formData.contactNumber} onChange={handleChange} />
            <div className="space-y-2 group">
               <label className="block text-[10px] md:text-[11px] font-bold uppercase tracking-widest text-zinc-400">Preferred Contact</label>
               <div className="relative">
                 <select value={formData.contactMethod} onChange={(e) => handleChange('contactMethod', e.target.value)} className="w-full rounded-xl md:rounded-2xl border border-zinc-200 bg-white px-4 py-4 md:px-5 text-sm appearance-none cursor-pointer">
                   <option value="">Select Method</option>
                   <option value="Call">Call</option>
                   <option value="Text">Text</option>
                   <option value="BHW">Through BHW</option>
                   <option value="Others">Others</option>
                 </select>
                 <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" size={16} />
               </div>
            </div>
            
            <div className="col-span-full pt-8 border-t border-zinc-50 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 md:gap-8 mt-4">
               <p className="col-span-full text-[9px] md:text-[10px] font-black uppercase tracking-[0.3em] text-zinc-300">Emergency Contact Information</p>
               <InputField label="Full Name" field="emergencyContact" value={formData.emergencyContact} onChange={handleChange} />
               <InputField label="Relationship" field="emergencyRelation" value={formData.emergencyRelation} onChange={handleChange} />
               <InputField label="Contact No." field="emergencyNumber" value={formData.emergencyNumber} onChange={handleChange} />
            </div>
          </div>
        </FormSection>

        <FormSection id="medical" title="3. Medical History" expandedSection={expandedSection} toggleSection={toggleSection}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 md:gap-8">
             <TextareaField label="Primary Diagnosis / Health Problem" field="primaryDiagnosis" value={formData.primaryDiagnosis} onChange={handleChange} error={errors.primaryDiagnosis} required placeholder="Main diagnosis or chief complaint..." />
             <TextareaField label="Secondary Diagnoses" field="secondaryDiagnosis" value={formData.secondaryDiagnosis} onChange={handleChange} />
             
             <div className="col-span-full space-y-6">
               <label className="block text-[10px] md:text-[11px] font-bold uppercase tracking-widest text-zinc-400">Chronic Diseases</label>
               <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 md:gap-6">
                 {['Hypertension', 'Diabetes', 'Asthma/COPD', 'Heart Disease', 'Kidney Disease', 'Stroke', 'TB', 'Cancer'].map(d => (
                   <label key={d} className="flex items-center gap-3 text-xs md:text-sm font-bold text-zinc-500 cursor-pointer hover:text-black">
                     <input type="checkbox" checked={formData.chronicDiseases.includes(d)} onChange={() => handleCheckbox('chronicDiseases', d)} className="w-5 h-5 rounded-lg border-zinc-200 text-black" />
                     <span>{d}</span>
                   </label>
                 ))}
               </div>
               <InputField label="Other Chronic Conditions" field="otherChronicDisease" value={formData.otherChronicDisease} onChange={handleChange} placeholder="If any..." />
             </div>

             <div className="col-span-full pt-8 border-t border-zinc-50 space-y-8">
               <TextareaField label="Hospitalizations / Surgeries" field="hospitalizations" value={formData.hospitalizations} onChange={handleChange} placeholder="Include years and reasons..." />
               
               <div className="space-y-4">
                  <label className="block text-[10px] md:text-[11px] font-bold uppercase tracking-widest text-zinc-400">Allergies</label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 md:gap-8">
                    <InputField label="Drug" field="drugAllergies" value={formData.drugAllergies} onChange={handleChange} />
                    <InputField label="Food" field="foodAllergies" value={formData.foodAllergies} onChange={handleChange} />
                    <InputField label="Others" field="otherAllergies" value={formData.otherAllergies} onChange={handleChange} />
                  </div>
               </div>

               <div className="mt-8 pt-8 border-t border-zinc-50">
                  <label className="block text-[10px] md:text-[11px] font-bold uppercase tracking-widest text-zinc-400 mb-6">Family Medical History</label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 md:gap-6">
                    {['Hypertension', 'Diabetes', 'Heart Disease', 'Stroke', 'Cancer', 'TB', 'Mental illness'].map(f => (
                      <label key={f} className="flex items-center gap-3 text-xs md:text-sm font-bold text-zinc-500 cursor-pointer">
                        <input type="checkbox" checked={formData.familyHistory.includes(f)} onChange={() => handleCheckbox('familyHistory', f)} className="w-5 h-5 rounded-lg border-zinc-200 text-black" />
                        <span>{f}</span>
                      </label>
                    ))}
                  </div>
                  <div className="mt-6">
                    <InputField label="Other Family History" field="otherFamilyHistory" value={formData.otherFamilyHistory} onChange={handleChange} />
                  </div>
               </div>
             </div>
          </div>
        </FormSection>

        <FormSection id="clinical" title="4. Current Clinical Status" expandedSection={expandedSection} toggleSection={toggleSection}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 md:gap-8">
             <TextareaField label="Subjective Symptoms" field="subjectiveSymptoms" value={formData.subjectiveSymptoms} onChange={handleChange} />
             <TextareaField label="Objective Findings" field="objectiveFindings" value={formData.objectiveFindings} onChange={handleChange} />
             
             <div className="col-span-full grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-4 p-6 md:p-10 bg-zinc-50/50 border border-zinc-100 rounded-2xl md:rounded-[3rem]">
                <InputField label="BP Sys" field="bpSystolic" value={formData.bpSystolic} onChange={handleChange} type="number" />
                <InputField label="BP Dias" field="bpDiastolic" value={formData.bpDiastolic} onChange={handleChange} type="number" />
                <InputField label="HR" field="hr" value={formData.hr} onChange={handleChange} type="number" />
                <InputField label="RR" field="rr" value={formData.rr} onChange={handleChange} type="number" />
                <InputField label="Temp" field="temp" value={formData.temp} onChange={handleChange} type="number" />
                <InputField label="Wt (kg)" field="weight" value={formData.weight} onChange={handleChange} type="number" />
                <InputField label="Ht (cm)" field="height" value={formData.height} onChange={handleChange} type="number" />
             </div>

             <div className="col-span-full">
               <div className="flex justify-between items-center mb-6">
                  <label className="text-[10px] md:text-[11px] font-bold uppercase tracking-widest text-zinc-400">Current Medications Table</label>
                  <button type="button" onClick={addMedication} className="text-[9px] font-black uppercase tracking-widest text-zinc-900 bg-white border border-zinc-200 px-5 py-2.5 rounded-full hover:bg-zinc-50 shadow-sm flex items-center gap-2 transition-all active:scale-95">
                    <Plus size={12} /> Add Drug
                  </button>
               </div>
               <div className="border border-zinc-100 rounded-2xl overflow-hidden bg-white shadow-soft overflow-x-auto">
                 <table className="w-full text-xs text-left min-w-[700px]">
                   <thead className="bg-zinc-50/30 text-zinc-400 font-black uppercase tracking-widest border-b border-zinc-100">
                     <tr>
                       <th className="px-6 py-4">Medication Name</th>
                       <th className="px-6 py-4">Dose / Route</th>
                       <th className="px-6 py-4">Frequency</th>
                       <th className="px-6 py-4">Compliant?</th>
                       <th className="px-6 py-4 w-10"></th>
                     </tr>
                   </thead>
                   <tbody className="divide-y divide-zinc-50">
                     {formData.medications.map((med) => (
                       <tr key={med.id} className="hover:bg-zinc-50/20 transition-colors">
                         <td className="px-6 py-4"><input type="text" className="w-full font-bold bg-transparent focus:outline-none" placeholder="Drug Name" value={med.name} onChange={e => updateMedication(med.id, 'name', e.target.value)} /></td>
                         <td className="px-6 py-4"><input type="text" className="w-full bg-transparent focus:outline-none" placeholder="e.g. 500mg PO" value={med.dose} onChange={e => updateMedication(med.id, 'dose', e.target.value)} /></td>
                         <td className="px-6 py-4"><input type="text" className="w-full bg-transparent focus:outline-none" placeholder="e.g. OD, BID" value={med.frequency} onChange={e => updateMedication(med.id, 'frequency', e.target.value)} /></td>
                         <td className="px-6 py-4">
                           <select value={med.compliance} onChange={e => updateMedication(med.id, 'compliance', e.target.value as any)} className="bg-transparent font-bold uppercase text-[9px] cursor-pointer tracking-widest text-zinc-600">
                             <option>Yes</option><option>No</option><option>Sometimes</option>
                           </select>
                         </td>
                         <td className="px-6 py-4 text-center"><button type="button" onClick={() => removeMedication(med.id)} className="text-zinc-300 hover:text-rose-500 transition-colors"><Trash2 size={16} /></button></td>
                       </tr>
                     ))}
                   </tbody>
                 </table>
                 {formData.medications.length === 0 && (
                   <div className="p-10 text-center text-zinc-300 font-black uppercase tracking-widest text-[9px]">No maintenance drugs recorded</div>
                 )}
               </div>
             </div>
             <TextareaField label="Current Treatments & Procedures" field="treatments" value={formData.treatments} onChange={handleChange} />
             <TextareaField label="Immunization Summary" field="immunizationStatus" value={formData.immunizationStatus} onChange={handleChange} placeholder="Vaccination history..." />
          </div>
        </FormSection>

        <FormSection id="social" title="5. Social & Lifestyle" expandedSection={expandedSection} toggleSection={toggleSection}>
           <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 md:gap-8">
              <InputField label="Living Situation" field="livingSituation" value={formData.livingSituation} onChange={handleChange} placeholder="e.g. Lives with spouse" />
              <InputField label="Highest Attainment" field="education" value={formData.education} onChange={handleChange} />
              <InputField label="Primary Work / Income" field="sourceOfIncome" value={formData.sourceOfIncome} onChange={handleChange} />
              <InputField label="Social Support System" field="supportSystem" value={formData.supportSystem} onChange={handleChange} />
              
              <div className="col-span-full bg-zinc-50/50 p-6 md:p-10 rounded-[2rem] border border-zinc-100 grid grid-cols-1 sm:grid-cols-2 gap-8 md:gap-10">
                   <div className="space-y-4">
                      <label className="block text-[10px] md:text-[11px] font-black uppercase tracking-widest text-zinc-400">Financial difficulty with meds?</label>
                      <div className="flex gap-10">
                         {['Yes', 'No'].map(v => (
                           <label key={v} className="flex items-center gap-3 text-sm font-bold text-zinc-600 cursor-pointer group">
                             <input type="radio" checked={formData.difficultyMedicines === v} onChange={() => handleChange('difficultyMedicines', v)} className="w-5 h-5 text-black border-zinc-300" />
                             <span className="group-hover:text-black transition-colors">{v}</span>
                           </label>
                         ))}
                      </div>
                   </div>
                   <div className="space-y-4">
                      <label className="block text-[10px] md:text-[11px] font-black uppercase tracking-widest text-zinc-400">Illness affects work/school?</label>
                      <div className="flex gap-10">
                         {['Yes', 'No'].map(v => (
                           <label key={v} className="flex items-center gap-3 text-sm font-bold text-zinc-600 cursor-pointer group">
                             <input type="radio" checked={formData.illnessAffectsWork === v} onChange={() => handleChange('illnessAffectsWork', v)} className="w-5 h-5 text-black border-zinc-300" />
                             <span className="group-hover:text-black transition-colors">{v}</span>
                           </label>
                         ))}
                      </div>
                   </div>
                   <div className="col-span-full">
                      <InputField label="Detailed Impact of Illness" field="illnessEffectDetails" value={formData.illnessEffectDetails} onChange={handleChange} placeholder="Describe how work or school is impacted..." />
                   </div>
              </div>

              <div className="bg-zinc-50/50 p-6 rounded-2xl border border-zinc-100 space-y-6">
                <p className="text-[10px] md:text-[11px] font-black uppercase tracking-widest text-zinc-400">Regular Physical Activity</p>
                <div className="flex gap-10 mb-2">
                  {['Yes', 'No'].map(v => (
                    <label key={v} className="flex items-center gap-3 text-sm font-bold text-zinc-600 cursor-pointer">
                      <input type="radio" checked={formData.physicalActivity === v} onChange={() => handleChange('physicalActivity', v)} className="w-5 h-5 text-black" />
                      <span>{v}</span>
                    </label>
                  ))}
                </div>
                <InputField label="Type of Activity" field="activityType" value={formData.activityType} onChange={handleChange} />
                <InputField label="Activity Frequency" field="activityFreq" value={formData.activityFreq} onChange={handleChange} />
              </div>

              <div className="bg-zinc-50/50 p-6 rounded-2xl border border-zinc-100 space-y-6">
                <p className="text-[10px] md:text-[11px] font-black uppercase tracking-widest text-zinc-400">Habits & Substance Use</p>
                <div className="flex flex-wrap gap-4 mb-2">
                  {['Never', 'Former', 'Current'].map(v => (
                    <label key={v} className="flex items-center gap-2 text-[10px] font-black uppercase text-zinc-500 cursor-pointer">
                      <input type="radio" checked={formData.tobaccoUse === v} onChange={() => handleChange('tobaccoUse', v)} className="w-4 h-4 text-black" />
                      <span>{v}</span>
                    </label>
                  ))}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <InputField label="Tobacco Type" field="tobaccoType" value={formData.tobaccoType} onChange={handleChange} />
                  <InputField label="Freq/Amount" field="tobaccoFreq" value={formData.tobaccoFreq} onChange={handleChange} />
                </div>
                <InputField label="Substance / Alcohol Use" field="substanceUse" value={formData.substanceUse} onChange={handleChange} placeholder="Type and frequency..." />
              </div>
           </div>
        </FormSection>

        <FormSection id="plan" title="6. Nursing Care Plan" expandedSection={expandedSection} toggleSection={toggleSection}>
           <div className="space-y-10">
              <TextareaField label="Nursing Diagnosis / Identified Problems" field="otherProblems" value={formData.otherProblems} onChange={handleChange} placeholder="Key health issues to address..." />
              <TextareaField label="Short-Term Clinical Goals" field="shortTermGoals" value={formData.shortTermGoals} onChange={handleChange} placeholder="Measurable outcomes..." />
              <TextareaField label="Planned Nursing Interventions" field="nursingInterventions" value={formData.nursingInterventions} onChange={handleChange} placeholder="Specific actions and teaching..." />
           </div>
        </FormSection>

        <FormSection id="referral" title="7. Clinical Referral" expandedSection={expandedSection} toggleSection={toggleSection}>
           <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 md:gap-8">
              <div className="col-span-full space-y-4">
                <label className="block text-[10px] md:text-[11px] font-bold uppercase tracking-widest text-zinc-400">Facility / Service</label>
                <div className="flex flex-wrap gap-4 md:gap-8">
                  {['BHS/Midwife', 'RHU/CHO', 'Hospital/ER', 'Social Worker', 'Mental Health'].map(r => (
                     <label key={r} className="flex items-center gap-3 text-xs md:text-sm font-bold text-zinc-500 cursor-pointer hover:text-black">
                       <input type="checkbox" checked={formData.referredTo.includes(r)} onChange={() => handleCheckbox('referredTo', r)} className="w-5 h-5 rounded-lg border-zinc-200 text-black" />
                       <span>{r}</span>
                     </label>
                  ))}
                </div>
              </div>
              <TextareaField label="Clinical Reason for Referral" field="referralReason" value={formData.referralReason} onChange={handleChange} />
              <div className="space-y-6 md:space-y-8">
                 <InputField label="Priority / Urgency" field="referralUrgency" value={formData.referralUrgency} onChange={handleChange} placeholder="Routine / Soon / Urgent" />
                 <InputField label="Date of Referral" field="referralDate" value={formData.referralDate} onChange={handleChange} type="date" />
              </div>
              <TextareaField label="Outcome / Clinical Feedback" field="referralOutcome" value={formData.referralOutcome} onChange={handleChange} />
           </div>
        </FormSection>
      </div>

      <div className="fixed bottom-8 right-8 md:bottom-12 md:right-12 z-50">
          <button type="button" onClick={handleSubmit} className="bg-black text-white px-10 py-5 rounded-[2rem] font-black text-sm md:text-base uppercase tracking-widest hover:scale-[1.05] active:scale-[0.95] transition-all shadow-heavy flex items-center gap-4">
            <Save size={24} /> Commit Profile
          </button>
      </div>
    </div>
  );
};
export enum Gender {
  Male = 'Male',
  Female = 'Female',
  Others = 'Others'
}

export enum Category {
  Maternal = 'Maternal',
  Child = 'Child (0-5)',
  Adolescent = 'Adolescent',
  Adult = 'Adult',
  Elderly = 'Elderly',
  NCD = 'NCD',
  TB = 'TB',
  Others = 'Others'
}

export interface Medication {
  id: string;
  name: string;
  dose: string;
  route: string;
  frequency: string;
  purpose: string;
  compliance: 'Yes' | 'No' | 'Sometimes';
}

export interface ProgressNote {
  id: string;
  date: string;
  timestamp: number;
  bpSystolic: number | '';
  bpDiastolic: number | '';
  hr: number | '';
  rr: number | '';
  temp: number | '';
  weight: number | '';
  notes: string; // SOAP or general notes
}

export interface PatientData {
  id: string;
  lastUpdated: number;
  
  // Header / Meta
  patientId: string;
  familyCode: string;
  category: Category | string;
  studentInCharge: string;

  // Profile
  initials: string;
  age: number | '';
  dob: string;
  gender: Gender | string;
  civilStatus: string;
  address: string;
  contactNumber: string;
  contactMethod: string;
  emergencyContact: string;
  emergencyRelation: string;
  emergencyNumber: string;

  // Medical Info
  primaryDiagnosis: string;
  secondaryDiagnosis: string;
  chronicDiseases: string[];
  otherChronicDisease: string;
  hospitalizations: string;
  allergies: string[];
  drugAllergies: string;
  foodAllergies: string;
  otherAllergies: string;
  familyHistory: string[];
  otherFamilyHistory: string;

  // Clinical Status (Baseline)
  subjectiveSymptoms: string;
  objectiveFindings: string;
  bpSystolic: number | '';
  bpDiastolic: number | '';
  hr: number | '';
  rr: number | '';
  temp: number | '';
  weight: number | '';
  height: number | '';
  medications: Medication[];
  treatments: string;
  immunizationStatus: string;

  // Social & Lifestyle
  livingSituation: string;
  otherLivingSituation: string;
  education: string;
  sourceOfIncome: string;
  physicalActivity: 'Yes' | 'No' | '';
  activityType: string;
  activityFreq: string;
  tobaccoUse: 'Never' | 'Former' | 'Current' | '';
  tobaccoType: string;
  tobaccoFreq: string;
  tobaccoInside: 'Yes' | 'No' | '';
  alcoholUse: string;
  alcoholType: string;
  substanceUse: string;
  substanceFreq: string;
  
  // Other Social
  difficultyMedicines: 'Yes' | 'No' | '';
  supportSystem: string;
  illnessAffectsWork: 'Yes' | 'No' | '';
  illnessEffectDetails: string;

  // Plan
  otherProblems: string;
  shortTermGoals: string;
  nursingInterventions: string;

  // Referral (Optional)
  referredTo: string[];
  otherReferredTo: string;
  referralReason: string;
  referralUrgency: string;
  referralDate: string;
  referralOutcome: string;

  // Monitoring
  progressNotes: ProgressNote[];
}

export const initialPatientData: PatientData = {
  id: '',
  lastUpdated: 0,
  patientId: '',
  familyCode: '',
  category: '',
  studentInCharge: '',
  initials: '',
  age: '',
  dob: '',
  gender: '',
  civilStatus: '',
  address: '',
  contactNumber: '',
  contactMethod: '',
  emergencyContact: '',
  emergencyRelation: '',
  emergencyNumber: '',
  primaryDiagnosis: '',
  secondaryDiagnosis: '',
  chronicDiseases: [],
  otherChronicDisease: '',
  hospitalizations: '',
  allergies: [],
  drugAllergies: '',
  foodAllergies: '',
  otherAllergies: '',
  familyHistory: [],
  otherFamilyHistory: '',
  subjectiveSymptoms: '',
  objectiveFindings: '',
  bpSystolic: '',
  bpDiastolic: '',
  hr: '',
  rr: '',
  temp: '',
  weight: '',
  height: '',
  medications: [],
  treatments: '',
  immunizationStatus: '',
  livingSituation: '',
  otherLivingSituation: '',
  education: '',
  sourceOfIncome: '',
  physicalActivity: '',
  activityType: '',
  activityFreq: '',
  tobaccoUse: '',
  tobaccoType: '',
  tobaccoFreq: '',
  tobaccoInside: '',
  alcoholUse: '',
  alcoholType: '',
  substanceUse: '',
  substanceFreq: '',
  difficultyMedicines: '',
  supportSystem: '',
  illnessAffectsWork: '',
  illnessEffectDetails: '',
  otherProblems: '',
  shortTermGoals: '',
  nursingInterventions: '',
  referredTo: [],
  otherReferredTo: '',
  referralReason: '',
  referralUrgency: '',
  referralDate: '',
  referralOutcome: '',
  progressNotes: []
};
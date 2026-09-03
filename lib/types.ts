// Domain types for the orthopedic clinic workflow.

export type DoctorRole = "Admin" | "Main Surgeon" | "Doctor" | "Nurse";

export interface AuthUser {
  id: number;
  email: string;
  role: DoctorRole;
  roles: DoctorRole[];
}

export type PatientStatus =
  | "draft"
  | "admitted"
  | "in-treatment"
  | "operated"
  | "discharged";

export type AdmissionSource = "ED" | "Clinic";

export type Gender = "male" | "female" | "other";

export interface Doctor {
  id: string;
  name: string;
  specialty: string;
  role: DoctorRole;
  roles: DoctorRole[];
}

export interface Patient {
  id: string;
  fullName: string;
  dateOfBirth: string;
  gender: Gender;
  address: string;
  phone: string;
  emergencyContact: string;
  admissionSource: AdmissionSource;
  admissionDateTime: string;
  reasonForAdmission: string;
  pastMedicalHistory: string;
  allergies: string;
  currentMedications: string;
  status: PatientStatus;
  isOperated: boolean;
  isDischarged: boolean;
}

export interface ProgressNote {
  id: string;
  doctorId: string;
  doctorName: string;
  date: string;
  time: string;
  content: string;
}

export interface Diagnosis {
  id: string;
  doctorId: string;
  doctorName: string;
  date: string;
  time: string;
  diagnosis: string;
  icdCode?: string;
}

export interface BloodTest {
  id: string;
  testName: string;
  value: string;
  referenceRange: string;
  date: string;
  unit: string;
}

export interface Procedure {
  id: string;
  doctorId: string;
  doctorName: string;
  date: string;
  time: string;
  procedureName: string;
  notes: string;
}

export interface Medication {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  route: string;
  startDate: string;
  endDate?: string;
  prescribedBy: string;
}

export interface Epicrisis {
  progressNotes: ProgressNote[];
  diagnoses: Diagnosis[];
  bloodTests: BloodTest[];
  procedures: Procedure[];
  medications: Medication[];
}

export type SurgeryRole =
  | "Main Surgeon"
  | "Assistant Surgeon"
  | "Anesthesiologist"
  | "Anesthesia Nurse";

export interface SurgeryTeamMember {
  doctorId: string;
  doctorName: string;
  role: SurgeryRole;
  canEdit: boolean;
}

export interface Surgery {
  date: string;
  time: string;
  surgeryType: string;
  intraoperativeNotes: string;
  team: SurgeryTeamMember[];
}

export interface DischargeReport {
  finalDiagnosis: string;
  therapyForHome: string;
  followUpInstructions: string;
  dischargeDate: string;
  dischargedBy: string;
}

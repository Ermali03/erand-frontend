import type { Doctor, Patient, Epicrisis, Surgery, DischargeReport } from "./types"

export const mockDoctors: Doctor[] = [
  { id: "DOC-001", name: "Dr. Sarah Chen", specialty: "Internal Medicine", role: "Admin" },
  { id: "DOC-002", name: "Dr. Michael Roberts", specialty: "General Surgery", role: "Main Surgeon" },
  { id: "DOC-003", name: "Dr. Emily Watson", specialty: "Cardiology", role: "Doctor" },
  { id: "DOC-004", name: "Dr. James Miller", specialty: "Anesthesiology", role: "Doctor" },
  { id: "DOC-005", name: "Nurse Patricia Davis", specialty: "Critical Care", role: "Nurse" },
  { id: "DOC-006", name: "Dr. David Kim", specialty: "Orthopedics", role: "Doctor" },
]

export const createEmptyPatient = (): Patient => ({
  id: "",
  fullName: "",
  dateOfBirth: "",
  gender: "male",
  address: "",
  phone: "",
  emergencyContact: "",
  admissionSource: "ED",
  admissionDateTime: new Date().toISOString().slice(0, 16),
  reasonForAdmission: "",
  pastMedicalHistory: "",
  allergies: "",
  currentMedications: "",
  status: "admitted",
  isOperated: false,
  isDischarged: false,
})

export const createEmptyEpicrisis = (): Epicrisis => ({
  progressNotes: [],
  diagnoses: [],
  bloodTests: [],
  procedures: [],
  medications: [],
})

export const createEmptySurgery = (): Surgery => ({
  date: "",
  time: "",
  surgeryType: "",
  intraoperativeNotes: "",
  team: [],
})

export const createEmptyDischargeReport = (): DischargeReport => ({
  finalDiagnosis: "",
  therapyForHome: "",
  followUpInstructions: "",
  dischargeDate: "",
  dischargedBy: "",
})

export const generatePatientId = (): string => {
  const timestamp = Date.now().toString(36).toUpperCase()
  const random = Math.random().toString(36).substring(2, 6).toUpperCase()
  return `PT-${timestamp}-${random}`
}

export const generateEntryId = (): string => {
  return `ENT-${Date.now().toString(36).toUpperCase()}`
}

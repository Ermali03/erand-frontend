"use client"

import { createContext, useContext, useState, useCallback, type ReactNode } from "react"
import type { Patient, Doctor, Epicrisis, Surgery, DischargeReport, DoctorRole } from "./types"
import {
  mockDoctors,
  createEmptyPatient,
  createEmptyEpicrisis,
  createEmptySurgery,
  createEmptyDischargeReport,
  generatePatientId,
} from "./mock-data"

interface ClinicContextType {
  // Patient state
  patient: Patient
  setPatient: (patient: Patient) => void
  updatePatient: (updates: Partial<Patient>) => void
  isPatientAdmitted: boolean
  confirmAdmission: () => void

  // Epicrisis state
  epicrisis: Epicrisis
  setEpicrisis: (epicrisis: Epicrisis) => void
  updateEpicrisis: (updates: Partial<Epicrisis>) => void

  // Surgery state
  surgery: Surgery
  setSurgery: (surgery: Surgery) => void
  updateSurgery: (updates: Partial<Surgery>) => void

  // Discharge state
  dischargeReport: DischargeReport
  setDischargeReport: (report: DischargeReport) => void
  updateDischargeReport: (updates: Partial<DischargeReport>) => void
  dischargePatient: () => void

  // Doctor state
  doctors: Doctor[]
  currentDoctor: Doctor
  setCurrentDoctor: (doctor: Doctor) => void

  // Navigation state
  canNavigateToEpicrisis: boolean
  canNavigateToSurgery: boolean
  canNavigateToDischarge: boolean

  // UI permissions
  hasPermission: (action: string) => boolean

  // Reset
  resetAll: () => void
}

const ClinicContext = createContext<ClinicContextType | undefined>(undefined)

export function ClinicProvider({ children }: { children: ReactNode }) {
  const [patient, setPatient] = useState<Patient>(createEmptyPatient())
  const [epicrisis, setEpicrisis] = useState<Epicrisis>(createEmptyEpicrisis())
  const [surgery, setSurgery] = useState<Surgery>(createEmptySurgery())
  const [dischargeReport, setDischargeReport] = useState<DischargeReport>(createEmptyDischargeReport())
  const [currentDoctor, setCurrentDoctor] = useState<Doctor>(mockDoctors[0])
  const [isPatientAdmitted, setIsPatientAdmitted] = useState(false)

  const updatePatient = useCallback((updates: Partial<Patient>) => {
    setPatient((prev) => ({ ...prev, ...updates }))
  }, [])

  const updateEpicrisis = useCallback((updates: Partial<Epicrisis>) => {
    setEpicrisis((prev) => ({ ...prev, ...updates }))
  }, [])

  const updateSurgery = useCallback((updates: Partial<Surgery>) => {
    setSurgery((prev) => ({ ...prev, ...updates }))
  }, [])

  const updateDischargeReport = useCallback((updates: Partial<DischargeReport>) => {
    setDischargeReport((prev) => ({ ...prev, ...updates }))
  }, [])

  const confirmAdmission = useCallback(() => {
    const newId = generatePatientId()
    setPatient((prev) => ({
      ...prev,
      id: newId,
      status: "admitted",
    }))
    setIsPatientAdmitted(true)
  }, [])

  const dischargePatient = useCallback(() => {
    setPatient((prev) => ({
      ...prev,
      status: "discharged",
      isDischarged: true,
    }))
    setDischargeReport((prev) => ({
      ...prev,
      dischargeDate: new Date().toISOString(),
      dischargedBy: currentDoctor.name,
    }))
  }, [currentDoctor.name])

  const hasPermission = useCallback(
    (action: string): boolean => {
      const role = currentDoctor.role
      const permissions: Record<DoctorRole, string[]> = {
        Admin: ["view", "edit", "surgery", "discharge", "manage-doctors"],
        "Main Surgeon": ["view", "edit", "surgery", "discharge"],
        Doctor: ["view", "edit", "discharge"],
        Nurse: ["view"],
      }
      return permissions[role]?.includes(action) ?? false
    },
    [currentDoctor.role],
  )

  const resetAll = useCallback(() => {
    setPatient(createEmptyPatient())
    setEpicrisis(createEmptyEpicrisis())
    setSurgery(createEmptySurgery())
    setDischargeReport(createEmptyDischargeReport())
    setIsPatientAdmitted(false)
  }, [])

  const canNavigateToEpicrisis = isPatientAdmitted
  const canNavigateToSurgery = isPatientAdmitted && patient.isOperated
  const canNavigateToDischarge = isPatientAdmitted

  return (
    <ClinicContext.Provider
      value={{
        patient,
        setPatient,
        updatePatient,
        isPatientAdmitted,
        confirmAdmission,
        epicrisis,
        setEpicrisis,
        updateEpicrisis,
        surgery,
        setSurgery,
        updateSurgery,
        dischargeReport,
        setDischargeReport,
        updateDischargeReport,
        dischargePatient,
        doctors: mockDoctors,
        currentDoctor,
        setCurrentDoctor,
        canNavigateToEpicrisis,
        canNavigateToSurgery,
        canNavigateToDischarge,
        hasPermission,
        resetAll,
      }}
    >
      {children}
    </ClinicContext.Provider>
  )
}

export function useClinic() {
  const context = useContext(ClinicContext)
  if (!context) {
    throw new Error("useClinic must be used within a ClinicProvider")
  }
  return context
}

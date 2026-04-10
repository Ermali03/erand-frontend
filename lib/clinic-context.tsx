"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  type ReactNode,
} from "react";
import { useRouter, usePathname } from "next/navigation";
import type {
  Patient,
  Doctor,
  Epicrisis,
  Surgery,
  DischargeReport,
  DoctorRole,
  AuthUser,
} from "./types";
import {
  mockDoctors,
  createEmptyPatient,
  createEmptyEpicrisis,
  createEmptySurgery,
  createEmptyDischargeReport,
  generatePatientId,
} from "./mock-data";
import { apiRequest } from "./api";

interface ClinicContextType {
  authUser: AuthUser | null;
  token: string | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  refreshDoctors: () => Promise<void>;
  patient: Patient;
  setPatient: (patient: Patient) => void;
  updatePatient: (updates: Partial<Patient>) => void;
  isPatientAdmitted: boolean;
  savePatientDraft: () => Promise<void>;
  confirmAdmission: () => Promise<void>;
  saveEpicrisisRecord: () => Promise<void>;
  saveSurgeryRecord: () => Promise<void>;
  saveDischargeRecord: () => Promise<void>;
  startNewPatient: () => void;
  loadPatientIntoWorkflow: (patientId: string) => Promise<void>;
  epicrisis: Epicrisis;
  setEpicrisis: (epicrisis: Epicrisis) => void;
  updateEpicrisis: (updates: Partial<Epicrisis>) => void;
  surgery: Surgery;
  setSurgery: (surgery: Surgery) => void;
  updateSurgery: (updates: Partial<Surgery>) => void;
  dischargeReport: DischargeReport;
  setDischargeReport: (report: DischargeReport) => void;
  updateDischargeReport: (updates: Partial<DischargeReport>) => void;
  dischargePatient: () => void;
  doctors: Doctor[];
  currentDoctor: Doctor;
  setCurrentDoctor: (doctor: Doctor) => void;
  canNavigateToEpicrisis: boolean;
  canNavigateToSurgery: boolean;
  canNavigateToDischarge: boolean;
  hasPermission: (action: string) => boolean;
  resetAll: () => void;
}

interface LoginResponse {
  access_token: string;
  token_type: string;
  role: DoctorRole;
  roles: DoctorRole[];
  email: string;
}

interface PatientRecordResponse {
  id: string;
  full_name: string;
  date_of_birth: string | null;
  gender?: string | null;
  address?: string | null;
  phone?: string | null;
  emergency_contact?: string | null;
  admission_source?: string | null;
  admission_datetime?: string | null;
  reason_for_admission?: string | null;
  past_medical_history?: string | null;
  allergies?: string | null;
  current_medications?: string | null;
  status: Patient["status"];
  is_operated: boolean;
}

interface PatientFullResponse extends PatientRecordResponse {
  anamnesis: {
    chief_complaint: string;
    medical_history: string;
  } | null;
  epicrisis: {
    diagnosis: string;
    treatment_plan: string;
    structured_data?: string | null;
  } | null;
  surgery: {
    procedure_name: string;
    date: string;
    notes: string;
    surgeon_id: string;
    structured_data?: string | null;
  } | null;
  discharge_report: {
    discharge_date: string;
    instructions: string;
    structured_data?: string | null;
  } | null;
}

const ClinicContext = createContext<ClinicContextType | undefined>(undefined);
const PUBLIC_ROUTES = new Set(["/login", "/register"]);

function parseStructuredData<T>(value: string | null | undefined, fallback: T): T {
  if (!value) return fallback;

  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

function normalizePatientStatus(status: string | null | undefined): Patient["status"] {
  if (
    status === "draft" ||
    status === "admitted" ||
    status === "in-treatment" ||
    status === "operated" ||
    status === "discharged"
  ) {
    return status;
  }

  return "draft";
}

function normalizePatientRecord(record: PatientRecordResponse): Patient {
  const emptyPatient = createEmptyPatient();
  const status = normalizePatientStatus(record.status);
  const admissionSource =
    record.admission_source === "Clinic" ? "Clinic" : "ED";

  return {
    ...emptyPatient,
    id: record.id,
    fullName: record.full_name ?? "",
    dateOfBirth: record.date_of_birth ?? "",
    gender:
      record.gender === "female" ||
      record.gender === "other" ||
      record.gender === "male"
        ? record.gender
        : emptyPatient.gender,
    address: record.address ?? "",
    phone: record.phone ?? "",
    emergencyContact: record.emergency_contact ?? "",
    admissionSource,
    admissionDateTime: record.admission_datetime ?? emptyPatient.admissionDateTime,
    reasonForAdmission: record.reason_for_admission ?? "",
    pastMedicalHistory: record.past_medical_history ?? "",
    allergies: record.allergies ?? "",
    currentMedications: record.current_medications ?? "",
    status,
    isOperated: record.is_operated,
    isDischarged: status === "discharged",
  };
}

export function ClinicProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();

  const [authUser, setAuthUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [patient, setPatient] = useState<Patient>(createEmptyPatient());
  const [epicrisis, setEpicrisis] = useState<Epicrisis>(createEmptyEpicrisis());
  const [surgery, setSurgery] = useState<Surgery>(createEmptySurgery());
  const [dischargeReport, setDischargeReport] = useState<DischargeReport>(
    createEmptyDischargeReport(),
  );
  const [doctors, setDoctors] = useState<Doctor[]>(mockDoctors);
  const [currentDoctor, setCurrentDoctor] = useState<Doctor>(mockDoctors[0]);
  const [isPatientAdmitted, setIsPatientAdmitted] = useState(false);

  const logout = useCallback(() => {
    setToken(null);
    setAuthUser(null);
    localStorage.removeItem("token");
    router.replace("/login");
  }, [router]);

  const fetchCurrentUser = useCallback(
    async (authToken: string) => {
      const data = await apiRequest<AuthUser>("/users/me", {
        token: authToken,
      });
      setAuthUser(data);
      return data;
    },
    [],
  );

  const loadDoctors = useCallback(async (authToken: string) => {
    try {
      const data = await apiRequest<Doctor[]>("/doctors", {
        token: authToken,
      });

      if (data.length > 0) {
        const normalizedDoctors = data.map((doctor) => ({
          ...doctor,
          specialty: doctor.specialty || "General Medicine",
          roles: doctor.roles?.length ? doctor.roles : [doctor.role],
        }));
        setDoctors(normalizedDoctors);
        setCurrentDoctor((current) => {
          const matchingDoctor = normalizedDoctors.find(
            (doctor) => doctor.id === current.id,
          );
          return matchingDoctor ?? normalizedDoctors[0];
        });
        return;
      }
    } catch {
      // Fall back to mock data if the API is unavailable during early setup.
    }

    setDoctors(mockDoctors);
    setCurrentDoctor(mockDoctors[0]);
  }, []);

  useEffect(() => {
    const savedToken = localStorage.getItem("token");
    if (savedToken) {
      setToken(savedToken);
    }
  }, []);

  useEffect(() => {
    if (!token) return;
    fetchCurrentUser(token).catch(() => logout());
  }, [token, fetchCurrentUser, logout]);

  useEffect(() => {
    if (!token) return;
    void loadDoctors(token);
  }, [loadDoctors, token]);

  useEffect(() => {
    if (token !== null) return;
    const savedToken = localStorage.getItem("token");
    if (!savedToken && !PUBLIC_ROUTES.has(pathname)) {
      router.replace("/login");
    }
  }, [token, pathname, router]);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const formData = new URLSearchParams();
      formData.append("username", email);
      formData.append("password", password);

      const data = await apiRequest<LoginResponse>("/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: formData.toString(),
      });
      setToken(data.access_token);
      localStorage.setItem("token", data.access_token);
      await fetchCurrentUser(data.access_token);
      return true;
    } catch {
      return false;
    }
  };

  const refreshDoctors = useCallback(async () => {
    if (!token) return;
    await loadDoctors(token);
  }, [loadDoctors, token]);

  const updatePatient = useCallback((updates: Partial<Patient>) => {
    setPatient((prev) => ({ ...prev, ...updates }));
  }, []);

  const updateEpicrisis = useCallback((updates: Partial<Epicrisis>) => {
    setEpicrisis((prev) => ({ ...prev, ...updates }));
  }, []);

  const updateSurgery = useCallback((updates: Partial<Surgery>) => {
    setSurgery((prev) => ({ ...prev, ...updates }));
  }, []);

  const updateDischargeReport = useCallback(
    (updates: Partial<DischargeReport>) => {
      setDischargeReport((prev) => ({ ...prev, ...updates }));
    },
    [],
  );

  const persistPatient = useCallback(
    async (status: Patient["status"]) => {
      if (!token) {
        throw new Error("You must be logged in to save a patient.");
      }

      const patientPayload = {
        full_name: patient.fullName.trim() || "Draft Patient",
        date_of_birth: patient.dateOfBirth || null,
        gender: patient.gender,
        address: patient.address || null,
        phone: patient.phone || null,
        emergency_contact: patient.emergencyContact || null,
        admission_source: patient.admissionSource,
        admission_datetime: patient.admissionDateTime || null,
        reason_for_admission: patient.reasonForAdmission || null,
        past_medical_history: patient.pastMedicalHistory || null,
        allergies: patient.allergies || null,
        current_medications: patient.currentMedications || null,
        status,
        is_operated: patient.isOperated,
      };

      const savedPatient = patient.id
        ? await apiRequest<PatientRecordResponse>(`/patients/${patient.id}`, {
            method: "PUT",
            token,
            body: patientPayload,
          })
        : await apiRequest<PatientRecordResponse>("/patients", {
            method: "POST",
            token,
            body: {
              id: generatePatientId(),
              ...patientPayload,
            },
          });

      await apiRequest(`/anamnesis/${savedPatient.id}`, {
        method: "PUT",
        token,
        body: {
          chief_complaint: patient.reasonForAdmission || "",
          medical_history: patient.pastMedicalHistory || "",
        },
      });

      const normalizedPatient = normalizePatientRecord(savedPatient);
      setPatient(normalizedPatient);
      setIsPatientAdmitted(normalizedPatient.status !== "draft");

      return normalizedPatient;
    },
    [patient, token],
  );

  const savePatientDraft = useCallback(async () => {
    await persistPatient("draft");
  }, [persistPatient]);

  const confirmAdmission = useCallback(async () => {
    const nextStatus =
      patient.status === "discharged" ? "discharged" : "admitted";
    await persistPatient(nextStatus);
  }, [patient.status, persistPatient]);

  const saveEpicrisisRecord = useCallback(async () => {
    if (!token || !patient.id) return;

    await apiRequest(`/epicrisis/${patient.id}`, {
      method: "PUT",
      token,
      body: {
        diagnosis:
          epicrisis.diagnoses.map((entry) => entry.diagnosis).join("; ") ||
          patient.reasonForAdmission ||
          "Not specified",
        treatment_plan:
          epicrisis.medications
            .map((entry) => `${entry.name} ${entry.dosage} ${entry.frequency}`)
            .join("; ") || "Not specified",
        structured_data: JSON.stringify(epicrisis),
      },
    });
  }, [epicrisis, patient.id, patient.reasonForAdmission, token]);

  const saveSurgeryRecord = useCallback(async () => {
    if (!token || !patient.id || !patient.isOperated) return;

    const mainSurgeon = surgery.team.find((member) => member.role === "Main Surgeon");

    await apiRequest(`/surgery/${patient.id}`, {
      method: "PUT",
      token,
      body: {
        patient_id: patient.id,
        surgeon_id: mainSurgeon?.doctorId || currentDoctor.id,
        procedure_name: surgery.surgeryType || "Not specified",
        date: surgery.date || new Date().toISOString().slice(0, 10),
        notes: surgery.intraoperativeNotes || "",
        structured_data: JSON.stringify(surgery),
      },
    });
  }, [currentDoctor.id, patient.id, patient.isOperated, surgery, token]);

  const saveDischargeRecord = useCallback(async () => {
    if (!token || !patient.id) return;

    const instructions = [
      `Diagnoza finale: ${dischargeReport.finalDiagnosis}`,
      "",
      "Terapia:",
      dischargeReport.therapyForHome,
      "",
      "Udhezimet:",
      dischargeReport.followUpInstructions,
    ].join("\n");

    await apiRequest(`/discharge/${patient.id}`, {
      method: "PUT",
      token,
      body: {
        discharge_date: dischargeReport.dischargeDate || new Date().toISOString(),
        instructions,
        structured_data: JSON.stringify(dischargeReport),
      },
    });
  }, [dischargeReport, patient.id, token]);

  const startNewPatient = useCallback(() => {
    setPatient(createEmptyPatient());
    setEpicrisis(createEmptyEpicrisis());
    setSurgery(createEmptySurgery());
    setDischargeReport(createEmptyDischargeReport());
    setIsPatientAdmitted(false);
  }, []);

  const loadPatientIntoWorkflow = useCallback(
    async (patientId: string) => {
      if (!token) return;

      const fullPatient = await apiRequest<PatientFullResponse>(
        `/patients/${patientId}/full`,
        { token },
      );
      const normalizedPatient = normalizePatientRecord({
        ...fullPatient,
        reason_for_admission:
          fullPatient.reason_for_admission ??
          fullPatient.anamnesis?.chief_complaint ??
          null,
        past_medical_history:
          fullPatient.past_medical_history ??
          fullPatient.anamnesis?.medical_history ??
          null,
      });

      setPatient(normalizedPatient);
      setEpicrisis(
        parseStructuredData(
          fullPatient.epicrisis?.structured_data,
          fullPatient.epicrisis
            ? {
                ...createEmptyEpicrisis(),
                diagnoses: fullPatient.epicrisis.diagnosis
                  ? [
                      {
                        id: `diag-${patientId}`,
                        doctorId: "",
                        doctorName: "",
                        date: "",
                        time: "",
                        diagnosis: fullPatient.epicrisis.diagnosis,
                      },
                    ]
                  : [],
              }
            : createEmptyEpicrisis(),
        ),
      );
      setSurgery(
        parseStructuredData(
          fullPatient.surgery?.structured_data,
          fullPatient.surgery
            ? {
                ...createEmptySurgery(),
                date: fullPatient.surgery.date || "",
                surgeryType: fullPatient.surgery.procedure_name || "",
                intraoperativeNotes: fullPatient.surgery.notes || "",
              }
            : createEmptySurgery(),
        ),
      );
      setDischargeReport(
        parseStructuredData(
          fullPatient.discharge_report?.structured_data,
          fullPatient.discharge_report
            ? {
                ...createEmptyDischargeReport(),
                dischargeDate: fullPatient.discharge_report.discharge_date || "",
              }
            : createEmptyDischargeReport(),
        ),
      );
      setIsPatientAdmitted(normalizedPatient.status !== "draft");
    },
    [token],
  );

  const dischargePatient = useCallback(() => {
    setPatient((prev) => ({
      ...prev,
      status: "discharged",
      isDischarged: true,
    }));
    setDischargeReport((prev) => ({
      ...prev,
      dischargeDate: new Date().toISOString(),
      dischargedBy: currentDoctor.name,
    }));
  }, [currentDoctor.name]);

  const hasPermission = useCallback(
    (action: string): boolean => {
      const role = authUser?.role;
      if (!role) return false;
      const permissions: Record<DoctorRole, string[]> = {
        Admin: ["view", "edit", "surgery", "discharge", "manage-doctors"],
        "Main Surgeon": ["view", "edit", "surgery", "discharge"],
        Doctor: ["view", "edit", "discharge"],
        Nurse: ["view"],
      };
      const roles = authUser?.roles?.length ? authUser.roles : role ? [role] : [];
      return roles.some((userRole) => permissions[userRole]?.includes(action));
    },
    [authUser],
  );

  const resetAll = useCallback(() => {
    setPatient(createEmptyPatient());
    setEpicrisis(createEmptyEpicrisis());
    setSurgery(createEmptySurgery());
    setDischargeReport(createEmptyDischargeReport());
    setIsPatientAdmitted(false);
  }, []);

  const canNavigateToEpicrisis = isPatientAdmitted;
  const canNavigateToSurgery = isPatientAdmitted && patient.isOperated;
  const canNavigateToDischarge = isPatientAdmitted;

  return (
    <ClinicContext.Provider
      value={{
        authUser,
        token,
        login,
        logout,
        refreshDoctors,
        patient,
        setPatient,
        updatePatient,
        isPatientAdmitted,
        savePatientDraft,
        confirmAdmission,
        saveEpicrisisRecord,
        saveSurgeryRecord,
        saveDischargeRecord,
        startNewPatient,
        loadPatientIntoWorkflow,
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
        doctors,
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
  );
}

export function useClinic() {
  const context = useContext(ClinicContext);
  if (!context) {
    throw new Error("useClinic must be used within a ClinicProvider");
  }
  return context;
}

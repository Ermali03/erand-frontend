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
  confirmAdmission: () => void;
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

const ClinicContext = createContext<ClinicContextType | undefined>(undefined);
const PUBLIC_ROUTES = new Set(["/login", "/register"]);

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

  const confirmAdmission = useCallback(() => {
    if (!token) return;
    const newId = generatePatientId();
    void apiRequest<{ id: string; status: Patient["status"] }>("/patients", {
      method: "POST",
      token,
      body: {
        id: newId,
        full_name: patient.fullName || "Unknown",
        date_of_birth: patient.dateOfBirth || null,
        status: "admitted",
        is_operated: false,
      },
    })
      .then((data: { id: string; status: Patient["status"] }) => {
        setPatient((prev) => ({
          ...prev,
          id: data.id,
          status: data.status,
        }));
        setIsPatientAdmitted(true);
      })
      .catch(() => undefined);
  }, [patient, token]);

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

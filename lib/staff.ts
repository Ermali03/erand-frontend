import type { DoctorRole } from "./types";

export interface StaffUser {
  id: number;
  email: string;
  role: DoctorRole;
  roles: DoctorRole[];
  doctor_id: string | null;
  name: string | null;
  specialty: string | null;
}

export interface StaffAccountResponse {
  user_id: number;
  doctor_id: string;
  name: string;
  specialty: string;
  email: string;
  role: DoctorRole;
  roles: DoctorRole[];
}

export interface StaffFormState {
  name: string;
  specialty: string;
  email: string;
  password: string;
  roles: DoctorRole[];
}

export const ROLE_OPTIONS: DoctorRole[] = [
  "Admin",
  "Main Surgeon",
  "Doctor",
  "Nurse",
];

export const ROLE_LABELS: Record<DoctorRole, string> = {
  Admin: "Admin",
  "Main Surgeon": "Kirurgu kryesor",
  Doctor: "Mjek",
  Nurse: "Infermier/e",
};

export const EMPTY_STAFF_FORM: StaffFormState = {
  name: "",
  specialty: "",
  email: "",
  password: "",
  roles: ["Doctor"],
};

export function toggleRoleInList(
  roles: DoctorRole[],
  role: DoctorRole,
): DoctorRole[] {
  return roles.includes(role)
    ? roles.filter((item) => item !== role)
    : [...roles, role];
}

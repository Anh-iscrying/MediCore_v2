import { apiFetch } from "@/lib/api"

export type UserRole = "ADMIN" | "DOCTOR" | "PATIENT"

export type AuthUser = {
  token?: string | null
  role: UserRole
  email: string
  name: string
  doctorId?: number | null
  doctorCode?: string | null
  patientId?: number | null
  patientCode?: string | null
}

export type LoginInput = {
  email: string
  password: string
}

export type RegisterPatientInput = LoginInput & {
  name: string
}

export function login(input: LoginInput) {
  return apiFetch<AuthUser>("/auth/login", {
    method: "POST",
    body: JSON.stringify({
      email: input.email.trim(),
      password: input.password.trim(),
    }),
  })
}

export function registerPatient(input: RegisterPatientInput) {
  return apiFetch<AuthUser>("/auth/register", {
    method: "POST",
    body: JSON.stringify({
      email: input.email.trim(),
      password: input.password.trim(),
      name: input.name.trim(),
      role: "PATIENT",
    }),
  })
}

export function getMe() {
  return apiFetch<AuthUser>("/auth/me")
}

export function logout() {
  return apiFetch<void>("/auth/logout", {
    method: "POST",
  })
}

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
  signupVerificationToken: string
}

export type OtpVerifyResponse = {
  verificationToken?: string | null
  resetToken?: string | null
  expiresAt: string
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
      signupVerificationToken: input.signupVerificationToken,
    }),
  })
}

export function requestSignupOtp(email: string) {
  return apiFetch<void>("/auth/patient/signup/request-otp", {
    method: "POST",
    body: JSON.stringify({ email: email.trim() }),
  })
}

export function verifySignupOtp(email: string, otp: string) {
  return apiFetch<OtpVerifyResponse>("/auth/patient/signup/verify-otp", {
    method: "POST",
    body: JSON.stringify({ email: email.trim(), otp }),
  })
}

export function requestPasswordResetOtp(email: string) {
  return apiFetch<void>("/auth/patient/password-reset/request-otp", {
    method: "POST",
    body: JSON.stringify({ email: email.trim() }),
  })
}

export function verifyPasswordResetOtp(email: string, otp: string) {
  return apiFetch<OtpVerifyResponse>("/auth/patient/password-reset/verify-otp", {
    method: "POST",
    body: JSON.stringify({ email: email.trim(), otp }),
  })
}

export function resetPassword(email: string, resetToken: string, newPassword: string) {
  return apiFetch<void>("/auth/patient/password-reset/reset", {
    method: "POST",
    body: JSON.stringify({ email: email.trim(), resetToken, newPassword }),
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

"use client"

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react"
import { ApiError } from "@/lib/api"
import * as authApi from "@/lib/auth"
import { clearMyMedicalRecordsCache } from "@/lib/medical-records"
import type { AuthUser, LoginInput, RegisterPatientInput } from "@/lib/auth"

type AuthContextValue = {
  user: AuthUser | null
  isLoading: boolean
  login: (input: LoginInput) => Promise<AuthUser>
  register: (input: RegisterPatientInput) => Promise<AuthUser>
  logout: () => Promise<void>
  refreshUser: () => Promise<AuthUser | null>
}

const AuthContext = createContext<AuthContextValue | null>(null)

const isPatient = (user: AuthUser | null): user is AuthUser => user?.role === "PATIENT"

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const clearSession = useCallback(async () => {
    try {
      await authApi.logout()
    } finally {
      clearMyMedicalRecordsCache()
      setUser(null)
    }
  }, [])

  const refreshUser = useCallback(async () => {
    try {
      const currentUser = await authApi.getMe()
      if (!isPatient(currentUser)) {
        await clearSession()
        return null
      }

      setUser((previousUser) => {
        if (previousUser && previousUser.email !== currentUser.email) {
          clearMyMedicalRecordsCache()
        }
        return currentUser
      })
      return currentUser
    } catch (error) {
      if (error instanceof ApiError && (error.status === 401 || error.status === 403)) {
        clearMyMedicalRecordsCache()
        setUser(null)
        return null
      }
      clearMyMedicalRecordsCache()
      setUser(null)
      return null
    }
  }, [clearSession])

  useEffect(() => {
    void refreshUser().finally(() => setIsLoading(false))
  }, [refreshUser])

  const value = useMemo<AuthContextValue>(() => ({
    user,
    isLoading,
    login: async (input) => {
      const loggedInUser = await authApi.login(input)
      if (!isPatient(loggedInUser)) {
        await clearSession()
        throw new Error("Tài khoản này không có quyền truy cập cổng bệnh nhân")
      }

      if (!user || user.email !== loggedInUser.email) {
        clearMyMedicalRecordsCache()
      }
      setUser(loggedInUser)
      return loggedInUser
    },
    register: async (input) => {
      const registeredUser = await authApi.registerPatient(input)
      if (!isPatient(registeredUser)) {
        await clearSession()
        throw new Error("Tài khoản này không có quyền truy cập cổng bệnh nhân")
      }

      if (!user || user.email !== registeredUser.email) {
        clearMyMedicalRecordsCache()
      }
      setUser(registeredUser)
      return registeredUser
    },
    logout: clearSession,
    refreshUser,
  }), [user, isLoading, clearSession, refreshUser])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider")
  }
  return context
}

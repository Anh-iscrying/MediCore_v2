"use client"

import { createContext, useContext, useEffect, useMemo, useState } from "react"
import { ApiError } from "@/lib/api"
import * as authApi from "@/lib/auth"
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

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const refreshUser = async () => {
    try {
      const currentUser = await authApi.getMe()
      setUser(currentUser)
      return currentUser
    } catch (error) {
      if (error instanceof ApiError && (error.status === 401 || error.status === 403)) {
        setUser(null)
        return null
      }
      setUser(null)
      return null
    }
  }

  useEffect(() => {
    void refreshUser().finally(() => setIsLoading(false))
  }, [])

  const value = useMemo<AuthContextValue>(() => ({
    user,
    isLoading,
    login: async (input) => {
      const loggedInUser = await authApi.login(input)
      setUser(loggedInUser)
      return loggedInUser
    },
    register: async (input) => {
      const registeredUser = await authApi.registerPatient(input)
      setUser(registeredUser)
      return registeredUser
    },
    logout: async () => {
      try {
        await authApi.logout()
      } finally {
        setUser(null)
      }
    },
    refreshUser,
  }), [user, isLoading])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider")
  }
  return context
}

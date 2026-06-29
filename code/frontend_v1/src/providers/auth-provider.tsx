"use client"

import React, { createContext, useContext, useState, useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import { authApi } from "@/lib/api"

interface User {
  email: string
  role: string
  name: string
  doctorId?: number
  doctorCode?: string
}

interface AuthContextType {
  user: User | null
  token: string | null
  loading: boolean
  login: (email: string, password: String) => Promise<void>
  register: (data: any) => Promise<void>
  logout: () => void
  updateUser: (patch: Partial<User>) => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const pathname = usePathname()

  // 1. Tải trạng thái đăng nhập từ localStorage khi khởi chạy
  useEffect(() => {
    try {
      const storedToken = localStorage.getItem("token")
      const storedUser = localStorage.getItem("user")

      if (storedToken && storedUser) {
        setToken(storedToken)
        setUser(JSON.parse(storedUser))
      }
    } catch (e) {
      console.error("Lỗi khi tải thông tin xác thực:", e)
      localStorage.removeItem("token")
      localStorage.removeItem("user")
    } finally {
      setLoading(false)
    }
  }, [])

  // 2. Bảo vệ định tuyến và phân quyền
  useEffect(() => {
    if (loading) return

    const isAuthRoute = pathname === "/login" || pathname === "/register"
    const isAdminRoute =
      pathname === "/" ||
      pathname.startsWith("/doctors") ||
      pathname.startsWith("/specialties") ||
      pathname.startsWith("/medicines") ||
      pathname.startsWith("/icd") ||
      pathname.startsWith("/schedule") ||
      pathname.startsWith("/treatment-templates") ||
      pathname.startsWith("/admin")
      
    const isDoctorRoute = pathname.startsWith("/doctor")

    // Chưa đăng nhập: Chỉ cho phép ở các trang login/register, ngược lại chuyển hướng về login
    if (!token || !user) {
      if (!isAuthRoute) {
        router.push("/login")
      }
      return
    }

    // Đã đăng nhập: Chặn các trang login/register
    if (isAuthRoute) {
      if (user.role === "ADMIN") {
        router.push("/")
      } else if (user.role === "DOCTOR") {
        router.push("/doctor/waiting-patients")
      }
      return
    }

    // Bác sĩ cố tình truy cập vào các tuyến của Admin: Chuyển hướng sang danh sách bệnh nhân chờ
    if (user.role === "DOCTOR" && isAdminRoute) {
      router.push("/doctor/waiting-patients")
      return
    }

    // Admin cố tình truy cập các tuyến của Bác sĩ: Chuyển hướng về Dashboard Admin
    if (user.role === "ADMIN" && isDoctorRoute) {
      router.push("/")
      return
    }
  }, [user, token, loading, pathname, router])

  const login = async (email: string, password: String) => {
    setLoading(true)
    try {
      const data = await authApi.login({ email, password })
      
      localStorage.setItem("token", data.token)
      const userInfo: User = {
        email: data.email,
        role: data.role,
        name: data.name,
        doctorId: data.doctorId,
        doctorCode: data.doctorCode,
      }
      localStorage.setItem("user", JSON.stringify(userInfo))
      
      setToken(data.token)
      setUser(userInfo)

      if (userInfo.role === "ADMIN") {
        router.push("/")
      } else {
        router.push("/doctor/waiting-patients")
      }
    } catch (error) {
      throw error;
    } finally {
      setLoading(false)
    }
  }

  const register = async (registerData: any) => {
    setLoading(true)
    try {
      const data = await authApi.register(registerData)
      
      localStorage.setItem("token", data.token)
      const userInfo: User = {
        email: data.email,
        role: data.role,
        name: data.name,
        doctorId: data.doctorId,
        doctorCode: data.doctorCode,
      }
      localStorage.setItem("user", JSON.stringify(userInfo))
      
      setToken(data.token)
      setUser(userInfo)

      router.push("/doctor/waiting-patients")
    } catch (error) {
      throw error;
    } finally {
      setLoading(false)
    }
  }

  const logout = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("user")
    setToken(null)
    setUser(null)
    router.push("/login")
  }

  const updateUser = (patch: Partial<User>) => {
    setUser((currentUser) => {
      if (!currentUser) return currentUser

      const nextUser = { ...currentUser, ...patch }
      localStorage.setItem("user", JSON.stringify(nextUser))
      return nextUser
    })
  }

  // Trong khi tải ban đầu hoặc kiểm tra route chuyển tiếp, chặn render giao diện nhạy cảm
  const isAuthRoute = pathname === "/login" || pathname === "/register"
  const showContent = !loading && (isAuthRoute || (token && user))

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, updateUser }}>
      {showContent ? children : (
        <div className="flex h-screen w-screen items-center justify-center bg-background">
          <div className="flex flex-col items-center gap-4">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            <p className="text-sm text-muted-foreground animate-pulse">Đang tải MediCore...</p>
          </div>
        </div>
      )}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth phải được sử dụng bên trong AuthProvider")
  }
  return context
}

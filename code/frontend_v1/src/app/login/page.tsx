"use client"

import React, { useState, useEffect } from "react"
import { useAuth } from "@/providers/auth-provider"
import { Button } from "@/components/base/ui/button"
import { Input } from "@/components/base/ui/input"
import { Label } from "@/components/base/ui/label"
import { Alert, AlertDescription } from "@/components/base/ui/alert"
import { useToast } from "@/hooks/use-toast"
import { 
  Stethoscope, 
  Key, 
  Mail, 
  ShieldAlert, 
  Activity,
  Users,
  ChevronRight
} from "lucide-react"

export default function LoginPage() {
  const { login } = useAuth()
  const { toast } = useToast()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search)
      const errorParam = params.get("error")
      if (errorParam) {
        let msg = "Yêu cầu xác thực không hợp lệ."
        let toastTitle = "Lỗi xác thực"
        if (errorParam === "required") {
          msg = "Vui lòng đăng nhập để truy cập trang quản trị / bác sĩ."
          toastTitle = "Yêu cầu đăng nhập"
        } else if (errorParam === "forbidden") {
          msg = "Tài khoản của bạn không có quyền truy cập hệ thống Quản trị / Bác sĩ."
          toastTitle = "Truy cập bị từ chối"
        } else if (errorParam === "session_expired") {
          msg = "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại."
          toastTitle = "Phiên đăng nhập hết hạn"
        }
        
        setError(msg)
        toast({
          title: toastTitle,
          description: msg,
          variant: "destructive",
        })

        // Dọn dẹp tham số URL
        const newUrl = window.location.pathname
        window.history.replaceState({}, document.title, newUrl)
      }
    }
  }, [toast])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      await login(email, password)
    } catch (err: any) {
      const isPermissionError = err.message?.includes("quyền truy cập")
      const msg = isPermissionError 
        ? err.message 
        : "Email hoặc mật khẩu không hợp lệ"
      setError(msg)
      toast({
        title: "Đăng nhập thất bại",
        description: msg,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }



  return (
    <div className="flex min-h-screen w-full bg-background overflow-hidden font-sans">
      
      {/* LEFT SIDE: Form Đăng nhập */}
      <div className="flex w-full flex-col justify-between p-8 lg:w-[45%] xl:w-[40%] bg-white dark:bg-slate-900 border-r border-border/40 z-10">
        
        {/* Header Logo */}
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/25">
            <span className="relative flex items-center justify-center">
              <span className="absolute w-4.5 h-1.5 bg-primary-foreground rounded-full" />
              <span className="absolute w-1.5 h-4.5 bg-primary-foreground rounded-full" />
            </span>
          </div>
          <div className="flex flex-col leading-tight">
            <span className="text-xl font-bold tracking-tight text-foreground">MediCore</span>
            <span className="text-[10px] uppercase font-bold tracking-wider text-primary">EMR Portal</span>
          </div>
        </div>

        {/* Form Container */}
        <div className="my-auto py-12 max-w-sm w-full mx-auto space-y-7 animate-slide-in-up">
          <div className="space-y-2">
            <h2 className="text-3xl font-extrabold tracking-tight text-foreground">Chào mừng trở lại</h2>
            <p className="text-sm text-muted-foreground">
              Vui lòng đăng nhập để truy cập hồ sơ bệnh án và lịch làm việc.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <Alert variant="destructive" className="border-red-200 bg-red-50 text-red-800 dark:border-red-900/50 dark:bg-red-950/20 dark:text-red-400">
                <ShieldAlert className="h-4 w-4" />
                <AlertDescription className="text-xs font-medium">{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Email đăng nhập</Label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3 w-4 h-4 text-muted-foreground/80" />
                <Input
                  id="email"
                  type="email"
                  placeholder="name@medicore.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 h-11 rounded-xl border-slate-200 focus-visible:ring-primary focus-visible:border-primary dark:border-slate-800 dark:bg-slate-900"
                  required
                  disabled={loading}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <Label htmlFor="password" className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Mật khẩu</Label>
              </div>
              <div className="relative">
                <Key className="absolute left-3.5 top-3 w-4 h-4 text-muted-foreground/80" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 h-11 rounded-xl border-slate-200 focus-visible:ring-primary focus-visible:border-primary dark:border-slate-800 dark:bg-slate-900"
                  required
                  disabled={loading}
                />
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full h-11 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-lg shadow-primary/20 transition-all gap-2"
              disabled={loading}
            >
              {loading ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  <span>Xác thực tài khoản...</span>
                </>
              ) : (
                <>
                  <span>Đăng nhập hệ thống</span>
                  <ChevronRight className="w-4 h-4" />
                </>
              )}
            </Button>
          </form>


        </div>

        {/* Footer info */}
        <div className="text-center text-[11px] text-muted-foreground/80">
          MediCore EMR © {new Date().getFullYear()} • Hệ thống bảo mật thông tin chuẩn HIPAA
        </div>
      </div>

      {/* RIGHT SIDE: Visual Showcase (Premium Panel) */}
      <div className="hidden lg:flex flex-1 relative bg-gradient-to-br from-primary via-emerald-800 to-slate-950 items-center justify-center p-12 overflow-hidden">
        
        {/* Abstract glowing patterns */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-[20%] right-[10%] h-[500px] w-[500px] rounded-full bg-emerald-400/10 blur-[130px] animate-float" />
          <div className="absolute bottom-[10%] left-[20%] h-[400px] w-[400px] rounded-full bg-teal-400/15 blur-[100px]" />
          
          {/* Subtle grid background */}
          <div className="absolute inset-0 opacity-[0.03] bg-[linear-gradient(to_right,#808080_1px,transparent_1px),linear-gradient(to_bottom,#808080_1px,transparent_1px)] bg-[size:24px_24px]" />
        </div>

        <div className="max-w-xl space-y-10 text-white z-10">
          
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-semibold uppercase tracking-wider text-emerald-250">
              <Activity className="w-3.5 h-3.5 animate-pulse text-emerald-400" />
              MediCore Clinical System
            </div>
            <h1 className="text-4xl xl:text-5xl font-extrabold tracking-tight leading-tight">
              Quản lý bệnh án điện tử và điều phối thông minh.
            </h1>
            <p className="text-emerald-100/90 text-base leading-relaxed">
              Giải pháp tích hợp công nghệ AI hỗ trợ chuẩn đoán, tối ưu hóa lịch trực, quản lý danh mục thuốc và tự động hóa hồ sơ bệnh án toàn diện.
            </p>
          </div>

          {/* Interactive Mock Dashboard Preview */}
          <div className="relative p-6 rounded-2xl bg-slate-900/80 border border-white/10 shadow-2xl backdrop-blur-md space-y-4 animate-float">
            
            {/* Window control dots */}
            <div className="flex items-center gap-1.5 pb-2 border-b border-white/5">
              <div className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
              <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/80" />
              <div className="w-2.5 h-2.5 rounded-full bg-green-500/80" />
              <span className="text-[10px] text-white/40 ml-2 font-mono">dashboard_live_preview.exe</span>
            </div>

            {/* Simulated UI Cards */}
            <div className="grid grid-cols-2 gap-4">
              
              <div className="p-3.5 rounded-xl bg-white/5 border border-white/5 space-y-2">
                <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wide">Bệnh nhân hôm nay</span>
                <div className="flex items-baseline justify-between">
                  <span className="text-2xl font-extrabold">142</span>
                  <span className="text-xs text-emerald-400 font-bold">+18%</span>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-white/5 border border-white/5 space-y-2">
                <span className="text-[10px] font-bold text-teal-400 uppercase tracking-wide">Thời gian chờ TB</span>
                <div className="flex items-baseline justify-between">
                  <span className="text-2xl font-extrabold">8.5m</span>
                  <span className="text-xs text-emerald-400 font-bold">-12%</span>
                </div>
              </div>

            </div>

            {/* Patient Waitlist simulated bar */}
            <div className="p-3.5 rounded-xl bg-white/5 border border-white/5 space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="font-semibold flex items-center gap-1.5 text-white/80">
                  <Users className="w-3.5 h-3.5 text-emerald-400" />
                  Đang khám: Buồng Nội tổng quát
                </span>
                <span className="text-[10px] font-mono text-emerald-400">Đang hoạt động</span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden">
                <div className="w-[75%] h-full rounded-full bg-emerald-500 animate-pulse" />
              </div>
            </div>

          </div>

        </div>

      </div>

    </div>
  )
}

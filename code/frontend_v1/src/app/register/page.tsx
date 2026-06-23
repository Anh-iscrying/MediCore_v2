"use client"

import React, { useState, useEffect } from "react"
import Link from "next/link"
import { useAuth } from "@/providers/auth-provider"
import { specialtiesApi } from "@/lib/api"
import { Button } from "@/components/base/ui/button"
import { Input } from "@/components/base/ui/input"
import { Label } from "@/components/base/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/base/ui/card"
import { Alert, AlertDescription } from "@/components/base/ui/alert"
import { Stethoscope, User, Mail, Lock, Phone, GraduationCap, Award, ShieldAlert } from "lucide-react"

export default function RegisterPage() {
  const { register } = useAuth()
  
  const [specialties, setSpecialties] = useState<any[]>([])
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [specialtyId, setSpecialtyId] = useState("")
  const [phone, setPhone] = useState("")
  const [title, setTitle] = useState("")
  const [experience, setExperience] = useState("")
  
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [fetchingSpecialties, setFetchingSpecialties] = useState(true)

  // Tải danh sách chuyên khoa từ backend
  useEffect(() => {
    async function loadSpecialties() {
      try {
        const data = await specialtiesApi.list()
        setSpecialties(data || [])
      } catch (err: any) {
        console.error("Lỗi khi tải chuyên khoa:", err)
        setError("Không thể tải danh sách chuyên khoa từ máy chủ. Vui lòng thử lại sau.")
      } finally {
        setFetchingSpecialties(false)
      }
    }
    loadSpecialties()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    if (!specialtyId) {
      setError("Vui lòng chọn chuyên khoa")
      setLoading(false)
      return
    }

    try {
      await register({
        name,
        email,
        password,
        specialtyId: parseInt(specialtyId),
        phone,
        title,
        experience: experience ? parseInt(experience) : 0,
      })
    } catch (err: any) {
      setError(err.message || "Không thể đăng ký tài khoản bác sĩ")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center bg-slate-50/50 px-4 py-12 dark:bg-slate-950">
      {/* Background decoration */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-[40%] right-[20%] h-[600px] w-[600px] rounded-full bg-teal-500/10 blur-[120px]" />
        <div className="absolute -bottom-[30%] left-[10%] h-[500px] w-[500px] rounded-full bg-emerald-500/10 blur-[100px]" />
      </div>

      <div className="w-full max-w-lg space-y-6">
        <div className="flex flex-col items-center space-y-2 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-teal-500 to-emerald-400 text-white shadow-lg shadow-teal-500/20">
            <Stethoscope className="h-6 w-6" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Đăng ký Bác sĩ</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Tạo tài khoản Bác sĩ mới để gia nhập hệ thống MediCore EMR
          </p>
        </div>

        <Card className="border-slate-200/60 bg-white/80 shadow-xl shadow-slate-100/50 backdrop-blur-md dark:border-slate-800/80 dark:bg-slate-900/80 dark:shadow-none">
          <CardHeader>
            <CardTitle className="text-xl text-slate-850 dark:text-slate-100">Thông tin đăng ký</CardTitle>
            <CardDescription>
              Vui lòng điền đầy đủ các trường thông tin bên dưới.
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              {error && (
                <Alert variant="destructive" className="border-red-200 bg-red-50 text-red-800 dark:border-red-900/50 dark:bg-red-950/20 dark:text-red-400">
                  <ShieldAlert className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {/* Grid 2 cột */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-slate-700 dark:text-slate-300">Họ và Tên bác sĩ</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                    <Input
                      id="name"
                      placeholder="Bác sĩ Nguyễn Văn A"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="pl-9 h-10 border-slate-200 dark:border-slate-800"
                      required
                      disabled={loading}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-slate-700 dark:text-slate-300">Số điện thoại</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                    <Input
                      id="phone"
                      placeholder="09XXXXXXXX"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="pl-9 h-10 border-slate-200 dark:border-slate-800"
                      required
                      disabled={loading}
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-slate-700 dark:text-slate-300">Email đăng nhập</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="doctor@medicore.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-9 h-10 border-slate-200 dark:border-slate-800"
                      required
                      disabled={loading}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-slate-700 dark:text-slate-300">Mật khẩu</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                    <Input
                      id="password"
                      type="password"
                      placeholder="Mật khẩu tự chọn"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-9 h-10 border-slate-200 dark:border-slate-800"
                      required
                      disabled={loading}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="specialty" className="text-slate-700 dark:text-slate-300">Chuyên khoa phụ trách</Label>
                <div className="relative">
                  <select
                    id="specialty"
                    value={specialtyId}
                    onChange={(e) => setSpecialtyId(e.target.value)}
                    className="flex h-10 w-full rounded-md border border-slate-200 bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-800 dark:bg-slate-900"
                    required
                    disabled={loading || fetchingSpecialties}
                  >
                    <option value="">-- Chọn chuyên khoa --</option>
                    {specialties.map((spec) => (
                      <option key={spec.id} value={spec.id}>
                        {spec.specialtyName}
                      </option>
                    ))}
                  </select>
                  {fetchingSpecialties && (
                    <div className="absolute right-8 top-3 h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="title" className="text-slate-700 dark:text-slate-300">Học vị / Học hàm (Degree)</Label>
                  <div className="relative">
                    <GraduationCap className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                    <Input
                      id="title"
                      placeholder="ThS. BS, CKI, CKII"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="pl-9 h-10 border-slate-200 dark:border-slate-800"
                      required
                      disabled={loading}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="experience" className="text-slate-700 dark:text-slate-300">Số năm kinh nghiệm</Label>
                  <div className="relative">
                    <Award className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                    <Input
                      id="experience"
                      type="number"
                      placeholder="Ví dụ: 5"
                      min="0"
                      value={experience}
                      onChange={(e) => setExperience(e.target.value)}
                      className="pl-9 h-10 border-slate-200 dark:border-slate-800"
                      required
                      disabled={loading}
                    />
                  </div>
                </div>
              </div>
            </CardContent>

            <CardFooter className="flex flex-col space-y-4">
              <Button 
                type="submit" 
                className="w-full h-10 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white font-medium shadow-md shadow-teal-600/10 transition-all"
                disabled={loading || fetchingSpecialties}
              >
                {loading ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    <span>Đang xử lý đăng ký...</span>
                  </div>
                ) : (
                  "Đăng ký & Đăng nhập"
                )}
              </Button>

              <div className="text-center text-xs text-slate-500 dark:text-slate-400">
                Đã có tài khoản đăng nhập?{" "}
                <Link 
                  href="/login" 
                  className="font-semibold text-teal-600 hover:text-teal-700 dark:text-teal-400 dark:hover:text-teal-300 underline underline-offset-4"
                >
                  Quay lại đăng nhập
                </Link>
              </div>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  )
}

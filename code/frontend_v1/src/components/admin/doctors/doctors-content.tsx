"use client"

import { useEffect, useState } from "react"
import { useData } from "@/components/base/providers/data-provider"
import { useToast } from "@/hooks/use-toast"
import type { Doctor } from "@/types/medical"
import { Card } from "@/components/base/ui/card"
import { Button } from "@/components/base/ui/button"
import { Input } from "@/components/base/ui/input"
import { Label } from "@/components/base/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/base/ui/avatar"
import { StatusBadge } from "@/components/base/feedback/status-badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/base/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/base/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/base/ui/alert-dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/base/ui/select"
import { Search, Plus, Pencil, Trash2, Mail, Phone } from "lucide-react"

const statusMap = {
  active: { tone: "success" as const, label: "Đang làm việc" },
  inactive: { tone: "neutral" as const, label: "Ngừng làm việc" },
}

const titles = ["Bác sĩ", "Thạc sĩ", "Tiến sĩ", "PGS.TS", "GS.TS"]

const emptyForm = {
  name: "",
  specialtyId: "",
  title: "Bác sĩ",
  email: "",
  password: "",
  phone: "",
  experience: 0,
  status: "active" as Doctor["status"],
}

export function DoctorsContent() {
  const { doctors, specialties, addDoctor, updateDoctor, deleteDoctor, ensureDoctorsLoaded, ensureSpecialtiesLoaded } = useData()
  const [query, setQuery] = useState("")
  const [specialtyFilter, setSpecialtyFilter] = useState<string>("all")
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<Doctor | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [deleteTarget, setDeleteTarget] = useState<Doctor | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    ensureDoctorsLoaded()
    ensureSpecialtiesLoaded()
  }, [ensureDoctorsLoaded, ensureSpecialtiesLoaded])

  const activeSpecialties = specialties.filter((s) => s.status !== "inactive")
  const specialtyName = (id: string) => {
    const specialty = specialties.find((s) => s.id === id)
    if (!specialty) return "—"
    return specialty.status === "inactive" ? `${specialty.name} (Tạm ngừng)` : specialty.name
  }

  const filtered = doctors.filter((d) => {
    const matchesQuery =
      d.name.toLowerCase().includes(query.toLowerCase()) ||
      d.email.toLowerCase().includes(query.toLowerCase())
    const matchesSpecialty = specialtyFilter === "all" || d.specialtyId === specialtyFilter
    return matchesQuery && matchesSpecialty
  })

  const openAdd = () => {
    setEditing(null)
    setForm({ ...emptyForm, specialtyId: activeSpecialties[0]?.id ?? "" })
    setDialogOpen(true)
  }

  const openEdit = (d: Doctor) => {
    setEditing(d)
    setForm({
      name: d.name,
      specialtyId: d.specialtyId,
      title: d.title,
      email: d.email,
      password: "",
      phone: d.phone,
      experience: d.experience,
      status: d.status,
    })
    setDialogOpen(true)
  }

  const handleSubmit = () => {
    if (!form.name.trim() || !form.specialtyId) return
    const payload = { ...form, experience: Number(form.experience) || 0 }
    if (editing) {
      updateDoctor(editing.id, { ...payload, avatar: editing.avatar })
    } else {
      addDoctor(payload)
    }
    setDialogOpen(false)
  }

  return (
    <Card className="p-0 overflow-hidden animate-slide-in-up">
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 p-4 border-b border-border">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Tìm bác sĩ theo tên hoặc email..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-9 h-9 text-sm"
          />
        </div>
        <Select value={specialtyFilter} onValueChange={setSpecialtyFilter}>
          <SelectTrigger className="w-full sm:w-52 h-9 text-sm">
            <SelectValue placeholder="Chuyên khoa" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả chuyên khoa</SelectItem>
            {specialties.map((s) => (
              <SelectItem key={s.id} value={s.id}>
                {s.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button onClick={openAdd} className="h-9 text-sm gap-1.5 shrink-0">
          <Plus className="w-4 h-4" />
          Thêm bác sĩ
        </Button>
      </div>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="min-w-[220px]">Bác sĩ</TableHead>
              <TableHead>Chuyên khoa</TableHead>
              <TableHead>Học vị</TableHead>
              <TableHead>Tài khoản</TableHead>
              <TableHead className="hidden md:table-cell">Liên hệ</TableHead>
              <TableHead className="text-center">Kinh nghiệm</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead className="text-right">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((d) => (
              <TableRow key={d.id} className="hover:bg-secondary/50">
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar className="w-9 h-9">
                      <AvatarImage src={d.avatar || "/placeholder.svg"} alt={d.name} />
                      <AvatarFallback className="text-xs">{d.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium text-sm text-foreground">{d.name}</p>
                      <p className="text-xs text-muted-foreground md:hidden">{d.email}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">{specialtyName(d.specialtyId)}</TableCell>
                <TableCell className="text-sm">{d.title}</TableCell>
                <TableCell className="text-sm">
                  <div className="flex flex-col gap-0.5">
                    <span className="font-medium text-foreground">{d.email}</span>
                    {d.doctorCode && <span className="text-xs text-muted-foreground">{d.doctorCode}</span>}
                  </div>
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  <div className="flex flex-col gap-0.5 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1.5">
                      <Mail className="w-3 h-3" />
                      {d.email}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Phone className="w-3 h-3" />
                      {d.phone}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="text-center text-sm">{d.experience} năm</TableCell>
                <TableCell>
                  <StatusBadge tone={statusMap[d.status].tone}>{statusMap[d.status].label}</StatusBadge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center justify-end gap-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(d)}>
                      <Pencil className="w-4 h-4" />
                      <span className="sr-only">Chỉnh sửa</span>
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive hover:text-destructive"
                      onClick={() => setDeleteTarget(d)}
                    >
                      <Trash2 className="w-4 h-4" />
                      <span className="sr-only">Xóa</span>
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={9} className="text-center text-sm text-muted-foreground py-10">
                  Không tìm thấy bác sĩ nào.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Add / Edit dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[520px]">
          <DialogHeader>
            <DialogTitle>{editing ? "Chỉnh sửa bác sĩ" : "Thêm bác sĩ mới"}</DialogTitle>
            <DialogDescription>Nhập thông tin bác sĩ vào biểu mẫu bên dưới.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="grid gap-2">
              <Label htmlFor="name">Họ và tên</Label>
              <Input id="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Chuyên khoa</Label>
                <Select value={form.specialtyId} onValueChange={(v) => setForm({ ...form, specialtyId: v })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn" />
                  </SelectTrigger>
                  <SelectContent>
                    {specialties
                      .filter((s) => s.status !== "inactive" || s.id === form.specialtyId)
                      .map((s) => (
                        <SelectItem key={s.id} value={s.id}>
                          {s.name}{s.status === "inactive" ? " (Tạm ngừng)" : ""}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>Học vị</Label>
                <Select value={form.title} onValueChange={(v) => setForm({ ...form, title: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {titles.map((t) => (
                      <SelectItem key={t} value={t}>
                        {t}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="email">Email đăng nhập</Label>
                <Input id="email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="password">
                  {editing ? "Mật khẩu mới (nếu muốn đổi)" : "Mật khẩu đăng nhập"}
                </Label>
                <Input
                  id="password"
                  type="password"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  placeholder={editing ? "••••••••" : "doctor123"}
                  required={!editing}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="phone">Số điện thoại</Label>
                <Input id="phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="exp">Kinh nghiệm (năm)</Label>
                <Input
                  id="exp"
                  type="number"
                  min={0}
                  value={form.experience}
                  onChange={(e) => setForm({ ...form, experience: Number(e.target.value) })}
                />
              </div>
            </div>
            <div className="grid grid-cols-1 gap-2">
              <Label>Trạng thái</Label>
              <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v as Doctor["status"] })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Đang làm việc</SelectItem>
                  <SelectItem value="inactive">Ngừng làm việc</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Hủy
            </Button>
            <Button onClick={handleSubmit}>{editing ? "Lưu thay đổi" : "Thêm mới"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete confirm */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(o) => !o && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xóa bác sĩ?</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc muốn xóa bác sĩ &quot;{deleteTarget?.name}&quot;? Hành động này không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={async () => {
                if (deleteTarget) {
                  try {
                    const message = await deleteDoctor(deleteTarget.id)
                    toast({
                      title: message.includes("Ngừng làm việc")
                        ? "Đã chuyển trạng thái"
                        : "Thành công",
                      description: message,
                    })
                  } catch (err: any) {
                    toast({
                      variant: "destructive",
                      title: "Lỗi",
                      description: err?.message || "Không thể xóa bác sĩ",
                    })
                  }
                }
                setDeleteTarget(null)
              }}
            >
              Xóa
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  )
}

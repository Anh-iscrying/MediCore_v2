"use client"

import { useState } from "react"
import { useData } from "@/providers/data-provider"
import type { Specialty } from "@/types/medical"
import { Card } from "@/components/base/ui/card"
import { Button } from "@/components/base/ui/button"
import { Input } from "@/components/base/ui/input"
import { Label } from "@/components/base/ui/label"
import { Textarea } from "@/components/base/ui/textarea"
import { StatusBadge } from "@/components/base/feedback/status-badge"
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
import { Search, Plus, Pencil, Trash2, FolderHeart, Users } from "lucide-react"

const emptyForm = {
  name: "",
  code: "",
  description: "",
  status: "active" as Specialty["status"],
}

export function SpecialtiesContent() {
  const { specialties, addSpecialty, updateSpecialty, deleteSpecialty } = useData()
  const [query, setQuery] = useState("")
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<Specialty | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [deleteTarget, setDeleteTarget] = useState<Specialty | null>(null)

  const filtered = specialties.filter(
    (s) =>
      s.name.toLowerCase().includes(query.toLowerCase()) ||
      s.code.toLowerCase().includes(query.toLowerCase()),
  )

  const openAdd = () => {
    setEditing(null)
    setForm(emptyForm)
    setDialogOpen(true)
  }

  const openEdit = (s: Specialty) => {
    setEditing(s)
    setForm({ name: s.name, code: s.code, description: s.description, status: s.status })
    setDialogOpen(true)
  }

  const handleSubmit = () => {
    if (!form.name.trim() || !form.code.trim()) return
    if (editing) updateSpecialty(editing.id, form)
    else addSpecialty(form)
    setDialogOpen(false)
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Tìm chuyên khoa..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-9 h-9 text-sm bg-card"
          />
        </div>
        <Button onClick={openAdd} className="h-9 text-sm gap-1.5 shrink-0">
          <Plus className="w-4 h-4" />
          Thêm chuyên khoa
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {filtered.map((s, i) => (
          <Card
            key={s.id}
            style={{ animationDelay: `${i * 60}ms` }}
            className="p-4 animate-slide-in-up hover:shadow-lg transition-all duration-300 flex flex-col"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <FolderHeart className="w-5 h-5 text-primary" />
              </div>
              <StatusBadge tone={s.status === "active" ? "success" : "neutral"}>
                {s.status === "active" ? "Hoạt động" : "Tạm ngừng"}
              </StatusBadge>
            </div>
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-sm font-semibold text-foreground">{s.name}</h3>
              <span className="text-[10px] font-mono bg-muted px-1.5 py-0.5 rounded text-muted-foreground">
                {s.code}
              </span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed flex-1">{s.description}</p>
            <div className="flex items-center justify-between mt-4 pt-3 border-t border-border">
              <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Users className="w-3.5 h-3.5" />
                {s.doctorCount} bác sĩ
              </span>
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(s)}>
                  <Pencil className="w-3.5 h-3.5" />
                  <span className="sr-only">Chỉnh sửa</span>
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-destructive hover:text-destructive"
                  onClick={() => setDeleteTarget(s)}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span className="sr-only">Xóa</span>
                </Button>
              </div>
            </div>
          </Card>
        ))}
        {filtered.length === 0 && (
          <p className="text-sm text-muted-foreground col-span-full text-center py-10">
            Không tìm thấy chuyên khoa nào.
          </p>
        )}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle>{editing ? "Chỉnh sửa chuyên khoa" : "Thêm chuyên khoa mới"}</DialogTitle>
            <DialogDescription>Nhập thông tin chuyên khoa.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="grid grid-cols-3 gap-4">
              <div className="grid gap-2 col-span-2">
                <Label htmlFor="sp-name">Tên chuyên khoa</Label>
                <Input id="sp-name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="sp-code">Mã</Label>
                <Input id="sp-code" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })} />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="sp-desc">Mô tả</Label>
              <Textarea
                id="sp-desc"
                rows={3}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label>Trạng thái</Label>
              <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v as Specialty["status"] })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Hoạt động</SelectItem>
                  <SelectItem value="inactive">Tạm ngừng</SelectItem>
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

      <AlertDialog open={!!deleteTarget} onOpenChange={(o) => !o && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xóa chuyên khoa?</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc muốn xóa chuyên khoa &quot;{deleteTarget?.name}&quot;? Hành động này không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => {
                if (deleteTarget) deleteSpecialty(deleteTarget.id)
                setDeleteTarget(null)
              }}
            >
              Xóa
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

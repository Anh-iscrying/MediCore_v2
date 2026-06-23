"use client"

import { useState } from "react"
import { useData } from "@/providers/data-provider"
import type { Medicine } from "@/types/medical"
import { Card } from "@/components/base/ui/card"
import { Button } from "@/components/base/ui/button"
import { Input } from "@/components/base/ui/input"
import { Label } from "@/components/base/ui/label"
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
import { Search, Plus, Pencil, Trash2, Pill } from "lucide-react"

const statusMap = {
  available: { tone: "success" as const, label: "Còn hàng" },
  low: { tone: "warning" as const, label: "Sắp hết" },
  out: { tone: "danger" as const, label: "Hết hàng" },
}

const categories = ["Giảm đau - Hạ sốt", "Kháng sinh", "Vitamin", "Tiểu đường", "Hô hấp", "Tiêu hóa", "Tim mạch", "Khác"]
const units = ["Viên", "Viên sủi", "Ống", "Chai", "Bình xịt", "Gói", "Tuýp"]

const currency = (n: number) => n.toLocaleString("vi-VN") + " đ"

const emptyForm = {
  name: "",
  code: "",
  category: categories[0],
  unit: units[0],
  price: 0,
  stock: 0,
  manufacturer: "",
  status: "available" as Medicine["status"],
}

export function MedicinesContent() {
  const { medicines, addMedicine, updateMedicine, deleteMedicine } = useData()
  const [query, setQuery] = useState("")
  const [catFilter, setCatFilter] = useState("all")
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<Medicine | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [deleteTarget, setDeleteTarget] = useState<Medicine | null>(null)

  const filtered = medicines.filter((m) => {
    const matchesQuery =
      m.name.toLowerCase().includes(query.toLowerCase()) ||
      m.code.toLowerCase().includes(query.toLowerCase()) ||
      m.manufacturer.toLowerCase().includes(query.toLowerCase())
    const matchesCat = catFilter === "all" || m.category === catFilter
    return matchesQuery && matchesCat
  })

  const openAdd = () => {
    setEditing(null)
    setForm(emptyForm)
    setDialogOpen(true)
  }

  const openEdit = (m: Medicine) => {
    setEditing(m)
    setForm({
      name: m.name,
      code: m.code,
      category: m.category,
      unit: m.unit,
      price: m.price,
      stock: m.stock,
      manufacturer: m.manufacturer,
      status: m.status,
    })
    setDialogOpen(true)
  }

  const handleSubmit = () => {
    if (!form.name.trim() || !form.code.trim()) return
    const payload = { ...form, price: Number(form.price) || 0, stock: Number(form.stock) || 0 }
    if (editing) updateMedicine(editing.id, payload)
    else addMedicine(payload)
    setDialogOpen(false)
  }

  return (
    <Card className="p-0 overflow-hidden animate-slide-in-up">
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 p-4 border-b border-border">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Tìm thuốc theo tên, mã, nhà sản xuất..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-9 h-9 text-sm"
          />
        </div>
        <Select value={catFilter} onValueChange={setCatFilter}>
          <SelectTrigger className="w-full sm:w-48 h-9 text-sm">
            <SelectValue placeholder="Nhóm thuốc" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả nhóm</SelectItem>
            {categories.map((c) => (
              <SelectItem key={c} value={c}>
                {c}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button onClick={openAdd} className="h-9 text-sm gap-1.5 shrink-0">
          <Plus className="w-4 h-4" />
          Thêm thuốc
        </Button>
      </div>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="min-w-[220px]">Tên thuốc</TableHead>
              <TableHead>Nhóm</TableHead>
              <TableHead className="hidden md:table-cell">Nhà sản xuất</TableHead>
              <TableHead className="text-right">Đơn giá</TableHead>
              <TableHead className="text-center">Tồn kho</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead className="text-right">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((m) => (
              <TableRow key={m.id} className="hover:bg-secondary/50">
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <Pill className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-sm text-foreground">{m.name}</p>
                      <p className="text-[11px] font-mono text-muted-foreground">{m.code}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">{m.category}</TableCell>
                <TableCell className="hidden md:table-cell text-sm text-muted-foreground">{m.manufacturer}</TableCell>
                <TableCell className="text-right text-sm">{currency(m.price)}</TableCell>
                <TableCell className="text-center text-sm">
                  {m.stock} {m.unit.toLowerCase()}
                </TableCell>
                <TableCell>
                  <StatusBadge tone={statusMap[m.status].tone}>{statusMap[m.status].label}</StatusBadge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center justify-end gap-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(m)}>
                      <Pencil className="w-4 h-4" />
                      <span className="sr-only">Chỉnh sửa</span>
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive hover:text-destructive"
                      onClick={() => setDeleteTarget(m)}
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
                <TableCell colSpan={7} className="text-center text-sm text-muted-foreground py-10">
                  Không tìm thấy thuốc nào.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[520px]">
          <DialogHeader>
            <DialogTitle>{editing ? "Chỉnh sửa thuốc" : "Thêm thuốc mới"}</DialogTitle>
            <DialogDescription>Nhập thông tin thuốc.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="grid grid-cols-3 gap-4">
              <div className="grid gap-2 col-span-2">
                <Label htmlFor="md-name">Tên thuốc</Label>
                <Input id="md-name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="md-code">Mã thuốc</Label>
                <Input id="md-code" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Nhóm thuốc</Label>
                <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((c) => (
                      <SelectItem key={c} value={c}>
                        {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>Đơn vị</Label>
                <Select value={form.unit} onValueChange={(v) => setForm({ ...form, unit: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {units.map((u) => (
                      <SelectItem key={u} value={u}>
                        {u}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="md-price">Đơn giá (đ)</Label>
                <Input
                  id="md-price"
                  type="number"
                  min={0}
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="md-stock">Tồn kho</Label>
                <Input
                  id="md-stock"
                  type="number"
                  min={0}
                  value={form.stock}
                  onChange={(e) => setForm({ ...form, stock: Number(e.target.value) })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="md-mfr">Nhà sản xuất</Label>
                <Input id="md-mfr" value={form.manufacturer} onChange={(e) => setForm({ ...form, manufacturer: e.target.value })} />
              </div>
              <div className="grid gap-2">
                <Label>Trạng thái</Label>
                <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v as Medicine["status"] })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="available">Còn hàng</SelectItem>
                    <SelectItem value="low">Sắp hết</SelectItem>
                    <SelectItem value="out">Hết hàng</SelectItem>
                  </SelectContent>
                </Select>
              </div>
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
            <AlertDialogTitle>Xóa thuốc?</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc muốn xóa &quot;{deleteTarget?.name}&quot;? Hành động này không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => {
                if (deleteTarget) deleteMedicine(deleteTarget.id)
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

"use client"

import { useEffect, useMemo, useState } from "react"
import { useData } from "@/providers/data-provider"
import { useToast } from "@/hooks/use-toast"
import type { Specialty, SpecialtyExamFieldType, SpecialtyExamTemplate, SpecialtyExamTemplateField } from "@/types/medical"
import { Card } from "@/components/base/ui/card"
import { Button } from "@/components/base/ui/button"
import { Input } from "@/components/base/ui/input"
import { Label } from "@/components/base/ui/label"
import { Textarea } from "@/components/base/ui/textarea"
import { Checkbox } from "@/components/base/ui/checkbox"
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
import { Plus, Pencil, Trash2, FolderHeart, Users, Save, FilePlus2 } from "lucide-react"

const fieldTypes: Array<{ value: SpecialtyExamFieldType; label: string }> = [
  { value: "text", label: "Một dòng" },
  { value: "textarea", label: "Nhiều dòng" },
  { value: "number", label: "Số" },
  { value: "select", label: "Chọn danh sách" },
  { value: "checkbox", label: "Đánh dấu" },
]

const emptyTemplate: SpecialtyExamTemplate = { fields: [] }

const emptyForm = {
  name: "",
  code: "",
  description: "",
  status: "active" as Specialty["status"],
}

const normalizeTemplate = (template?: SpecialtyExamTemplate): SpecialtyExamTemplate => ({
  fields: Array.isArray(template?.fields) ? template.fields : [],
})

const slugifyFieldId = (value: string) =>
  value
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/đ/g, "d")
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")

const parseOptions = (value?: string[]) => (value ?? []).join(", ")

const normalizeOptions = (value: string) =>
  value
    .split(",")
    .map((option) => option.trim())
    .filter(Boolean)

interface TemplateFieldItemProps {
  field: SpecialtyExamTemplateField
  index: number
  updateField: (index: number, patch: Partial<SpecialtyExamTemplateField>) => void
  removeField: (index: number) => void
}

function TemplateFieldItem({ field, index, updateField, removeField }: TemplateFieldItemProps) {
  const [optionsText, setOptionsText] = useState(parseOptions(field.options))

  useEffect(() => {
    setOptionsText(parseOptions(field.options))
  }, [field.options])

  const handleOptionsChange = (val: string) => {
    setOptionsText(val)
    updateField(index, { options: normalizeOptions(val) })
  }

  return (
    <div className="rounded-lg border border-border p-3 space-y-3 bg-card shrink-0">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="md:col-span-2 space-y-1.5">
          <Label>Tên mục</Label>
          <Input
            value={field.label}
            onChange={(e) => {
              const label = e.target.value
              updateField(index, {
                label,
                id: slugifyFieldId(label) || `field_${index + 1}`,
              })
            }}
            placeholder="Ví dụ: Huyết áp"
          />
        </div>
        <div className="space-y-1.5">
          <Label>Loại dữ liệu</Label>
          <Select
            value={field.type}
            onValueChange={(value) =>
              updateField(index, {
                type: value as SpecialtyExamFieldType,
                options: value === "select" ? field.options ?? [] : [],
              })
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {fieldTypes.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="flex items-center justify-between pt-1">
        <label className="flex items-center gap-2 text-sm select-none cursor-pointer">
          <Checkbox
            checked={!!field.required}
            onCheckedChange={(checked) => updateField(index, { required: checked === true })}
          />
          Bắt buộc
        </label>
        <Button variant="ghost" className="text-destructive h-8 px-2 hover:bg-destructive/10" onClick={() => removeField(index)}>
          Xóa mục
        </Button>
      </div>
      {field.type === "select" && (
        <div className="space-y-1.5 pt-1">
          <Label>Lựa chọn (cách nhau bằng dấu phẩy)</Label>
          <Input
            value={optionsText}
            onChange={(e) => handleOptionsChange(e.target.value)}
            placeholder="Nhẹ, Trung bình, Nặng"
          />
        </div>
      )}
    </div>
  )
}

export function SpecialtiesContent() {
  const {
    specialties,
    doctors,
    addSpecialty,
    updateSpecialty,
    deleteSpecialty,
    ensureSpecialtiesLoaded,
    ensureDoctorsLoaded,
  } = useData()
  const { toast } = useToast()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<Specialty | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [deleteTarget, setDeleteTarget] = useState<Specialty | null>(null)
  const [selectedSpecialtyId, setSelectedSpecialtyId] = useState<string>("")
  const [templateDraft, setTemplateDraft] = useState<SpecialtyExamTemplate>(emptyTemplate)
  const [templateError, setTemplateError] = useState("")

  useEffect(() => {
    ensureSpecialtiesLoaded()
    ensureDoctorsLoaded()
  }, [ensureSpecialtiesLoaded, ensureDoctorsLoaded])

  const selectedSpecialty = useMemo(
    () => specialties.find((s) => s.id === selectedSpecialtyId) ?? specialties[0],
    [specialties, selectedSpecialtyId],
  )

  const specialtyDoctors = useMemo(
    () => doctors.filter((doctor) => doctor.specialtyId === selectedSpecialty?.id),
    [doctors, selectedSpecialty?.id],
  )

  useEffect(() => {
    if (!selectedSpecialty) return
    setSelectedSpecialtyId(selectedSpecialty.id)
    setTemplateDraft(normalizeTemplate(selectedSpecialty.examTemplate))
    setTemplateError("")
  }, [selectedSpecialty?.id])

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
    if (editing) {
      updateSpecialty(editing.id, { ...form, examTemplate: normalizeTemplate(editing.examTemplate) })
      toast({
        title: "Cập nhật thành công",
        description: `Đã cập nhật thông tin chuyên khoa ${form.name}.`,
      })
    } else {
      addSpecialty({ ...form, examTemplate: emptyTemplate })
      toast({
        title: "Thêm thành công",
        description: `Đã thêm chuyên khoa ${form.name} mới.`,
      })
    }
    setDialogOpen(false)
  }

  const updateField = (index: number, patch: Partial<SpecialtyExamTemplateField>) => {
    setTemplateDraft((prev) => ({
      fields: prev.fields.map((field, fieldIndex) => (fieldIndex === index ? { ...field, ...patch } : field)),
    }))
    setTemplateError("")
  }

  const addField = () => {
    const nextIndex = templateDraft.fields.length + 1
    setTemplateDraft((prev) => ({
      fields: [
        ...prev.fields,
        {
          id: `field_${nextIndex}`,
          label: `Trường ${nextIndex}`,
          type: "text",
          required: false,
          options: [],
        },
      ],
    }))
  }

  const removeField = (index: number) => {
    setTemplateDraft((prev) => ({ fields: prev.fields.filter((_, fieldIndex) => fieldIndex !== index) }))
    setTemplateError("")
  }

  const validateTemplate = (template: SpecialtyExamTemplate) => {
    const ids = new Set<string>()
    for (const field of template.fields) {
      const id = field.id.trim()
      const label = field.label.trim()
      if (!id || !label) return "Mỗi trường cần có mã và nhãn."
      if (ids.has(id)) return `Mã trường "${id}" bị trùng.`
      ids.add(id)
      if (field.type === "select" && (!field.options || field.options.length === 0)) {
        return `Trường "${label}" cần ít nhất một lựa chọn.`
      }
    }
    return ""
  }

  const saveTemplate = () => {
    if (!selectedSpecialty) return
    const nextTemplate = {
      fields: templateDraft.fields.map((field) => ({
        ...field,
        id: field.id.trim(),
        label: field.label.trim(),
        options: field.type === "select" ? field.options ?? [] : [],
      })),
    }
    const error = validateTemplate(nextTemplate)
    if (error) {
      setTemplateError(error)
      return
    }

    updateSpecialty(selectedSpecialty.id, {
      name: selectedSpecialty.name,
      code: selectedSpecialty.code,
      description: selectedSpecialty.description,
      status: selectedSpecialty.status,
      examTemplate: nextTemplate,
    })
    setTemplateDraft(nextTemplate)
    setTemplateError("")
    toast({
      title: "Lưu thành công",
      description: `Đã lưu cấu hình template khám cho chuyên khoa ${selectedSpecialty.name}.`,
    })
  }

  return (
    <div className="space-y-4">
      {specialties.length === 0 ? (
        <Card className="p-10 text-center space-y-4">
          <FolderHeart className="w-12 h-12 text-muted-foreground mx-auto" />
          <p className="text-sm text-muted-foreground">Chưa có chuyên khoa nào trong hệ thống.</p>
          <Button onClick={openAdd} className="gap-1.5 mx-auto">
            <Plus className="w-4 h-4" />
            Thêm chuyên khoa
          </Button>
        </Card>
      ) : (
        selectedSpecialty && (
          <Card className="p-6 flex flex-col h-[calc(100vh-210px)] min-h-[550px] shadow-sm">
            {/* Top row: Dropdown selection + Actions */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-5 shrink-0">
              <div className="flex flex-col md:flex-row md:items-center gap-4 flex-1">
                <div className="space-y-1.5">
                  <Label className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Chuyên khoa đang chọn</Label>
                  <div className="flex items-center gap-2">
                    <Select
                      value={selectedSpecialty?.id || ""}
                      onValueChange={setSelectedSpecialtyId}
                    >
                      <SelectTrigger className="w-[320px] bg-card font-semibold text-foreground border-border">
                        <SelectValue placeholder="Chọn chuyên khoa" />
                      </SelectTrigger>
                      <SelectContent>
                        {specialties.map((s) => (
                          <SelectItem key={s.id} value={s.id}>
                            {s.name} ({s.code})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-9 w-9 border border-border hover:bg-muted"
                        title="Chỉnh sửa thông tin chuyên khoa"
                        onClick={() => openEdit(selectedSpecialty)}
                      >
                        <Pencil className="w-4 h-4 text-foreground" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-9 w-9 border border-border hover:bg-destructive/10 text-destructive"
                        title="Xóa chuyên khoa"
                        onClick={() => setDeleteTarget(selectedSpecialty)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col justify-end pt-1">
                  <p className="text-xs text-muted-foreground leading-normal">
                    Mã chuyên khoa: <span className="font-mono font-semibold bg-muted px-1 py-0.5 rounded text-muted-foreground">{selectedSpecialty.code}</span>
                  </p>
                  <p className="text-xs text-muted-foreground max-w-md truncate mt-1" title={selectedSpecialty.description}>
                    {selectedSpecialty.description || "Không có mô tả."}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 self-end md:self-auto">
                <Button variant="outline" onClick={openAdd} className="gap-1.5 h-10 text-sm">
                  <Plus className="w-4 h-4" />
                  Thêm chuyên khoa
                </Button>
                <Button onClick={saveTemplate} className="gap-1.5 h-10 text-sm bg-green-700 hover:bg-green-800 text-white">
                  <Save className="w-4 h-4" />
                  Lưu template khám
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 flex-1 min-h-0 overflow-hidden pt-4">
              <div className="rounded-lg border border-border p-4 flex flex-col h-full overflow-hidden">
                <div className="flex items-center justify-between mb-3 shrink-0">
                  <h3 className="text-sm font-semibold flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    Bác sĩ thuộc chuyên khoa
                  </h3>
                  <span className="text-xs text-muted-foreground">{specialtyDoctors.length}</span>
                </div>
                <div className="space-y-2 overflow-y-auto flex-1 pr-1">
                  {specialtyDoctors.map((doctor) => (
                    <div key={doctor.id} className="rounded-md bg-muted/50 px-3 py-2">
                      <p className="text-sm font-medium text-foreground">{doctor.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {doctor.title} {doctor.phone ? `• ${doctor.phone}` : ""}
                      </p>
                    </div>
                  ))}
                  {specialtyDoctors.length === 0 && (
                    <p className="text-sm text-muted-foreground py-6 text-center">
                      Chưa có bác sĩ thuộc chuyên khoa này.
                    </p>
                  )}
                </div>
              </div>

              <div className="lg:col-span-2 rounded-lg border border-border p-4 flex flex-col h-full overflow-hidden">
                <div className="flex items-center justify-between gap-3 shrink-0 mb-4">
                  <div>
                    <h3 className="text-sm font-semibold">Template khám bệnh</h3>
                    <p className="text-xs text-muted-foreground">
                      Các mục này sẽ xuất hiện khi bác sĩ khám bệnh theo chuyên khoa.
                    </p>
                  </div>
                  <Button variant="outline" size="sm" onClick={addField} className="gap-2">
                    <FilePlus2 className="w-4 h-4" />
                    Thêm mục
                  </Button>
                </div>

                {templateError && (
                  <div className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive shrink-0 mb-3">
                    {templateError}
                  </div>
                )}

                <div className="space-y-3 overflow-y-auto flex-1 pr-1">
                  {templateDraft.fields.map((field, index) => (
                    <TemplateFieldItem
                      key={`field-item-${index}`}
                      field={field}
                      index={index}
                      updateField={updateField}
                      removeField={removeField}
                    />
                  ))}
                  {templateDraft.fields.length === 0 && (
                    <div className="rounded-lg border border-dashed border-border py-10 text-center text-sm text-muted-foreground">
                      Chưa có mục khám riêng. Bấm “Thêm mục” để tạo template.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </Card>
        )
      )}

      {/* Dialogs */}
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
                if (deleteTarget) {
                  deleteSpecialty(deleteTarget.id)
                  toast({
                    title: "Xóa thành công",
                    description: `Đã xóa chuyên khoa ${deleteTarget.name}.`,
                  })
                }
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

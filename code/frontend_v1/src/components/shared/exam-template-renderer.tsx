import { useState } from "react"
import type { SpecialtyExamTemplate } from "@/types/medical"
import { Input } from "@/components/base/ui/input"
import { Label } from "@/components/base/ui/label"
import { Textarea } from "@/components/base/ui/textarea"
import { Checkbox } from "@/components/base/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/base/ui/select"

export interface ExamTemplateRendererProps {
  template: SpecialtyExamTemplate
  value?: Record<string, any>
  onChange?: (value: Record<string, any>) => void
  readonly?: boolean
}

export function ExamTemplateRenderer({ template, value, onChange, readonly = false }: ExamTemplateRendererProps) {
  const [internalValue, setInternalValue] = useState<Record<string, any>>({})

  const currentValues = value ?? internalValue

  const handleChange = (id: string, val: any) => {
    if (readonly) return
    const next = { ...currentValues, [id]: val }
    setInternalValue(next)
    onChange?.(next)
  }

  if (!template || !template.fields || template.fields.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50 p-8 text-center text-sm italic text-slate-500">
        Chưa có mẫu khám bệnh.
      </div>
    )
  }

  return (
    <div className="grid gap-6">
      {template.fields.map((field) => (
        <div key={field.id} className="space-y-2">
          <Label className="flex items-center gap-1 text-sm font-medium text-slate-700">
            {field.label}
            {field.required && <span className="text-red-500">*</span>}
          </Label>

          {field.type === "text" && (
            <Input
              className="bg-white"
              value={currentValues[field.id] || ""}
              onChange={(e) => handleChange(field.id, e.target.value)}
              disabled={readonly}
              placeholder={`Nhập ${field.label.toLowerCase()}`}
            />
          )}

          {field.type === "textarea" && (
            <Textarea
              className="bg-white"
              value={currentValues[field.id] || ""}
              onChange={(e) => handleChange(field.id, e.target.value)}
              disabled={readonly}
              placeholder={`Nhập ${field.label.toLowerCase()}`}
              rows={3}
            />
          )}

          {field.type === "number" && (
            <Input
              className="bg-white"
              type="number"
              value={currentValues[field.id] || ""}
              onChange={(e) => handleChange(field.id, e.target.value)}
              disabled={readonly}
              placeholder={`Nhập ${field.label.toLowerCase()}`}
            />
          )}

          {field.type === "select" && (
            <Select
              value={currentValues[field.id] || ""}
              onValueChange={(val) => handleChange(field.id, val)}
              disabled={readonly}
            >
              <SelectTrigger className="bg-white">
                <SelectValue placeholder={`Chọn ${field.label.toLowerCase()}`} />
              </SelectTrigger>
              <SelectContent>
                {field.options?.map((opt, i) => (
                  <SelectItem key={`${opt}-${i}`} value={opt}>
                    {opt}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          {field.type === "checkbox" && (
            <div className="flex items-center space-x-2 pt-1">
              <Checkbox
                className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                id={`checkbox-${field.id}`}
                checked={!!currentValues[field.id]}
                onCheckedChange={(checked) => handleChange(field.id, checked)}
                disabled={readonly}
              />
              <Label htmlFor={`checkbox-${field.id}`} className="cursor-pointer font-normal text-slate-600">
                Có
              </Label>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

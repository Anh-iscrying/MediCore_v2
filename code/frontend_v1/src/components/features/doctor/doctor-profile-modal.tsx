"use client"

import { useState, useRef, useEffect } from "react"
import { X, Upload, User, Briefcase, GraduationCap, Phone, Stethoscope, FileText } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/base/ui/avatar"

interface DoctorProfileModalProps {
  isOpen: boolean
  onClose: () => void
  currentDoctor: any 
  onSave: (updatedData: any) => void
}

const degrees = [
  "Bác sĩ (BS)", 
  "Thạc sĩ (ThS)", 
  "Tiến sĩ (TS)", 
  "Bác sĩ CKI (BS.CKI)", 
  "Bác sĩ CKII (BS.CKII)", 
  "Phó Giáo sư (PGS.TS)", 
  "Giáo sư (GS.TS)"
]

const experienceYears = Array.from({ length: 40 }, (_, i) => i + 1)

export function DoctorProfileModal({ isOpen, onClose, currentDoctor, onSave }: DoctorProfileModalProps) {
  const [avatar, setAvatar] = useState(currentDoctor?.avatar || "")
  const [name, setName] = useState(currentDoctor?.name || "")
  const [phone, setPhone] = useState(currentDoctor?.phone || "")
  const [degree, setDegree] = useState(currentDoctor?.degree || "")
  const [specialty, setSpecialty] = useState(currentDoctor?.specialty || "")
  const [experience, setExperience] = useState(currentDoctor?.experience || "")
  const [bio, setBio] = useState(currentDoctor?.bio || "") // Trường mô tả mới
  
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (currentDoctor) {
      setAvatar(currentDoctor.avatar || "")
      setName(currentDoctor.name || "")
      setPhone(currentDoctor.phone || "")
      setDegree(currentDoctor.degree || "")
      setSpecialty(currentDoctor.specialty || "")
      setExperience(currentDoctor.experience || "")
      setBio(currentDoctor.bio || "")
    }
  }, [currentDoctor])

  if (!isOpen) return null

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const imageUrl = URL.createObjectURL(file)
      setAvatar(imageUrl)
    }
  }

  const handleSave = () => {
    onSave({
      ...currentDoctor,
      avatar,
      name,
      phone,
      degree,
      specialty,
      experience,
      bio
    })
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-card w-full max-w-2xl rounded-xl shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border bg-secondary/30">
          <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <User className="w-5 h-5 text-primary" />
            Cập nhật Hồ sơ Y khoa
          </h3>
          <button onClick={onClose} className="p-1 rounded-md hover:bg-secondary text-muted-foreground transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Form */}
        <div className="p-6 overflow-y-auto space-y-6 custom-scrollbar">
          
          <div className="flex flex-col items-center justify-center gap-3 pb-4 border-b border-border/50">
            <Avatar className="w-24 h-24 border-4 border-background shadow-md">
              <AvatarImage src={avatar || "/placeholder.svg"} alt="Avatar" className="object-cover" />
              <AvatarFallback className="text-2xl font-bold bg-primary/10 text-primary">
                {name?.charAt(0) || "BS"}
              </AvatarFallback>
            </Avatar>
            <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleImageChange} />
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-2 text-xs font-medium bg-secondary text-secondary-foreground px-3 py-1.5 rounded-md hover:bg-secondary/80 transition-colors"
            >
              <Upload className="w-3 h-3" /> Tải ảnh lên
            </button>
          </div>

          <div className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5" /> Họ và tên
                </label>
                <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="VD: Nguyễn Văn An" className="w-full border rounded-md p-2.5 text-sm bg-background focus:ring-2 focus:ring-primary/50" />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5" /> Số điện thoại
                </label>
                <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="VD: 0912 345 678" className="w-full border rounded-md p-2.5 text-sm bg-background focus:ring-2 focus:ring-primary/50" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 flex items-center gap-1.5">
                  <GraduationCap className="w-3.5 h-3.5" /> Học vị
                </label>
                <select value={degree} onChange={(e) => setDegree(e.target.value)} className="w-full border rounded-md p-2.5 text-sm bg-background focus:ring-2 focus:ring-primary/50">
                  <option value="">-- Chọn học vị --</option>
                  {degrees.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 flex items-center gap-1.5">
                  <Stethoscope className="w-3.5 h-3.5" /> Chuyên khoa
                </label>
                <input type="text" value={specialty} onChange={(e) => setSpecialty(e.target.value)} placeholder="VD: Nội tim mạch..." className="w-full border rounded-md p-2.5 text-sm bg-background focus:ring-2 focus:ring-primary/50" />
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1.5 flex items-center gap-1.5">
                <Briefcase className="w-3.5 h-3.5" /> Số năm làm việc
              </label>
              <select value={experience} onChange={(e) => setExperience(e.target.value)} className="w-full md:w-1/2 border rounded-md p-2.5 text-sm bg-background focus:ring-2 focus:ring-primary/50">
                <option value="">-- Chọn số năm --</option>
                {experienceYears.map(year => <option key={year} value={`${year} năm`}>{year} năm</option>)}
              </select>
            </div>

            {/* Trường Mô tả mới */}
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1.5 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5" /> Mô tả thông tin 
              </label>
              <textarea 
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Nhập ghi chú bệnh án, tiền sử y khoa hoặc mô tả chi tiết..."
                className="w-full min-h-[120px] border rounded-md p-3 text-sm bg-background focus:ring-2 focus:ring-primary/50 transition-all"
              />
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex justify-end gap-3 p-4 border-t border-border bg-secondary/10">
          <button onClick={onClose} className="px-4 py-2 text-sm font-medium bg-background border text-foreground rounded-md hover:bg-secondary transition-colors">Hủy bỏ</button>
          <button onClick={handleSave} className="px-4 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors shadow-sm">Lưu hồ sơ</button>
        </div>
      </div>
    </div>
  )
}
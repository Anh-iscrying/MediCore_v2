import { AppShell } from "@/components/base/layout/app-shell"
import { DoctorsContent } from "@/components/admin/doctors/doctors-content"

export default function DoctorsPage() {
  return (
    <AppShell
      title="Quản lý Bác sĩ"
      description="Danh sách, thêm, chỉnh sửa và xóa thông tin bác sĩ."
    >
      <DoctorsContent />
    </AppShell>
  )
}

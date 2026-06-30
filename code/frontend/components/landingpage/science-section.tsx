"use client"

import { SpecialtiesGallery } from "./specialties-gallery"
import { HeartPulse, Stethoscope, Syringe, Sparkles, Ear, Baby } from "lucide-react"

const specialties = [
  {
    id: "cardiology",
    title: "Tim mạch",
    description: "Chẩn đoán, điều trị chuyên sâu và dự phòng các bệnh lý tim mạch, mạch vành và tăng huyết áp bằng kỹ thuật can thiệp tiên tiến.",
    icon: <HeartPulse className="size-8 stroke-[1.5]" />,
  },
  {
    id: "internal-medicine",
    title: "Nội khoa",
    description: "Quản lý và điều trị toàn diện các bệnh lý nội tiết, tiêu hóa, hô hấp và các bệnh lý mãn tính của người trưởng thành.",
    icon: <Stethoscope className="size-8 stroke-[1.5]" />,
  },
  {
    id: "surgery",
    title: "Ngoại khoa",
    description: "Phẫu thuật nội soi ít xâm lấn, phẫu thuật chỉnh hình chấn thương ngoại khoa kỹ thuật cao giúp rút ngắn thời gian hồi phục.",
    icon: <Syringe className="size-8 stroke-[1.5]" />,
  },
  {
    id: "dermatology",
    title: "Da liễu",
    description: "Khám và trị liệu hiệu quả các bệnh lý về da, tóc, móng kết hợp các liệu pháp thẩm mỹ da công nghệ cao chuẩn y khoa.",
    icon: <Sparkles className="size-8 stroke-[1.5]" />,
  },
  {
    id: "ent",
    title: "Tai mũi họng",
    description: "Chẩn đoán nâng cao và điều trị các bệnh lý tai mũi họng bằng phương pháp nội soi ống mềm thế hệ mới, nhẹ nhàng và chính xác.",
    icon: <Ear className="size-8 stroke-[1.5]" />,
  },
  {
    id: "pediatrics",
    title: "Nhi khoa",
    description: "Chăm sóc sức khỏe toàn diện cho trẻ em, theo dõi sự phát triển thể chất và tinh thần, tư vấn dinh dưỡng và tiêm chủng.",
    icon: <Baby className="size-8 stroke-[1.5]" />,
  },
]

export function ScienceSection() {
  return (
    <SpecialtiesGallery
      items={specialties}
      title="Các chuyên khoa lâm sàng"
      subtitle="CHUYÊN MÔN Y TẾ"
      description="Dịch vụ chăm sóc y tế toàn diện được thực hiện bởi các bác sĩ chuyên khoa được chứng nhận, với hệ thống chẩn đoán và điều trị hiện đại."
    />
  )
}

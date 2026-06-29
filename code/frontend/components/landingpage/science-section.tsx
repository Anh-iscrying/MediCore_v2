"use client"

import { HeartCareIcon, BrainHealthIcon, BoneJointIcon, PulmonaryIcon } from "@/components/base/medical-icons"
import { SpecialtiesGallery } from "./specialties-gallery"

const specialties = [
  {
    id: "cardiology",
    title: "Chăm sóc tim mạch",
    description: "Điều trị tim mạch tiên tiến và quản lý phòng ngừa bệnh tim bằng công nghệ hiện đại.",
    icon: <HeartCareIcon />,
  },
  {
    id: "neurology",
    title: "Sức khỏe thần kinh",
    description: "Chăm sóc thần kinh chuyên sâu cho phòng ngừa đột quỵ, rối loạn trí nhớ và các bệnh lý thần kinh.",
    icon: <BrainHealthIcon />,
  },
  {
    id: "orthopedics",
    title: "Cơ xương khớp",
    description: "Phẫu thuật chỉnh hình và y học thể thao chuyên nghiệp với kỹ thuật ít xâm lấn.",
    icon: <BoneJointIcon />,
  },
  {
    id: "pulmonary",
    title: "Chăm sóc hô hấp",
    description: "Điều trị toàn diện hệ phổi và hô hấp nhằm duy trì sức khỏe lá phổi tối ưu.",
    icon: <PulmonaryIcon />,
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

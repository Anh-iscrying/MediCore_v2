"use client"

import { SpecialtiesGallery } from "./specialties-gallery"
import { Baby, Ear, HeartPulse, ShieldCheck, Sparkles, Stethoscope, Syringe } from "lucide-react"

const specialties = [
  {
    id: "cardiology",
    title: "Tim mạch",
    description: "Khám đau ngực, hồi hộp, tăng huyết áp và theo dõi nguy cơ tim mạch với bác sĩ chuyên khoa.",
    icon: <HeartPulse className="size-7 stroke-[1.6]" />,
  },
  {
    id: "internal-medicine",
    title: "Nội tổng quát",
    description: "Đánh giá triệu chứng thường gặp, quản lý bệnh mạn tính và điều phối khám chuyên sâu khi cần.",
    icon: <Stethoscope className="size-7 stroke-[1.6]" />,
  },
  {
    id: "surgery",
    title: "Ngoại khoa",
    description: "Tư vấn trước phẫu thuật, theo dõi sau can thiệp và hướng dẫn hồi phục an toàn tại nhà.",
    icon: <Syringe className="size-7 stroke-[1.6]" />,
  },
  {
    id: "dermatology",
    title: "Da liễu",
    description: "Khám da, tóc, móng và lập kế hoạch chăm sóc phù hợp với từng tình trạng cụ thể.",
    icon: <Sparkles className="size-7 stroke-[1.6]" />,
  },
  {
    id: "ent",
    title: "Tai mũi họng",
    description: "Khám viêm xoang, đau họng, ù tai và các triệu chứng hô hấp trên thường gặp.",
    icon: <Ear className="size-7 stroke-[1.6]" />,
  },
  {
    id: "pediatrics",
    title: "Nhi khoa",
    description: "Theo dõi sức khỏe trẻ em, tư vấn tiêm chủng, dinh dưỡng và dấu hiệu cần khám sớm.",
    icon: <Baby className="size-7 stroke-[1.6]" />,
  },
]

export function ScienceSection() {
  return (
    <SpecialtiesGallery
      items={specialties}
      title="Chuyên khoa cho nhu cầu thường gặp"
      subtitle="Khám đúng chuyên khoa"
      description="Chọn chuyên khoa phù hợp, xem hướng chuẩn bị trước khi khám và đặt lịch với bác sĩ."
      badgeIcon={<ShieldCheck className="size-4" />}
    />
  )
}

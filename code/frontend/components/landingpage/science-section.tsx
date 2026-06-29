"use client"

import { HeartCareIcon, BrainHealthIcon, BoneJointIcon, PulmonaryIcon } from "@/components/base/medical-icons"
import { SpecialtiesGallery } from "./specialties-gallery"

const specialties = [
  {
    id: "cardiology",
    title: "Heart Care",
    description: "Advanced cardiac treatments and preventive heart disease management with cutting-edge technology.",
    icon: <HeartCareIcon />,
  },
  {
    id: "neurology",
    title: "Brain Health",
    description: "Specialized neurological care for stroke prevention, memory disorders, and neurological conditions.",
    icon: <BrainHealthIcon />,
  },
  {
    id: "orthopedics",
    title: "Bone & Joint",
    description: "Expert orthopedic surgery and sports medicine with minimally invasive techniques.",
    icon: <BoneJointIcon />,
  },
  {
    id: "pulmonary",
    title: "Respiratory Care",
    description: "Comprehensive pulmonary and respiratory system treatment for optimal lung health.",
    icon: <PulmonaryIcon />,
  },
]

export function ScienceSection() {
  return (
    <SpecialtiesGallery
      items={specialties}
      title="Clinical Specialties"
      subtitle="MEDICAL EXPERTISE"
      description="Comprehensive medical care provided by board-certified specialists equipped with advanced diagnostics and treatments."
    />
  )
}

"use client"

import { use } from "react"
import { ExaminationPageWrapper } from "@/components/features/doctor/examination-page-wrapper"

export default function ExaminationRoute({ params }: { params: Promise<{ patientId: string }> }) {
  const resolvedParams = use(params)
  return <ExaminationPageWrapper patientId={resolvedParams.patientId} />
}

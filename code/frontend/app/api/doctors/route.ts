import { NextResponse } from "next/server"
import { readDB } from "@/lib/db"

export async function GET() {
  try {
    const db = readDB()
    const doctors = db.doctors.map(doctor => {
      const specialty = db.specialties?.find(item => item.id === doctor.specialty_id)
      const doctorSchedules = db.doctor_schedules
        ?.filter(schedule => schedule.doctor_id === doctor.id) ?? []
      const availableSlots = doctorSchedules
        .filter(schedule => !schedule.is_booked)
        .map(schedule => schedule.time_slot)

      return {
        ...doctor,
        specialty: specialty?.name ?? "",
        doctor_schedules: doctorSchedules,
        availableSlots: Array.from(new Set(availableSlots))
      }
    })

    return NextResponse.json(doctors)
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch doctors" }, { status: 500 })
  }
}

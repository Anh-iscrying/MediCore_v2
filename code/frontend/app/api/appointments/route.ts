import { NextResponse } from "next/server"
import { readDB, writeDB, Appointment } from "@/lib/db"

export async function GET() {
  try {
    const db = readDB()
    return NextResponse.json(db.appointments)
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch appointments" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { doctor, specialty, date, time, symptoms } = body

    if (!doctor || !specialty || !date || !time) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const db = readDB()
    const newAppointment: Appointment = {
      id: Math.random().toString(36).substring(2, 9),
      doctor,
      specialty,
      date,
      time,
      status: "PENDING",
      symptoms
    }

    db.appointments.unshift(newAppointment)
    writeDB(db)

    return NextResponse.json(newAppointment, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: "Failed to create appointment" }, { status: 500 })
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json()
    const { id, status } = body

    if (!id || !status) {
      return NextResponse.json({ error: "Missing id or status" }, { status: 400 })
    }

    const db = readDB()
    const index = db.appointments.findIndex(app => app.id === id)
    if (index === -1) {
      return NextResponse.json({ error: "Appointment not found" }, { status: 404 })
    }

    db.appointments[index].status = status
    writeDB(db)

    return NextResponse.json(db.appointments[index])
  } catch (error) {
    return NextResponse.json({ error: "Failed to update appointment" }, { status: 500 })
  }
}

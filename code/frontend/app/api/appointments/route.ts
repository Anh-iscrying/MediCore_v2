import { NextRequest, NextResponse } from "next/server"

const BACKEND_API_BASE_URL = process.env.BACKEND_API_BASE_URL || "http://localhost:8080/api/v1"

type BackendResponse<T> = {
  status?: number
  message?: string
  data?: T
  timestamp?: string
}

type AuthUser = {
  patientCode?: string | null
  patientId?: string | number | null
}

type BackendAppointment = {
  id: number | string
  patientId?: string
  doctorId?: number
  doctorName?: string
  specialtyId?: number
  appointmentDate?: string
  timeSlot?: string
  symptomsInitial?: string
  status?: string
}

function getAuthHeaders(request: NextRequest) {
  const headers = new Headers({ Accept: "application/json" })
  const accessToken = request.cookies.get("accessToken")?.value
  const authorization = request.headers.get("authorization")

  if (authorization) {
    headers.set("Authorization", authorization)
  }
  if (accessToken) {
    headers.set("Cookie", `accessToken=${accessToken}`)
  }

  return headers
}

async function parseBackendResponse<T>(response: Response): Promise<T> {
  const contentType = response.headers.get("content-type")
  const payload = contentType?.includes("application/json")
    ? ((await response.json()) as BackendResponse<T> | T)
    : ({ message: await response.text() } as BackendResponse<T>)

  if (!response.ok) {
    const message =
      typeof payload === "object" && payload && "message" in payload
        ? String((payload as BackendResponse<T>).message || `Máy chủ trả lỗi ${response.status}`)
        : `Máy chủ trả lỗi ${response.status}`
    throw new Error(message)
  }

  if (typeof payload === "object" && payload && "data" in payload) {
    return (payload as BackendResponse<T>).data as T
  }

  return payload as T
}

async function getCurrentPatientCode(request: NextRequest) {
  const meResponse = await fetch(`${BACKEND_API_BASE_URL}/auth/me`, {
    method: "GET",
    headers: getAuthHeaders(request),
    cache: "no-store",
  })

  const me = await parseBackendResponse<AuthUser>(meResponse)
  const patientCode = me?.patientCode || me?.patientId

  if (!patientCode) {
    throw new Error("Không tìm thấy mã bệnh nhân từ phiên đăng nhập")
  }

  return String(patientCode)
}

export async function GET(request: NextRequest) {
  try {
    const patientCode = await getCurrentPatientCode(request)
    const response = await fetch(
      `${BACKEND_API_BASE_URL}/appointments/patient/${encodeURIComponent(patientCode)}`,
      {
        method: "GET",
        headers: getAuthHeaders(request),
        cache: "no-store",
      }
    )

    const appointments = await parseBackendResponse<BackendAppointment[]>(response)
    return NextResponse.json(appointments ?? [])
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch appointments" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const patientCode = await getCurrentPatientCode(request)
    const doctorId = Number(body.doctorId ?? body.doctor_id)
    const appointmentDate = body.appointmentDate ?? body.work_date ?? body.date
    const rawTimeSlot = body.timeSlot ?? body.time_slot ?? body.time

    if (!doctorId || !appointmentDate || !rawTimeSlot) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const payload = {
      patientId: patientCode,
      doctorId,
      appointmentDate,
      timeSlot: String(rawTimeSlot),
      symptomsInitial: String(body.symptomsInitial ?? body.symptoms ?? "").trim(),
      status: "WAITING",
    }

    const response = await fetch(`${BACKEND_API_BASE_URL}/appointments`, {
      method: "POST",
      headers: (() => {
        const headers = getAuthHeaders(request)
        headers.set("Content-Type", "application/json")
        return headers
      })(),
      body: JSON.stringify(payload),
    })

    const appointment = await parseBackendResponse<BackendAppointment>(response)
    return NextResponse.json(appointment, { status: 201 })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to create appointment" },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const id = body.id
    const status = body.status ?? "CANCELLED"

    if (!id) {
      return NextResponse.json({ error: "Missing appointment id" }, { status: 400 })
    }

    const headers = getAuthHeaders(request)
    const currentAppointment = await parseBackendResponse<BackendAppointment>(
      await fetch(`${BACKEND_API_BASE_URL}/appointments/${encodeURIComponent(String(id))}`, {
        method: "GET",
        headers,
        cache: "no-store",
      })
    )

    headers.set("Content-Type", "application/json")
    const response = await fetch(`${BACKEND_API_BASE_URL}/appointments/${encodeURIComponent(String(id))}`, {
      method: "PUT",
      headers,
      body: JSON.stringify({
        patientId: currentAppointment.patientId,
        doctorId: currentAppointment.doctorId,
        appointmentDate: currentAppointment.appointmentDate,
        timeSlot: currentAppointment.timeSlot,
        symptomsInitial: currentAppointment.symptomsInitial ?? "",
        status,
      }),
    })

    const appointment = await parseBackendResponse<BackendAppointment>(response)
    return NextResponse.json(appointment)
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to update appointment" },
      { status: 500 }
    )
  }
}

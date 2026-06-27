const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api/v1"

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const url = `${BASE_URL}${path}`
  
  let token = null
  if (typeof window !== "undefined") {
    token = localStorage.getItem("token")
  }

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...((options?.headers as Record<string, string>) || {}),
  }

  if (token) {
    headers["Authorization"] = `Bearer ${token}`
  }

  const response = await fetch(url, {
    ...options,
    headers,
  })

  const text = await response.text()
  let result: any = {}
  if (text) {
    try {
      result = JSON.parse(text)
    } catch (e) {
      console.warn("Response was not JSON:", text)
    }
  }

  if (!response.ok) {
    if (response.status === 401 || response.status === 403) {
      if (typeof window !== "undefined") {
        localStorage.removeItem("token")
        localStorage.removeItem("user")
      }
    }
    throw new Error(result.message || `Yêu cầu thất bại với mã lỗi ${response.status}`)
  }

  // API Backend bọc dữ liệu trong ApiResponse: { status, message, data, timestamp }
  return result.data as T
}

export const authApi = {
  login: (data: any) =>
    request<any>("/auth/login", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  register: (data: any) =>
    request<any>("/auth/register", {
      method: "POST",
      body: JSON.stringify(data),
    }),
}

export const specialtiesApi = {
  list: () => request<any[]>("/specialties"),
  get: (id: string | number) => request<any>(`/specialties/${id}`),
  create: (data: { name: string }) =>
    request<any>("/specialties", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  update: (id: string | number, data: { name: string }) =>
    request<any>(`/specialties/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  delete: (id: string | number) =>
    request<void>(`/specialties/${id}`, {
      method: "DELETE",
    }),
}

export const doctorsApi = {
  list: () => request<any[]>("/doctors"),
  get: (id: string | number) => request<any>(`/doctors/${id}`),
  getProfile: () => request<any>("/doctors/profile"),
  updateProfile: (data: any) =>
    request<any>("/doctors/profile", {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  create: (data: any) =>
    request<any>("/doctors", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  update: (id: string | number, data: any) =>
    request<any>(`/doctors/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  delete: (id: string | number) =>
    request<void>(`/doctors/${id}`, {
      method: "DELETE",
    }),
}

export const medicinesApi = {
  list: () => request<any[]>("/medicines"),
  get: (id: string | number) => request<any>(`/medicines/${id}`),
  create: (data: any) =>
    request<any>("/medicines", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  update: (id: string | number, data: any) =>
    request<any>(`/medicines/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  delete: (id: string | number) =>
    request<void>(`/medicines/${id}`, {
      method: "DELETE",
    }),
}

export const diseasesApi = {
  list: () => request<any[]>("/diseases"),
  get: (code: string) => request<any>(`/diseases/${code}`),
  create: (data: any) =>
    request<any>("/diseases", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  update: (code: string, data: any) =>
    request<any>(`/diseases/${code}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  delete: (code: string) =>
    request<void>(`/diseases/${code}`, {
      method: "DELETE",
    }),
}

export const treatmentTemplatesApi = {
  list: (params?: { icd10Code?: string }) => {
    const searchParams = new URLSearchParams()
    if (params?.icd10Code) searchParams.set("icd10Code", params.icd10Code)
    const query = searchParams.toString()
    return request<any[]>(`/admin/treatment-templates${query ? `?${query}` : ""}`)
  },
  get: (id: string | number) => request<any>(`/admin/treatment-templates/${id}`),
  create: (data: any) =>
    request<any>("/admin/treatment-templates", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  update: (id: string | number, data: any) =>
    request<any>(`/admin/treatment-templates/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  delete: (id: string | number) =>
    request<void>(`/admin/treatment-templates/${id}`, {
      method: "DELETE",
    }),
}

export const patientsApi = {
  list: () => request<any[]>("/patients"),
  get: (id: string | number) => request<any>(`/patients/${id}`),
  create: (data: any) =>
    request<any>("/patients", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  update: (id: string | number, data: any) =>
    request<any>(`/patients/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  delete: (id: string | number) =>
    request<void>(`/patients/${id}`, {
      method: "DELETE",
    }),
}

export const appointmentsApi = {
  list: () => request<any[]>("/appointments"),
  get: (id: string | number) => request<any>(`/appointments/${id}`),
  create: (data: any) =>
    request<any>("/appointments", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  update: (id: string | number, data: any) =>
    request<any>(`/appointments/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  delete: (id: string | number) =>
    request<void>(`/appointments/${id}`, {
      method: "DELETE",
    }),
}

export const schedulesApi = {
  list: (params?: { doctorId?: string | number; date?: string; fromDate?: string; toDate?: string }) => {
    const searchParams = new URLSearchParams()
    if (params?.doctorId) searchParams.set("doctorId", String(params.doctorId))
    if (params?.date) searchParams.set("date", params.date)
    if (params?.fromDate) searchParams.set("fromDate", params.fromDate)
    if (params?.toDate) searchParams.set("toDate", params.toDate)
    const query = searchParams.toString()
    return request<any[]>(`/admin/schedules${query ? `?${query}` : ""}`)
  },
  get: (id: string | number) => request<any>(`/admin/schedules/${id}`),
  create: (data: any) =>
    request<any>("/admin/schedules", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  update: (id: string | number, data: any) =>
    request<any>(`/admin/schedules/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  delete: (id: string | number) =>
    request<void>(`/admin/schedules/${id}`, {
      method: "DELETE",
    }),
  bulk: (data: any[]) =>
    request<any[]>("/admin/schedules/bulk", {
      method: "POST",
      body: JSON.stringify(data),
    }),
}

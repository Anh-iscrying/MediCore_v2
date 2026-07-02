import { cookies } from "next/headers"
import { NextResponse } from "next/server"

export async function GET() {
  const accessToken = (await cookies()).get("accessToken")?.value

  if (!accessToken) {
    return NextResponse.json({ token: null }, { status: 401 })
  }

  return NextResponse.json({ token: accessToken })
}

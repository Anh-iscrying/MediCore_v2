import { NextResponse } from "next/server"
import { readDB } from "@/lib/db"

export async function GET() {
  try {
    const db = readDB()
    return NextResponse.json(db.doctors)
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch doctors" }, { status: 500 })
  }
}

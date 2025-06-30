import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"

import { generateToken, incrementUserActiveApiCount } from "@/lib/api-utils"

import { authOptions } from "../../auth/authOptions"

export async function POST() {
  const session = await getServerSession(authOptions)

  if (!session || !session.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const result = await generateToken()

  if (result?.token && result?.tokenHash) {
    // Increment user's active_api_count here, where you have the user ID
    await incrementUserActiveApiCount(session.user.id)
  }
  return NextResponse.json(result)
}

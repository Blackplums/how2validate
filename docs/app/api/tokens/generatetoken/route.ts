import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"

import { generateToken } from "@/lib/api-utils"

import { authOptions } from "../../auth/authOptions"

export async function POST() {
  const session = await getServerSession(authOptions)

  if (!session || !session.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const result = await generateToken()

  return NextResponse.json(result)
}

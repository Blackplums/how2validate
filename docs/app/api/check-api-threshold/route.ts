import { NextRequest, NextResponse } from "next/server"

import { isUserUnderApiThreshold } from "@/lib/api-utils"

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const userId = searchParams.get("userId")

  if (!userId) {
    return NextResponse.json({ error: "Missing userId" }, { status: 400 })
  }

  const allowed = await isUserUnderApiThreshold(userId)
  return NextResponse.json(allowed)
}

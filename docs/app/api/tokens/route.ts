import { NextResponse } from "next/server"
import TokenStoreModel from "@/models/TokenStore"

// import Token from "@/models/Token"

import connectToDB from "@/lib/mongodb"

// GET /api/token?userId=123
export async function GET(req: Request) {
  await connectToDB()

  const { searchParams } = new URL(req.url)
  const userId = searchParams.get("userId")

  if (!userId) {
    return NextResponse.json(
      { status: 400, error: "Missing userId" },
      { status: 400 }
    )
  }

  const tokens = await TokenStoreModel.find({ user_id: userId })
  return NextResponse.json(tokens)
}

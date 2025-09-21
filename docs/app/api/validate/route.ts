import { NextRequest, NextResponse } from "next/server"

import {
  incrementTokenUsage,
  isTokenUnderDailyReportThreshold,
  updateTokenLastUsedAt,
  validateUserToken,
} from "@/lib/api-utils"

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization")

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return NextResponse.json(
      {
        status: 401,
        error: "Missing or invalid Authorization header",
      },
      { status: 401 }
    )
  }

  const token = authHeader.replace("Bearer ", "").trim()
  if (!token) {
    return NextResponse.json({ error: "Token is required" }, { status: 400 })
  }
  // Validate the token
  const validationRes = await validateUserToken(token)

  if (!validationRes) {
    return NextResponse.json(
      {
        status: 403,
        error:
          "Invalid/ Expired API Token. See https://how2validate.vercel.app/apitoken for details.",
      },
      { status: 403 }
    )
  }

  if (!validationRes.token) {
    return NextResponse.json(
      {
        status: 400,
        error: "Token not found in records.",
      },
      { status: 400 }
    )
  }

  // Check reporting threshold for this token
  const underThreshold = await isTokenUnderDailyReportThreshold(
    validationRes.userId,
    validationRes.token.token_hash
  )

  // Increment usage counts
  if (validationRes.token?.token_hash) {
    await incrementTokenUsage(
      validationRes.userId,
      validationRes.token.token_hash
    )
    await updateTokenLastUsedAt(
      validationRes.userId,
      validationRes.token.token_hash
    )
  }

  return NextResponse.json({
    status: 200,
    userId: validationRes.userId,
    tokenId: validationRes.tokenId,
    isTokenUnderDailyReportThreshold: underThreshold,
  })
}

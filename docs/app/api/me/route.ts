import { NextRequest, NextResponse } from "next/server"

import { Token } from "@/types/pa-token"
import {
  incrementTokenUsage,
  updateTokenLastUsedAt,
  validateUserToken,
} from "@/lib/api-utils"

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization")

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return NextResponse.json(
      { status: 401, error: "Missing or invalid Authorization header" },
      { status: 401 }
    )
  }

  const token = authHeader.replace("Bearer ", "").trim()
  if (!token) {
    return NextResponse.json(
      { status: 400, error: "Token is required" },
      { status: 400 }
    )
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
      { status: 400, error: "Token not found in validation result." },
      { status: 400 }
    )
  }

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

  // Remove sensitive fields from the token object
  // This is to ensure we don't expose sensitive information in the response
  const safeTokenObj = validationRes.token as Token
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { token_hash, previous_hash, ...safeToken } = safeTokenObj

  return NextResponse.json({
    status: 200,
    userId: validationRes.userId,
    tokenId: validationRes.tokenId,
    user: validationRes.user,
    token: safeToken,
  })
}

import { NextRequest, NextResponse } from "next/server"

import {
  incrementTokenUsage,
  updateTokenLastUsedAt,
  validateUserToken,
} from "@/lib/api-utils"

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization")
  const publicKey = process.env.PUBLIC_KEY

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return NextResponse.json(
      { error: "Missing or invalid Authorization header" },
      { status: 401 }
    )
  }

  const token = authHeader.replace("Bearer ", "").trim()
  if (!token) {
    return NextResponse.json({ error: "Token is required" }, { status: 400 })
  }

  // Use your utility to validate the token
  const validationRes = await validateUserToken(token)

  if (!validationRes) {
    return NextResponse.json(
      {
        error:
          "Invalid API Token. See https://how2validate.vercel.app/apitoken for details.",
      },
      { status: 403 }
    )
  }

  if (!publicKey) {
    return NextResponse.json(
      { error: "Public key not configured" },
      { status: 500 }
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

  return NextResponse.json({
    status: true,
    key: publicKey,
  })
}

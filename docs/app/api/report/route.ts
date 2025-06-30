import { NextRequest, NextResponse } from "next/server"

import {
  incrementReportUsage,
  incrementUserReportingCount,
  isTokenUnderDailyReportThreshold,
  validateUserToken,
} from "@/lib/api-utils"
import { sendEmail } from "@/lib/report-utils"

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization")

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
  // Validate the token
  const validationRes = await validateUserToken(token)

  if (
    !validationRes ||
    !validationRes.token ||
    !validationRes.token.token_hash
  ) {
    return NextResponse.json(
      {
        error:
          "Invalid/ Expired API Token. See https://how2validate.vercel.app/apitoken for details.",
      },
      { status: 403 }
    )
  }

  // Check reporting threshold for this token
  const underThreshold = await isTokenUnderDailyReportThreshold(
    validationRes.userId,
    validationRes.token.token_hash
  )
  if (!underThreshold) {
    return NextResponse.json(
      { error: "Daily report limit reached for this token." },
      { status: 429 }
    )
  }

  // Increment usage counts
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let emailRes: any = null
  let emailSuccess = false
  if (validationRes.token?.token_hash && underThreshold) {
    const emailResponse = {
      email: validationRes.token.token_email,
      provider: "How2Validate",
      state: "Validated",
      service: "API Token",
      response:
        "Your API token has been successfully validated and is ready for use.",
    }

    try {
      emailRes = await sendEmail(emailResponse)
      emailSuccess = true
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (e: any) {
      let details = "Error sending report"
      if (e?.message && e.message.trim()) {
        try {
          details = JSON.parse(e.message)
        } catch {
          details = e.message.trim()
        }
      }
      return NextResponse.json(
        { status: false, error: "Failed to send email", details },
        { status: 500 }
      )
    }

    await incrementReportUsage(
      validationRes.userId,
      validationRes.token.token_hash
    )
    await incrementUserReportingCount(validationRes.userId)
  }

  return NextResponse.json({
    status: emailSuccess,
    message: emailSuccess ? "Report sent successfully." : "Report not sent.",
    response: emailRes && (await emailRes.json?.()),
  })
}

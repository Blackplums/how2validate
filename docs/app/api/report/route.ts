import crypto from "crypto"

import { NextRequest, NextResponse } from "next/server"

import {
  incrementReportUsage,
  incrementUserReportingCount,
  isTokenUnderDailyReportThreshold,
  validateUserToken,
} from "@/lib/api-utils"
import { sendEmail } from "@/lib/report-utils"

export const config = {
  api: {
    bodyParser: {
      sizeLimit: "5mb",
    },
  },
}

export async function POST(req: NextRequest) {
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

  if (
    !validationRes ||
    !validationRes.token ||
    !validationRes.token.token_hash
  ) {
    return NextResponse.json(
      {
        status: 403,
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
      { status: 429, error: "Daily report limit reached for this token." },
      { status: 429 }
    )
  }

  // Increment usage counts
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let emailRes: any = null
  let emailSuccess = false
  if (validationRes.token?.token_hash && underThreshold) {
    let reporting_data
    try {
      const body = await req.json()
      const { encrypted_data } = body
      const { key, iv, data } = encrypted_data

      const privateKeyPem = process.env.PRIVATE_KEY?.replace(/\\n/g, "\n")
      if (!privateKeyPem) {
        return NextResponse.json(
          { status: 500, error: "Missing server private key" },
          { status: 500 }
        )
      }

      const privateKey = crypto.createPrivateKey({
        key: privateKeyPem,
        format: "pem",
      })

      const decryptedKey = crypto.privateDecrypt(
        {
          key: privateKey,
          padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
          oaepHash: "sha256",
        },
        Buffer.from(key, "base64")
      )

      const decipher = crypto.createDecipheriv(
        "aes-256-cbc",
        decryptedKey,
        Buffer.from(iv, "base64")
      )

      const aesDecrypted = Buffer.concat([
        decipher.update(Buffer.from(data, "base64")),
        decipher.final(), // Handles PKCS#7 padding automatically
      ])

      let rawDecrypted = aesDecrypted.toString("utf-8")

      // Append username to the JSON string
      try {
        const toEmailAddress = validationRes.token.token_email
        // Parse JSON, append username, and re-stringify
        const tempData = JSON.parse(rawDecrypted)
        tempData.email = toEmailAddress
        rawDecrypted = JSON.stringify(tempData)
      } catch {
        return NextResponse.json(
          {
            status: 500,
            error: "Invalid JSON in decrypted data or modification failed",
          },
          { status: 500 }
        )
      }

      // Parse JSON
      try {
        reporting_data = JSON.parse(rawDecrypted)
      } catch {
        return NextResponse.json(
          { status: 500, error: "Invalid JSON in decrypted data" },
          { status: 500 }
        )
      }

      // Process decrypted data
      try {
        emailRes = await sendEmail(reporting_data)
        emailSuccess = true
      } catch (e: unknown) {
        let details = "Error sending report"
        const errorMessage =
          typeof e === "object" &&
          e !== null &&
          "message" in e &&
          typeof (e as { message?: string }).message === "string"
            ? (e as { message: string }).message
            : ""
        if (errorMessage.trim()) {
          try {
            details = JSON.parse(errorMessage)
          } catch {
            details = errorMessage.trim()
          }
        }
        return NextResponse.json(
          { status: 500, error: "Failed to send email", details },
          { status: 500 }
        )
      }

      await incrementReportUsage(
        validationRes.userId,
        validationRes.token.token_hash
      )
      await incrementUserReportingCount(validationRes.userId)
    } catch (err) {
      let errorMsg = "Decryption failed"
      if (
        typeof err === "object" &&
        err !== null &&
        "message" in err &&
        typeof (err as { message?: string }).message === "string"
      ) {
        errorMsg = `Decryption failed: ${(err as { message: string }).message}`
      }
      return NextResponse.json({ error: errorMsg }, { status: 500 })
    }
  }

  return NextResponse.json({
    status: 200,
    message: emailSuccess ? "Report sent successfully." : "Report not sent.",
    response: emailRes && (await emailRes.json?.()),
  })
}

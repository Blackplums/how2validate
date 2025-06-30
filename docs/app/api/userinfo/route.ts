import { NextRequest, NextResponse } from "next/server"
import TokenStore from "@/models/TokenStore"
import User from "@/models/User"

import dbConnect from "@/lib/mongodb"

export async function GET(req: NextRequest) {
  const userId = req.nextUrl.searchParams.get("userId")
  if (!userId)
    return NextResponse.json({ error: "Missing userId" }, { status: 400 })

  await dbConnect()
  const user = await User.findOne({ id: userId })
  if (!user)
    return NextResponse.json({ error: "User not found" }, { status: 404 })

  // Fetch tokens and sum usage_count
  const tokenStore = await TokenStore.findOne({ user_id: userId })
  const tokenCall =
    tokenStore?.tokens?.reduce((sum, t) => sum + (t.usage_count ?? 0), 0) ?? 0

  return NextResponse.json({
    name: user.name,
    email: user.email,
    image: user.avatar_url,
    reportsSent: user.usage?.total_email_reported ?? 0,
    maxReports: user.subscription?.email_per_day_threshold ?? 0,
    tokenCall: tokenCall,
    activeToken: user.usage?.active_api_count ?? 0,
    maxTokens: user.subscription?.api_threshold ?? 0,
    plan: user.subscription?.plan ?? "Pro-Free",
  })
}

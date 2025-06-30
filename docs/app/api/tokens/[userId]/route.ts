import { NextRequest, NextResponse } from "next/server"
import TokenStore from "@/models/TokenStore"

import { Token } from "@/types/pa-token"
import { decrementUserActiveApiCount } from "@/lib/api-utils"
import dbConnect from "@/lib/mongodb"

// CREATE or UPDATE a token for a user
export async function POST(
  req: NextRequest,
  context: { params: Promise<{ userId: string }> }
) {
  const { userId } = await context.params
  const token: Token = await req.json()

  if (!userId || !token || !token.token_hash) {
    return NextResponse.json(
      { error: "Missing userId or token_hash" },
      { status: 400 }
    )
  }

  await dbConnect()

  // Try to update existing token in the array
  const updated = await TokenStore.findOneAndUpdate(
    {
      user_id: userId,
      "tokens.token_hash": token.previous_hash || token.token_hash,
    },
    {
      $set: {
        "tokens.$": token,
      },
    },
    { new: true }
  )

  // If not found, push as new token
  if (!updated) {
    const result = await TokenStore.findOneAndUpdate(
      { user_id: userId },
      { $push: { tokens: token } },
      { upsert: true, new: true }
    )
    return NextResponse.json(result)
  }

  return NextResponse.json(updated)
}

// GET all tokens for a user
export async function GET(
  req: NextRequest,
  context: { params: Promise<{ userId: string }> }
) {
  const { userId } = await context.params
  await dbConnect()
  const result = await TokenStore.findOne({ user_id: userId })
  return NextResponse.json(result?.tokens || [])
}

// DELETE a token by token_hash for a user
export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ userId: string }> }
) {
  const { userId } = await context.params
  const { token_hash } = await req.json()

  if (!userId || !token_hash) {
    return NextResponse.json(
      { error: "Missing userId or token_hash" },
      { status: 400 }
    )
  }

  await dbConnect()

  const userBefore = await TokenStore.findOne({ user_id: userId })
  const result = await TokenStore.findOneAndUpdate(
    { user_id: userId },
    { $pull: { tokens: { token_hash } } },
    { new: true }
  )

  const tokenWasDeleted =
    userBefore &&
    userBefore.tokens.some((t) => t.token_hash === token_hash) &&
    result &&
    result.tokens.length < userBefore.tokens.length

  if (tokenWasDeleted) {
    await decrementUserActiveApiCount(userId)
  }

  return NextResponse.json(result)
}

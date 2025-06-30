import TokenStoreModel from "@/models/TokenStore"
import User from "@/models/User"

import dbConnect from "../mongodb"

// Helper: SHA-256 hash to hex using Web Crypto API (works in browser and Node 20+)
export async function sha256Hex(token: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(token)
  const hashBuffer = await (globalThis.crypto as Crypto).subtle.digest(
    "SHA-256",
    data
  )
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("")
}

// Check if a tokenHash is unique across all users (MongoDB)
async function isTokenHashUnique(tokenHash: string): Promise<boolean> {
  await dbConnect()
  const exists = await TokenStoreModel.findOne({
    tokens: {
      $elemMatch: {
        token_hash: tokenHash,
      },
    },
  })

  return !exists
}

/**
 * Check if user's active_api_count is less than or equal to their subscription.api_threshold.
 * Returns true if allowed, false if limit reached/exceeded.
 */
export async function isUserUnderApiThreshold(
  userId: string
): Promise<boolean> {
  await dbConnect()
  const user = await User.findOne(
    { id: userId },
    { "usage.active_api_count": 1, "subscription.api_threshold": 1 }
  )

  if (!user) return false

  const activeCount = user.usage?.active_api_count ?? 0
  const threshold = user.subscription?.api_threshold ?? 0

  return activeCount < threshold
}

/**
 * Check if a specific token's daily email report usage is under the user's subscription.email_per_day_threshold.
 * Returns true if allowed, false if limit reached/exceeded.
 */
export async function isTokenUnderDailyReportThreshold(
  userId: string,
  tokenHash: string
): Promise<boolean> {
  await dbConnect()

  // Get the user's threshold
  const user = await User.findOne(
    { id: userId },
    { "subscription.email_per_day_threshold": 1 }
  )
  if (!user) return false
  const threshold = user.subscription?.email_per_day_threshold ?? 0

  // Find the token and check its daily email usage
  const tokenStore = await TokenStoreModel.findOne(
    { user_id: userId, "tokens.token_hash": tokenHash },
    { "tokens.$": 1 }
  )
  const token = tokenStore?.tokens?.[0]
  const emailsToday = token?.usage?.day?.email ?? 0

  return emailsToday < threshold
}

// Generate a unique token (guaranteed unique in DB)
export async function generateToken(): Promise<{
  token: string
  tokenHash: string
}> {
  while (true) {
    // Generate a secure random token
    const array = new Uint8Array(24)
    ;(globalThis.crypto as Crypto).getRandomValues(array)
    const token =
      "h2v-" +
      Array.from(array)
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("")
    const tokenHash = await sha256Hex(token)
    const unique = await isTokenHashUnique(tokenHash)
    if (unique) return { token, tokenHash }
  }
}

// Get user by ID
export async function getUserById(userId: string) {
  // Assumes userId is stored in the "id" field of your User model
  return User.findOne({ id: userId })
}

// Validate a user token by its token
export async function validateUserToken(token: string) {
  await dbConnect()
  const tokenHash = await sha256Hex(token)

  // Find user with an active token matching this hash
  const userTokens = await TokenStoreModel.findOne({
    tokens: {
      $elemMatch: {
        token_hash: tokenHash,
        isActive: true,
      },
    },
  }).lean()

  if (!userTokens) return null

  const userData = await getUserById(userTokens.user_id)
  if (!userData) return null

  // Find the specific token object (to get its unique _id)
  const matchedToken = userTokens.tokens.find(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (t: any) => t.token_hash === tokenHash && t.isActive
  )

  return {
    userId: userTokens.user_id,
    tokenId: matchedToken?.token_name,
    // tokenId: matchedToken?._id,
    user: userData,
    token: matchedToken,
  }
}

export async function updateTokenLastUsedAt(userId: string, tokenHash: string) {
  await dbConnect()
  await TokenStoreModel.updateOne(
    {
      user_id: userId,
      "tokens.token_hash": tokenHash,
    },
    {
      $set: {
        "tokens.$.last_used_at": Date.now(),
      },
    }
  )
}

/**
 * Increment token usage (day.api, total.api) and user's active_api_count.
 */
export async function incrementTokenUsage(userId: string, tokenHash: string) {
  await dbConnect()

  // Update token usage
  await TokenStoreModel.updateOne(
    {
      user_id: userId,
      "tokens.token_hash": tokenHash,
    },
    {
      $inc: {
        "tokens.$.usage_count": 1,
        "tokens.$.usage.day.api": 1,
        "tokens.$.usage.total.api": 1,
      },
    }
  )
}

/**
 * Increment user's usage.active_api_count by 1.
 */
export async function incrementUserActiveApiCount(userId: string) {
  await dbConnect()
  await User.updateOne(
    { id: userId },
    { $inc: { "usage.active_api_count": 1 } }
  )
}

/**
 * Decrement user's usage.active_api_count by 1 (minimum 0).
 */
export async function decrementUserActiveApiCount(userId: string) {
  await dbConnect()
  await User.updateOne({ id: userId }, [
    {
      $set: {
        "usage.active_api_count": {
          $max: [{ $subtract: ["$usage.active_api_count", 1] }, 0],
        },
      },
    },
  ])
}

/**
 * Increment token usage for report generation (day.email, total.email).
 * Also updates last_used_at timestamp.
 */
export async function incrementReportUsage(userId: string, tokenHash: string) {
  await dbConnect()

  // Update token usage
  await TokenStoreModel.updateOne(
    {
      user_id: userId,
      "tokens.token_hash": tokenHash,
    },
    {
      $set: {
        "tokens.$.last_used_at": Date.now(),
      },
      $inc: {
        "tokens.$.usage_count": 1,
        "tokens.$.usage.day.email": 1,
        "tokens.$.usage.total.email": 1,
      },
    }
  )
}

/**
 * Increment user's email reporting counts (day and total).
 * This is separate from token usage since it tracks user actions.
 */
export async function incrementUserReportingCount(userId: string) {
  await dbConnect()
  await User.updateOne(
    { id: userId },
    {
      $inc: {
        "usage.email_reported_today": 1,
        "usage.total_email_reported": 1,
      },
    }
  )
}

// models/TokenStore.ts
import mongoose, { Document, Model, Schema } from "mongoose"

import { Token } from "@/types/pa-token"

interface TokenDocument extends Token, Document {}
interface TokenStoreDocument extends Document {
  user_id: string
  tokens: Token[]
}

const TokenUsageSchema = new Schema({
  day: {
    api: { type: Number, default: 0 },
    email: { type: Number, default: 0 },
  },
  total: {
    api: { type: Number, default: 0 },
    email: { type: Number, default: 0 },
  },
})

const TokenSchema = new Schema<TokenDocument>(
  {
    token_name: { type: String, required: true },
    token_hash: { type: String, required: true },
    previous_hash: { type: String },
    token_email: { type: String, required: true },
    usage_count: { type: Number, default: 0 },
    last_used_at: { type: Date, default: Date.now },
    created_at: { type: Date, default: Date.now },
    expires_at: { type: Date },
    isActive: { type: Boolean, default: true },
    usage: { type: TokenUsageSchema },
  },
  { collection: "Token" }
)

const TokenStoreSchema = new Schema<TokenStoreDocument>(
  {
    user_id: { type: String, required: true, unique: true },
    tokens: { type: [TokenSchema], default: [] },
  },
  { collection: "Token" }
)

const TokenStoreModel: Model<TokenStoreDocument> =
  (mongoose.models && mongoose.models.TokenStore) ||
  mongoose.model<TokenStoreDocument>("TokenStore", TokenStoreSchema, "Token")

export default TokenStoreModel

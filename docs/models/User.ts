import mongoose, { Document, Schema } from "mongoose"

export interface IUser extends Document {
  github_email: string
  avatar_url: string
  github_username: string
  last_logged_in: Date
  created_at: Date
  expires_at: Date
  isActive: boolean
  subscription: {
    plan: string
    api_threshold: number
    email_per_day_threshold: number
    is_banned: boolean
    expires_at: Date
  }
  usage: {
    active_api_count: number
    email_reported_today: number
    total_email_reported: number
  }
  id: string
}

const UserSchema = new Schema<IUser>(
  {
    github_email: { type: String, required: true },
    avatar_url: { type: String, default: "" },
    github_username: { type: String, required: true },
    last_logged_in: { type: Date, default: Date.now },
    created_at: { type: Date, default: Date.now },
    expires_at: {
      type: Date,
      required: true,
      default: () =>
        new Date(new Date().setFullYear(new Date().getFullYear() + 1)),
    },
    isActive: { type: Boolean, default: true },
    subscription: {
      plan: { type: String, default: "Pro-Free" },
      api_threshold: { type: Number, default: 5 },
      email_per_day_threshold: { type: Number, default: 10 },
      is_banned: { type: Boolean, default: false },
      expires_at: {
        type: Date,
        required: true,
        default: () =>
          new Date(new Date().setFullYear(new Date().getFullYear() + 1)),
      },
    },
    usage: {
      active_api_count: { type: Number, default: 0 },
      email_reported_today: { type: Number, default: 0 },
      total_email_reported: { type: Number, default: 0 },
    },
    id: { type: String, required: true, unique: true },
  },
  { collection: "User" }
)

export default (mongoose.models && mongoose.models.User) ||
  mongoose.model<IUser>("User", UserSchema)

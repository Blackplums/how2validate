import User from "@/models/User"
import type { NextAuthOptions } from "next-auth"
import GitHubProvider from "next-auth/providers/github"

import dbConnect from "@/lib/mongodb"

export const authOptions: NextAuthOptions = {
  providers: [
    GitHubProvider({
      clientId: process.env.GITHUB_ID!,
      clientSecret: process.env.GITHUB_SECRET!,
    }),
  ],
  callbacks: {
    async session({ session, token }) {
      if (session.user && token.sub) {
        session.user.id = token.sub // token.sub contains the user ID
      }
      return session
    },
    async signIn({ user }) {
      await dbConnect()

      await User.findOneAndUpdate(
        { id: user.id },
        {
          $set: {
            last_logged_in: Date.now(),
          },
          $setOnInsert: {
            id: user.id,
            github_username: user.name,
            github_email: user.email,
            avatar_url: user.image,
          },
        },
        { upsert: true }
      )
      return true
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
}

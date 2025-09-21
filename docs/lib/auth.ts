// lib/auth.ts
import NextAuth, { Session } from "next-auth"
import { JWT } from "next-auth/jwt"
import GitHubProvider from "next-auth/providers/github"

export const authOptions = {
  providers: [
    GitHubProvider({
      clientId: process.env.GITHUB_ID!,
      clientSecret: process.env.GITHUB_SECRET!,
    }),
  ],
  callbacks: {
    async session({ session, token }: { session: Session; token: JWT }) {
      // Make sure session is returned
      if (session.user && token.sub) {
        session.user.id = token.sub // token.sub contains the user ID
      }
      return session
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
}

const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }

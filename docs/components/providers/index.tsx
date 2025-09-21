"use client"

import React from "react"
import { SessionProvider } from "next-auth/react"
import { Toaster } from "sonner"

import { ViewTransitions } from "@/lib/transition"
import { ThemeProvider } from "@/components/providers/theme"

export const Providers: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  return (
    <>
      <SessionProvider>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <ViewTransitions>{children}</ViewTransitions>
        </ThemeProvider>
      </SessionProvider>
      <Toaster expand={true} richColors position="top-right" closeButton />
    </>
  )
}

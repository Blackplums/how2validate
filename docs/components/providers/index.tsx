"use client"

import React from "react"
import { SessionProvider } from "next-auth/react"
import { ClientToastProvider } from "vyrn"

import { ViewTransitions } from "@/lib/transition"
import { ThemeProvider } from "@/components/providers/theme"

export const Providers: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  return (
    <ClientToastProvider
      position="top-right"
      swipeDirection="right"
      maxToasts={5}
      layout="normal"
      showCloseButton={true}
      showProgressBar={false}
      color={true}
    >
      <SessionProvider>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <ViewTransitions>{children}</ViewTransitions>
        </ThemeProvider>
      </SessionProvider>
    </ClientToastProvider>
  )
}

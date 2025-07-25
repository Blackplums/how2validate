import type { Metadata } from "next"
import {
  Inter as FontSans,
  League_Spartan as LeagueSpartan,
  Nunito_Sans as Nunito,
} from "next/font/google"
import localFont from "next/font/local"
import { GoogleTagManager } from "@next/third-parties/google"

import { Settings } from "@/lib/meta"
import { Footer } from "@/components/navigation/footer"
import { Navbar } from "@/components/navigation/navbar"
import { Providers } from "@/components/providers"

import "@/styles/globals.css"

const fontSans = FontSans({
  subsets: ["latin"],
  variable: "--font-sans",
})

const nunitoSans = Nunito({
  subsets: ["latin"],
  variable: "--font-regular",
})

const leagueSpartan = LeagueSpartan({
  subsets: ["latin"],
  variable: "--font-normal",
})

const fontHeading = localFont({
  src: "./assets/fonts/CalSans-SemiBold.woff2",
  variable: "--font-heading",
})

const baseUrl = Settings.metadataBase

export const metadata: Metadata = {
  title: Settings.title,
  metadataBase: new URL(baseUrl),
  description: Settings.description,
  keywords: Settings.keywords,
  openGraph: {
    type: Settings.openGraph.type,
    url: baseUrl,
    title: Settings.openGraph.title,
    description: Settings.openGraph.description,
    siteName: Settings.openGraph.siteName,
    images: Settings.openGraph.images.map((image) => ({
      ...image,
      url: `${baseUrl}${image.url}`,
    })),
  },
  twitter: {
    card: Settings.twitter.card,
    title: Settings.twitter.title,
    description: Settings.twitter.description,
    site: Settings.twitter.site,
    images: Settings.twitter.images.map((image) => ({
      ...image,
      url: `${baseUrl}${image.url}`,
    })),
  },
  alternates: {
    canonical: baseUrl,
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      {Settings.gtmconnected && <GoogleTagManager gtmId={Settings.gtm} />}
      <body
        className={`${fontSans.variable} ${fontHeading.variable} ${nunitoSans.variable} ${leagueSpartan.variable} font-regular`}
      >
        <Providers>
          <Navbar />
          <main className="h-auto px-5 sm:px-8">{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  )
}

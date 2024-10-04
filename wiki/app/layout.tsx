import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";


const spaceGrotesk = localFont({
  src: "./fonts/SpaceGrotesk/SpaceGrotesk-VF.ttf",
  variable: "--font-spaceGrotesk",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "How2Validate",
  description: "A CLI tool to validate secrets for different services.",
  abstract: "A CLI tool to validate secrets for different services.",
  applicationName: "How2Validate",
  authors:[{ name: "BlackPlum Team", url: "https://github.com/Blackplums" }],
  creator: "BlackPlum Team",
  keywords: [
    "secret validation",
    "secret CLI tool",
    "how to validate",
    "security",
    "passwords",
    "API keys",
    "tokens"
  ],
  openGraph: {
    type: "website",
    title: "How2Validate",
    siteName: "How2Validate",
    description: "A CLI tool to validate secrets for different services.",
    url: "https://how2validate.com",
    images: [{
      url: "./img/How2Validate.png",
    }],
  },
  twitter: {
    card: "summary_large_image",
    title: "How2Validate",
    description: "A CLI tool to validate secrets for different services.",
    site: "@site", 
    creator: "@creator", 
    images: "./img/How2Validate.png"
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${spaceGrotesk.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}

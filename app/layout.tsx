import type React from "react"
import type { Metadata } from "next"
import { ThemeProvider } from "@/components/theme-provider"
import "./globals.css"

export const metadata: Metadata = {
  title: "DIU CSE Learning Platform",
  description: "Modern learning platform for DIU CSE students",
  viewport: "width=device-width, initial-scale=1",
  applicationName: "DIU CSE Learning Platform",
  authors: [{ name: "DIU CSE Department" }],
  keywords: ["learning", "education", "DIU", "CSE", "platform"],
  openGraph: {
    title: "DIU CSE Learning Platform",
    description: "Modern learning platform for DIU CSE students",
    type: "website",
  },
  twitter: {
    title: "DIU CSE Learning Platform",
    description: "Modern learning platform for DIU CSE students",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="icon" href="/placeholder-logo.svg" />
      </head>
      <body className="min-h-screen bg-background text-foreground font-sans antialiased">
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange={false}>
          <div className="relative flex min-h-screen flex-col">{children}</div>
        </ThemeProvider>
      </body>
    </html>
  )
}

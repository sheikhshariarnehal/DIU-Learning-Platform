import type React from "react"
import type { Metadata } from "next"
import { ThemeProvider } from "@/components/theme-provider"
import "./globals.css"

export const metadata: Metadata = {
  title: {
    default: "DIU CSE Learning Platform",
    template: "%s | DIU CSE Learning Platform"
  },
  description: "Modern learning platform for DIU CSE students",
  viewport: "width=device-width, initial-scale=1",
  applicationName: "DIU CSE Learning Platform",
  authors: [{ name: "DIU CSE Department" }],
  keywords: ["learning", "education", "DIU", "CSE", "platform"],
  generator: "DIU CSE Learning Platform",
  creator: "DIU CSE Department",
  publisher: "DIU CSE Department",
  robots: "index, follow",
  openGraph: {
    title: "DIU CSE Learning Platform",
    description: "Modern learning platform for DIU CSE students",
    type: "website",
    siteName: "DIU CSE Learning Platform",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "DIU CSE Learning Platform",
    description: "Modern learning platform for DIU CSE students",
    creator: "@DIU_CSE",
  },
  metadataBase: new URL('https://diu-learning.vercel.app'),
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
        <meta name="application-name" content="DIU CSE Learning Platform" />
        <meta name="generator" content="DIU CSE Learning Platform" />
        <meta name="creator" content="DIU CSE Department" />
        <meta name="publisher" content="DIU CSE Department" />
        <meta property="og:title" content="DIU CSE Learning Platform" />
        <meta property="og:description" content="Modern learning platform for DIU CSE students" />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="DIU CSE Learning Platform" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="DIU CSE Learning Platform" />
        <meta name="twitter:description" content="Modern learning platform for DIU CSE students" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="icon" href="/images/diu-logo.png" />
        <link rel="apple-touch-icon" href="/images/diu-logo.png" />
      </head>
      <body className="min-h-screen bg-background text-foreground font-sans antialiased">
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange={false}>
          <div className="relative flex min-h-screen flex-col">{children}</div>
        </ThemeProvider>
      </body>
    </html>
  )
}

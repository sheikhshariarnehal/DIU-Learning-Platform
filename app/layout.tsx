import type React from "react"
import type { Metadata } from "next"
import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/next'
import { ThemeProvider } from "@/components/theme-provider"
import "./globals.css"

export const metadata: Metadata = {
  title: {
    default: "DIU Learning Platform",
    template: "%s | DIU Learning Platform"
  },
  description: "Smart learning platform for DIU CSE students",
  viewport: "width=device-width, initial-scale=1",
  applicationName: "DIU Learning Platform",
  authors: [{ name: "DIU CSE Department" }],
  keywords: ["learning", "education", "DIU", "CSE", "platform", "smart", "online"],
  generator: "DIU Learning Platform",
  creator: "DIU CSE Department",
  publisher: "DIU CSE Department",
  robots: "index, follow",
  openGraph: {
    title: "DIU Learning Platform",
    description: "Smart learning platform for DIU CSE students",
    type: "website",
    siteName: "DIU Learning Platform",
    locale: "en_US",
    url: "https://diu-learning.vercel.app",
    images: [
      {
        url: "/images/diu-logo.png",
        width: 1200,
        height: 630,
        alt: "DIU Learning Platform",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "DIU Learning Platform",
    description: "Smart learning platform for DIU CSE students",
    creator: "@DIU_CSE",
    images: ["/images/diu-logo.png"],
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
        <meta name="application-name" content="DIU Learning Platform" />
        <meta name="generator" content="DIU Learning Platform" />
        <meta name="creator" content="DIU CSE Department" />
        <meta name="publisher" content="DIU CSE Department" />
        <meta property="og:title" content="DIU Learning Platform" />
        <meta property="og:description" content="Smart learning platform for DIU CSE students" />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="DIU Learning Platform" />
        <meta property="og:url" content="https://diu-learning.vercel.app" />
        <meta property="og:image" content="https://diu-learning.vercel.app/images/diu-logo.png" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:image:alt" content="DIU Learning Platform" />
        <meta property="og:locale" content="en_US" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="DIU Learning Platform" />
        <meta name="twitter:description" content="Smart learning platform for DIU CSE students" />
        <meta name="twitter:image" content="https://diu-learning.vercel.app/images/diu-logo.png" />
        <meta name="twitter:creator" content="@DIU_CSE" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="icon" href="/images/diu-logo.png" />
        <link rel="apple-touch-icon" href="/images/diu-logo.png" />
      </head>
      <body className="min-h-screen bg-background text-foreground font-sans antialiased">
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange={false}>
          <div className="relative flex min-h-screen flex-col">{children}</div>
        </ThemeProvider>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  )
}

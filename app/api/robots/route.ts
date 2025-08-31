import { NextResponse } from 'next/server'

export async function GET() {
  const robots = `User-agent: *
Allow: /
Allow: /browse-videos
Allow: /browse-slides
Allow: /browse-study-tools
Allow: /login

Disallow: /admin/
Disallow: /api/
Disallow: /test-*
Disallow: /debug-*
Disallow: /minimal-test
Disallow: /simple-login

Sitemap: https://diu-learning.vercel.app/sitemap.xml

# Crawl-delay for respectful crawling
Crawl-delay: 1

# Block common bot patterns that might cause issues
User-agent: AhrefsBot
Disallow: /

User-agent: MJ12bot
Disallow: /

User-agent: DotBot
Disallow: /`

  return new NextResponse(robots, {
    headers: {
      'Content-Type': 'text/plain',
      'Cache-Control': 'public, max-age=86400, s-maxage=86400',
    },
  })
}

// middleware.ts
import { NextRequest, NextResponse } from 'next/server';

// Simple in-memory store (use Upstash Redis in production for multi-region)
const rateLimit = new Map<string, { count: number; resetAt: number }>();

const WINDOW_MS = 60_000;   // 1 minute window
const MAX_REQUESTS = 30;    // 30 requests per minute per IP

export function middleware(req: NextRequest) {
  // Only rate limit your API routes
  if (!req.nextUrl.pathname.startsWith('/api/')) {
    return NextResponse.next();
  }

  const ip = req.headers.get('x-forwarded-for')?.split(',')[0] ?? 'unknown';
  const now = Date.now();
  const record = rateLimit.get(ip);

  if (!record || now > record.resetAt) {
    rateLimit.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    return NextResponse.next();
  }

  if (record.count >= MAX_REQUESTS) {
    return new NextResponse('Too many requests', {
      status: 429,
      headers: {
        'Retry-After': String(Math.ceil((record.resetAt - now) / 1000)),
        'X-RateLimit-Limit': String(MAX_REQUESTS),
        'X-RateLimit-Remaining': '0',
      },
    });
  }

  record.count++;
  return NextResponse.next();
}

export const config = {
  matcher: '/api/:path*',  // only runs on /api/* routes
};
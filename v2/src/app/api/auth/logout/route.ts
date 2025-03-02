import { NextResponse } from 'next/server';
import { serialize } from 'cookie'; // Use named import for 'cookie'

export async function GET() {
  const isProduction = process.env.NODE_ENV === 'production'; // Check if the environment is production
  const res = NextResponse.json({ success: true, message: 'Logged out' });

  // Set cookie with correct 'secure' flag based on environment
  res.headers.set('Set-Cookie', serialize('token', '', {
    httpOnly: true,
    secure: isProduction,  // Secure only in production
    maxAge: -1,             // Expire the cookie immediately
    path: '/',
    sameSite: 'strict',
  }));

  return res;
}

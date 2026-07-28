import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token
    const isAuth = !!token
    const pathname = req.nextUrl.pathname
    const isAuthPage = pathname.startsWith('/auth')

    // If user is already logged in and hits an auth page, redirect them to their dashboard
    if (isAuthPage && isAuth) {
      const role = (token as any)?.role
      if (role === 'ADMIN') return NextResponse.redirect(new URL('/dashboard/admin', req.url))
      if (role === 'EMPLOYER') return NextResponse.redirect(new URL('/dashboard/employer', req.url))
      return NextResponse.redirect(new URL('/dashboard/seeker', req.url))
    }

    // Protect dashboard routes - check role-based access
    if (pathname.startsWith('/dashboard/admin') && (token as any)?.role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/auth/login', req.url))
    }
    if (pathname.startsWith('/dashboard/employer') && (token as any)?.role !== 'EMPLOYER') {
      return NextResponse.redirect(new URL('/auth/login', req.url))
    }
    if (pathname.startsWith('/dashboard/seeker') && (token as any)?.role !== 'SEEKER') {
      return NextResponse.redirect(new URL('/auth/login', req.url))
    }

    // Non-auth pages: if not logged in, redirect to login with return URL
    if (!isAuthPage && !isAuth) {
      let from = pathname
      if (req.nextUrl.search) from += req.nextUrl.search
      return NextResponse.redirect(new URL(`/auth/login?from=${encodeURIComponent(from)}`, req.url))
    }
  },
  {
    callbacks: {
      authorized: () => true, // Let the middleware function above handle all logic
    },
  }
)

export const config = {
  matcher: ['/dashboard/:path*', '/auth/:path*'],
}

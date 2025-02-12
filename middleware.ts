import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
	const res = NextResponse.next();
	const supabase = createMiddlewareClient({ req: request, res });

	const {
		data: { session },
	} = await supabase.auth.getSession();

	// If there's no session and the user is trying to access a protected route
	if (!session && !request.nextUrl.pathname.startsWith('/')) {
		return NextResponse.redirect(new URL('/', request.url));
	}

	// If there's a session and the user is trying to access the login page
	if (session && request.nextUrl.pathname === '/') {
		return NextResponse.redirect(new URL('/dashboard', request.url));
	}

	return res;
}

export const config = {
	matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};

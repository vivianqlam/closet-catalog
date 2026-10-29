import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

// Pages anyone can visit without logging in. Shared packing lists live
// under /share/<token>; the token itself decides what (if anything) is shown.
const PUBLIC_PATHS = ["/", "/login", "/signup"];
const isPublic = (path: string) => PUBLIC_PATHS.includes(path) || path.startsWith("/share/");

// Runs before every page: refreshes the login session cookie, sends logged-out
// visitors to /login, and sends logged-in users away from the login/signup pages.
export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet, headers) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
          Object.entries(headers ?? {}).forEach(([key, value]) =>
            response.headers.set(key, value),
          );
        },
      },
    },
  );

  const { data } = await supabase.auth.getClaims();
  const isLoggedIn = Boolean(data?.claims);
  const path = request.nextUrl.pathname;

  if (!isLoggedIn && !isPublic(path)) {
    return NextResponse.redirect(new URL("/login", request.url));
  }
  if (isLoggedIn && (path === "/login" || path === "/signup")) {
    return NextResponse.redirect(new URL("/closet", request.url));
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};

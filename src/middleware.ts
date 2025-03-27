import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isOnboardingRoute = createRouteMatcher(["/onboarding"]);
const isPublicRoute = createRouteMatcher([
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/api(.*)",
]);

export default clerkMiddleware(async (auth, req) => {
  const { userId, sessionClaims } = await auth();

  // Redirect users to onboarding if not completed, but allow API calls
  if (
    !sessionClaims?.onboardingComplete &&
    !isOnboardingRoute(req) &&
    !isPublicRoute(req)
  ) {
    const home = new URL("/onboarding", req.url);
    return NextResponse.redirect(home);
  }

  // Prevent onboarded users from accessing onboarding page
  if (userId && isOnboardingRoute(req) && sessionClaims?.onboardingComplete) {
    const home = new URL("/", req.url);
    return NextResponse.redirect(home);
  }

  // Protect private routes
  if (!isPublicRoute(req) && !userId) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};

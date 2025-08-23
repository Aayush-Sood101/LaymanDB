import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

// Export the middleware function properly
export default clerkMiddleware();

export const config = {
  matcher: [
    // Skip Next.js internals and all static files
    "/((?!_next|[^?]*\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
    // Skip auth routes
    "/((?!sign-in|sign-up).*)",
  ],
};

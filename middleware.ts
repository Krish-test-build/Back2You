// Resource: https://clerk.com/docs/nextjs/middleware#auth-middleware
// Copy the middleware code as it is from the above resource
// middleware.ts
import { authMiddleware } from "@clerk/nextjs/server"; // ✅ Correct for App Router


export default authMiddleware({
  // An array of public routes that don't require authentication.
  publicRoutes: ["/api/webhook/clerk"],

  // An array of routes to be ignored by the authentication middleware.
  ignoredRoutes: ["/api/webhook/clerk"],
});

export const config = {
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};

import nextAuthMiddleware from "next-auth/middleware";
import type { NextRequestWithAuth } from "next-auth/middleware";
import type { NextFetchEvent } from "next/server";

export function proxy(request: NextRequestWithAuth, event: NextFetchEvent) {
  return nextAuthMiddleware(request, event);
}

export const config = {
  matcher: ["/((?!$).*)"],
};
import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const BACKEND_SECURE_URL = "http://localhost:8081/api/secure";

export async function GET(request: NextRequest) {
  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });

  if (!token || typeof token.accessToken !== "string") {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const backendResponse = await fetch(BACKEND_SECURE_URL, {
    headers: {
      Authorization: `Bearer ${token.accessToken}`,
      Accept: "application/json",
    },
    cache: "no-store",
  });

  const contentType = backendResponse.headers.get("content-type") ?? "";

  if (!backendResponse.ok) {
    const body = await backendResponse.text();
    return NextResponse.json(
      {
        error: "Backend request failed",
        status: backendResponse.status,
        body,
      },
      { status: 502 }
    );
  }

  if (contentType.includes("application/json")) {
    const data = await backendResponse.json();
    return NextResponse.json(data);
  }

  const text = await backendResponse.text();
  return NextResponse.json({ data: text });
}

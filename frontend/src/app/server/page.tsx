import { getServerSession } from "next-auth";
import { getToken } from "next-auth/jwt";
import Link from "next/link";
import { headers } from "next/headers";
import { NextRequest } from "next/server";

import { authOptions } from "@/lib/auth";

export default async function ServerSessionPage() {
	const session = await getServerSession(authOptions);
	const requestHeaders = await headers();
	const request = new NextRequest("http://localhost:3000/server", {
		headers: requestHeaders,
	});
	const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
    console.log("ServerSessionPage token:", token); // Debug log to check token contents

	const serverOnlyData = {
		hasAccessToken: typeof token?.accessToken === "string",
		hasIdToken: typeof token?.idToken === "string",
		preferredUsername: typeof token?.preferredUsername === "string" ? token.preferredUsername : null,
	};

	return (
		<main className="mx-auto flex min-h-screen w-full max-w-4xl flex-col gap-6 px-6 py-20">
			<h1 className="text-3xl font-semibold tracking-tight">/server session example</h1>
			<p className="text-sm text-zinc-600 dark:text-zinc-300">This page reads session + server-only token state (via getToken()).</p>

			<div className="rounded-xl border border-black/10 p-6 dark:border-white/20">
				{session ? (
					<div className="space-y-4">
						<div>
							<p className="mb-2 text-sm font-medium">Session (safe for client)</p>
							<pre className="overflow-x-auto text-sm">{JSON.stringify(session, null, 2)}</pre>
						</div>
						<div>
							<p className="mb-2 text-sm font-medium">Server-only token presence</p>
							<pre className="overflow-x-auto text-sm">{JSON.stringify(serverOnlyData, null, 2)}</pre>
						</div>
					</div>
				) : (
					<p className="text-sm">No active session.</p>
				)}
			</div>

			<div className="flex gap-3">
				<Link className="rounded-md border border-black/10 px-4 py-2 text-sm dark:border-white/20" href="/">
					Home
				</Link>
				<Link className="rounded-md border border-black/10 px-4 py-2 text-sm dark:border-white/20" href="/client">
					Client example
				</Link>
			</div>
		</main>
	);
}


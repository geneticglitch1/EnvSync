"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";

export default function ClientSessionPage() {
	const { data: session, status } = useSession();

	return (
		<main className="mx-auto flex min-h-screen w-full max-w-4xl flex-col gap-6 px-6 py-20">
			<h1 className="text-3xl font-semibold tracking-tight">/client session example</h1>
			<p className="text-sm text-zinc-600 dark:text-zinc-300">This page reads session in the browser with useSession(). Access token and ID token are not exposed here.</p>

			<div className="rounded-xl border border-black/10 p-6 dark:border-white/20">
				{status === "loading" ? (
					<p className="text-sm">Loading session…</p>
				) : session ? (
					<pre className="overflow-x-auto text-sm">{JSON.stringify(session, null, 2)}</pre>
				) : (
					<p className="text-sm">No active session.</p>
				)}
			</div>

			<div className="flex gap-3">
				<Link className="rounded-md border border-black/10 px-4 py-2 text-sm dark:border-white/20" href="/">
					Home
				</Link>
				<Link className="rounded-md border border-black/10 px-4 py-2 text-sm dark:border-white/20" href="/server">
					Server example
				</Link>
			</div>
		</main>
	);
}


"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type PollResult = {
	ok: boolean;
	status: number;
	body: unknown;
	at: string;
};

export default function PublicPage() {
	const [latest, setLatest] = useState<PollResult | null>(null);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		let active = true;

		const run = async () => {
			try {
				const response = await fetch("/api/secure", { cache: "no-store" });
				const body = await response.json().catch(() => null);

				if (!active) {
					return;
				}

				setLatest({
					ok: response.ok,
					status: response.status,
					body,
					at: new Date().toISOString(),
				});
				setError(null);
			} catch (err) {
				if (!active) {
					return;
				}

				const message = err instanceof Error ? err.message : "Request failed";
				setError(message);
			}
		};

		run();
		const interval = setInterval(run, 2000);

		return () => {
			active = false;
			clearInterval(interval);
		};
	}, []);

	return (
		<main className="mx-auto flex min-h-screen w-full max-w-4xl flex-col gap-6 px-6 py-20">
			<h1 className="text-3xl font-semibold tracking-tight">/public polling example</h1>
			<p className="text-sm text-zinc-600 dark:text-zinc-300">
				Polling /api/secure every 2 seconds. The API route forwards your access token to the backend.
			</p>

			<div className="rounded-xl border border-black/10 p-6 dark:border-white/20">
				{error && <p className="text-sm text-red-600">{error}</p>}
				{!error && !latest && <p className="text-sm">Waiting for first response…</p>}
				{latest && (
					<div className="space-y-3">
						<p className="text-sm">
							Status: <span className="font-medium">{latest.ok ? "success" : "failed"}</span> ({latest.status})
						</p>
						<p className="text-xs text-zinc-500">Last updated: {latest.at}</p>
						<pre className="overflow-x-auto text-sm">{JSON.stringify(latest.body, null, 2)}</pre>
					</div>
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
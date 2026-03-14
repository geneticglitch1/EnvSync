"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { createApiClient, type Project, type SnapshotMeta } from "@/lib/api";

function formatDate(iso: string) {
  return new Date(iso).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatRelative(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const minutes = Math.floor(diff / 60_000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

const ENV_BADGE: Record<string, string> = {
  production: "bg-red-500/10 text-red-400 border-red-500/20",
  staging: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  development: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
};

// ── Snapshot Row ────────────────────────────────────────────────────────────

function SnapshotRow({
  snap,
  isLatest,
}: {
  snap: SnapshotMeta;
  isLatest: boolean;
}) {
  return (
    <div className="flex items-start gap-4 py-4 first:pt-0">
      {/* Version bubble */}
      <div className="flex flex-col items-center">
        <div
          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border text-xs font-bold ${
            isLatest
              ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-400"
              : "border-white/10 bg-zinc-800 text-zinc-500"
          }`}
        >
          v{snap.version}
        </div>
        {/* connector line — handled by parent spacing */}
      </div>

      <div className="flex-1 min-w-0 pt-0.5">
        <div className="flex items-center gap-2 flex-wrap">
          {isLatest && (
            <span className="inline-flex items-center rounded-full bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 text-xs font-medium text-emerald-400">
              latest
            </span>
          )}
          <p className="text-sm font-medium truncate">
            {snap.message ?? <span className="italic text-zinc-500">No message</span>}
          </p>
        </div>
        <p className="mt-1 text-xs text-zinc-500">
          {snap.pushed_by ? (
            <>
              <span className="font-mono text-zinc-400">{snap.pushed_by.split("-")[0]}…</span>
              {" · "}
            </>
          ) : null}
          <span title={formatDate(snap.created_at)}>{formatRelative(snap.created_at)}</span>
        </p>
      </div>

      <div className="shrink-0 text-xs text-zinc-600" title={formatDate(snap.created_at)}>
        {formatDate(snap.created_at)}
      </div>
    </div>
  );
}

// ── CLI Reference Panel ─────────────────────────────────────────────────────

function CliPanel({ projectId }: { projectId: string }) {
  const [copied, setCopied] = useState<string | null>(null);

  function copy(text: string, key: string) {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(key);
      setTimeout(() => setCopied(null), 1500);
    });
  }

  const commands = [
    { key: "push", cmd: "envsync push -m \"describe changes\"", desc: "Encrypt & push local .env" },
    { key: "pull", cmd: "envsync pull", desc: "Pull latest snapshot" },
    { key: "diff", cmd: "envsync diff", desc: "Compare local vs remote" },
    { key: "log", cmd: "envsync log", desc: "View snapshot history" },
  ];

  return (
    <div className="rounded-2xl border border-white/[0.06] bg-zinc-900/40 p-5">
      <h2 className="text-sm font-semibold text-zinc-300">CLI Quick Reference</h2>
      <p className="mt-1 text-xs text-zinc-600">
        Project ID: <span className="font-mono text-zinc-500">{projectId}</span>
      </p>
      <div className="mt-4 space-y-2">
        {commands.map(({ key, cmd, desc }) => (
          <div
            key={key}
            className="group flex items-center justify-between gap-3 rounded-lg border border-white/[0.04] bg-zinc-900/60 px-3 py-2"
          >
            <div className="min-w-0">
              <code className="text-xs text-emerald-400">{cmd}</code>
              <p className="text-xs text-zinc-600 mt-0.5">{desc}</p>
            </div>
            <button
              onClick={() => copy(cmd, key)}
              className="shrink-0 rounded p-1 text-zinc-600 opacity-0 group-hover:opacity-100 hover:text-zinc-300 hover:bg-white/5 transition-all"
              title="Copy"
            >
              {copied === key ? <CheckIcon /> : <CopyIcon />}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Page ───────────────────────────────────────────────────────────────────

export default function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: session, status } = useSession();
  const [project, setProject] = useState<Project | null>(null);
  const [snapshots, setSnapshots] = useState<SnapshotMeta[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!session?.accessToken || !id) return;
    setLoading(true);
    setError(null);
    try {
      const api = createApiClient(session.accessToken);
      const [proj, snaps] = await Promise.all([
        api.getProject(id),
        api.listSnapshots(id, 50),
      ]);
      setProject(proj);
      setSnapshots(snaps);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load project");
    } finally {
      setLoading(false);
    }
  }, [session?.accessToken, id]);

  useEffect(() => {
    if (status === "authenticated") fetchData();
  }, [status, fetchData]);

  if (status === "loading" || loading) {
    return (
      <div className="flex h-full items-center justify-center p-20">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 max-w-5xl mx-auto">
        <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          {error}
          <button onClick={fetchData} className="ml-3 underline hover:no-underline">
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!project) return null;

  const envClass = ENV_BADGE[project.environment.toLowerCase()] ?? "bg-zinc-800 text-zinc-400 border-zinc-700";

  return (
    <div className="p-8 max-w-5xl mx-auto">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-zinc-500 mb-6">
        <Link href="/dashbaord" className="hover:text-white transition-colors">
          Projects
        </Link>
        <span>/</span>
        <span className="text-white">{project.name}</span>
      </div>

      {/* Project header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight">{project.name}</h1>
            <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${envClass}`}>
              {project.environment}
            </span>
          </div>
          <p className="mt-1 text-sm text-zinc-500">
            {snapshots.length} snapshot{snapshots.length !== 1 ? "s" : ""} · Created {formatDate(project.created_at)}
          </p>
        </div>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        {/* Snapshot history */}
        <div className="lg:col-span-2">
          <div className="rounded-2xl border border-white/[0.06] bg-zinc-900/40">
            <div className="border-b border-white/[0.06] px-5 py-4 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-zinc-300">Snapshot History</h2>
              <span className="text-xs text-zinc-600">{snapshots.length} total</span>
            </div>

            {snapshots.length === 0 ? (
              <div className="px-5 py-12 text-center">
                <p className="text-sm text-zinc-500">No snapshots yet.</p>
                <p className="mt-2 text-xs text-zinc-600">
                  Run{" "}
                  <code className="text-emerald-400">envsync push</code>{" "}
                  to create the first one.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-white/[0.04] px-5">
                {snapshots.map((snap, i) => (
                  <SnapshotRow
                    key={snap.id}
                    snap={snap}
                    isLatest={i === 0}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Rollback note */}
          {snapshots.length > 1 && (
            <div className="mt-3 flex items-start gap-2 rounded-xl border border-white/[0.04] bg-zinc-900/20 px-4 py-3">
              <InfoIcon />
              <p className="text-xs text-zinc-600">
                To roll back:{" "}
                <code className="text-emerald-500">envsync rollback --version &lt;N&gt;</code>
              </p>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <CliPanel projectId={id} />

          {/* Stats */}
          <div className="rounded-2xl border border-white/[0.06] bg-zinc-900/40 p-5 space-y-3">
            <h2 className="text-sm font-semibold text-zinc-300">Stats</h2>
            <div className="space-y-2">
              <Stat label="Total snapshots" value={snapshots.length.toString()} />
              <Stat
                label="Latest version"
                value={snapshots[0] ? `v${snapshots[0].version}` : "—"}
              />
              <Stat
                label="Last push"
                value={snapshots[0] ? formatRelative(snapshots[0].created_at) : "—"}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-xs text-zinc-500">{label}</span>
      <span className="text-xs font-medium text-zinc-300">{value}</span>
    </div>
  );
}

function CopyIcon() {
  return (
    <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 0 1-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 0 1 1.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 0 0-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 0 1-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 0 0-3.375-3.375h-1.5a1.125 1.125 0 0 1-1.125-1.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H9.75" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg className="h-3.5 w-3.5 text-emerald-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
    </svg>
  );
}

function InfoIcon() {
  return (
    <svg className="h-4 w-4 shrink-0 text-zinc-600" fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z" />
    </svg>
  );
}

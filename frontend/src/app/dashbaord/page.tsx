"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { createApiClient, type Project } from "@/lib/api";

const ENV_COLORS: Record<string, string> = {
  production: "bg-red-500/10 text-red-400 border-red-500/20",
  staging: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  development: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
};

function EnvBadge({ env }: { env: string }) {
  const cls = ENV_COLORS[env.toLowerCase()] ?? "bg-zinc-800 text-zinc-400 border-zinc-700";
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${cls}`}>
      {env}
    </span>
  );
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

// ── Create Project Modal ───────────────────────────────────────────────────

const ENVIRONMENTS = ["development", "staging", "production", "test"];

function CreateProjectModal({
  onClose,
  onCreate,
}: {
  onClose: () => void;
  onCreate: (name: string, env: string) => Promise<void>;
}) {
  const [name, setName] = useState("");
  const [env, setEnv] = useState("development");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setLoading(true);
    setError(null);
    try {
      await onCreate(name.trim(), env);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create project");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-zinc-950 p-6 shadow-2xl">
        <h2 className="text-lg font-semibold">New Project</h2>
        <p className="mt-1 text-sm text-zinc-500">
          Create a new encrypted vault for your team.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-1.5">
              Project name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="my-app"
              className="w-full rounded-lg border border-white/10 bg-zinc-900 px-3 py-2 text-sm text-white placeholder-zinc-600 outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50"
              autoFocus
              required
              maxLength={100}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-1.5">
              Environment
            </label>
            <select
              value={env}
              onChange={(e) => setEnv(e.target.value)}
              className="w-full rounded-lg border border-white/10 bg-zinc-900 px-3 py-2 text-sm text-white outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50"
            >
              {ENVIRONMENTS.map((e) => (
                <option key={e} value={e}>{e}</option>
              ))}
            </select>
          </div>

          {error && (
            <p className="rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-sm text-red-400">
              {error}
            </p>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-lg border border-white/10 px-4 py-2 text-sm text-zinc-400 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !name.trim()}
              className="flex-1 rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-black hover:bg-emerald-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? "Creating…" : "Create"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Delete Confirmation ────────────────────────────────────────────────────

function DeleteConfirmModal({
  project,
  onClose,
  onDelete,
}: {
  project: Project;
  onClose: () => void;
  onDelete: () => Promise<void>;
}) {
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    setLoading(true);
    try {
      await onDelete();
      onClose();
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl border border-red-500/20 bg-zinc-950 p-6 shadow-2xl">
        <h2 className="text-lg font-semibold text-red-400">Delete project?</h2>
        <p className="mt-2 text-sm text-zinc-400">
          This will permanently delete{" "}
          <span className="font-medium text-white">{project.name}</span> and all
          its snapshots. This action cannot be undone.
        </p>
        <div className="mt-6 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 rounded-lg border border-white/10 px-4 py-2 text-sm text-zinc-400 hover:text-white transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleDelete}
            disabled={loading}
            className="flex-1 rounded-lg bg-red-500 px-4 py-2 text-sm font-semibold text-white hover:bg-red-400 disabled:opacity-50 transition-colors"
          >
            {loading ? "Deleting…" : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Project Card ───────────────────────────────────────────────────────────

function ProjectCard({
  project,
  onDelete,
}: {
  project: Project;
  onDelete: (p: Project) => void;
}) {
  return (
    <div className="group relative rounded-2xl border border-white/[0.06] bg-zinc-900/40 p-5 hover:border-emerald-500/20 hover:bg-emerald-500/[0.03] transition-colors">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <Link
            href={`/dashbaord/projects/${project.id}`}
            className="block truncate font-semibold tracking-tight hover:text-emerald-400 transition-colors"
          >
            {project.name}
          </Link>
          <p className="mt-1 text-xs text-zinc-500">
            Created {formatDate(project.created_at)}
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <EnvBadge env={project.environment} />
          <button
            onClick={() => onDelete(project)}
            className="opacity-0 group-hover:opacity-100 rounded-lg p-1.5 text-zinc-600 hover:text-red-400 hover:bg-red-500/10 transition-all"
            title="Delete project"
          >
            <TrashIcon />
          </button>
        </div>
      </div>

      <div className="mt-4 flex items-center gap-2">
        <Link
          href={`/dashbaord/projects/${project.id}`}
          className="inline-flex items-center gap-1.5 rounded-lg border border-white/[0.06] px-3 py-1.5 text-xs text-zinc-400 hover:text-white hover:border-white/10 transition-colors"
        >
          <HistoryIcon />
          View snapshots
        </Link>
      </div>
    </div>
  );
}

function TrashIcon() {
  return (
    <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
    </svg>
  );
}

function HistoryIcon() {
  return (
    <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
    </svg>
  );
}

// ── Page ───────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Project | null>(null);

  const fetchProjects = useCallback(async () => {
    if (!session?.accessToken) return;
    setLoading(true);
    setError(null);
    try {
      const api = createApiClient(session.accessToken);
      const list = await api.listProjects();
      setProjects(list);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load projects");
    } finally {
      setLoading(false);
    }
  }, [session?.accessToken]);

  useEffect(() => {
    if (status === "authenticated") {
      fetchProjects();
    }
  }, [status, fetchProjects]);

  async function handleCreate(name: string, env: string) {
    if (!session?.accessToken) return;
    const api = createApiClient(session.accessToken);
    await api.createProject(name, env);
    await fetchProjects();
  }

  async function handleDelete() {
    if (!session?.accessToken || !deleteTarget) return;
    const api = createApiClient(session.accessToken);
    await api.deleteProject(deleteTarget.id);
    setDeleteTarget(null);
    await fetchProjects();
  }

  if (status === "loading" || loading) {
    return (
      <div className="flex h-full items-center justify-center p-20">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="p-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Projects</h1>
          <p className="mt-1 text-sm text-zinc-500">
            {projects.length} project{projects.length !== 1 ? "s" : ""} in your account
          </p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-4 py-2 text-sm font-semibold text-black hover:bg-emerald-400 transition-colors"
        >
          <PlusIcon />
          New project
        </button>
      </div>

      {/* CLI hint */}
      <div className="mt-6 rounded-xl border border-white/[0.06] bg-zinc-900/40 px-4 py-3 font-mono text-xs text-zinc-500">
        <span className="text-emerald-400">$</span>{" "}
        envsync init --project &lt;name&gt; --env &lt;env&gt;
        <span className="ml-4 not-italic font-sans text-zinc-600">← or create via this dashboard</span>
      </div>

      {/* Error */}
      {error && (
        <div className="mt-6 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          {error}
          <button onClick={fetchProjects} className="ml-3 underline hover:no-underline">
            Retry
          </button>
        </div>
      )}

      {/* Projects grid */}
      {projects.length === 0 && !error ? (
        <div className="mt-16 flex flex-col items-center text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-white/[0.06] bg-zinc-900/60">
            <FolderIcon />
          </div>
          <h3 className="mt-4 font-semibold">No projects yet</h3>
          <p className="mt-2 max-w-sm text-sm text-zinc-500">
            Create your first project to start syncing encrypted environment variables across your team.
          </p>
          <button
            onClick={() => setShowCreate(true)}
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-5 py-2.5 text-sm font-semibold text-black hover:bg-emerald-400 transition-colors"
          >
            <PlusIcon />
            Create first project
          </button>
        </div>
      ) : (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((p) => (
            <ProjectCard
              key={p.id}
              project={p}
              onDelete={setDeleteTarget}
            />
          ))}
        </div>
      )}

      {/* Modals */}
      {showCreate && (
        <CreateProjectModal
          onClose={() => setShowCreate(false)}
          onCreate={handleCreate}
        />
      )}
      {deleteTarget && (
        <DeleteConfirmModal
          project={deleteTarget}
          onClose={() => setDeleteTarget(null)}
          onDelete={handleDelete}
        />
      )}
    </div>
  );
}

function PlusIcon() {
  return (
    <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
    </svg>
  );
}

function FolderIcon() {
  return (
    <svg className="h-8 w-8 text-zinc-600" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.75V12A2.25 2.25 0 0 1 4.5 9.75h15A2.25 2.25 0 0 1 21.75 12v.75m-8.69-6.44-2.12-2.12a1.5 1.5 0 0 0-1.061-.44H4.5A2.25 2.25 0 0 0 2.25 6v8.25m19.5 0A2.25 2.25 0 0 1 19.5 16.5h-15a2.25 2.25 0 0 1-2.25-2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 16.91a2.25 2.25 0 0 1-1.07-1.916V14.25" />
    </svg>
  );
}

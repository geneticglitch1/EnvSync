const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8081";

export interface Project {
  id: string;
  name: string;
  environment: string;
  created_at: string;
}

export interface SnapshotMeta {
  id: string;
  version: number;
  message: string | null;
  pushed_by: string | null;
  created_at: string;
}

export interface SnapshotFull extends SnapshotMeta {
  ciphertext: string;
  nonce: string;
}

export interface ApiError {
  status: number;
  error: string;
  fields?: Record<string, string>;
}

class ApiClient {
  private token: string;

  constructor(token: string) {
    this.token = token;
  }

  private async request<T>(
    path: string,
    init: RequestInit = {}
  ): Promise<T> {
    const res = await fetch(`${API_BASE}${path}`, {
      ...init,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.token}`,
        ...init.headers,
      },
    });

    if (!res.ok) {
      let body: ApiError;
      try {
        body = await res.json();
      } catch {
        body = { status: res.status, error: res.statusText };
      }
      const err = new Error(body.error ?? `HTTP ${res.status}`);
      (err as Error & { apiError: ApiError }).apiError = body;
      throw err;
    }

    if (res.status === 204) return undefined as unknown as T;
    return res.json() as Promise<T>;
  }

  // ── Projects ──────────────────────────────────────────────────────

  listProjects(): Promise<Project[]> {
    return this.request<Project[]>("/api/projects");
  }

  getProject(id: string): Promise<Project> {
    return this.request<Project>(`/api/projects/${id}`);
  }

  createProject(name: string, environment: string): Promise<Project> {
    return this.request<Project>("/api/projects", {
      method: "POST",
      body: JSON.stringify({ name, environment }),
    });
  }

  deleteProject(id: string): Promise<void> {
    return this.request<void>(`/api/projects/${id}`, { method: "DELETE" });
  }

  // ── Snapshots ─────────────────────────────────────────────────────

  listSnapshots(projectId: string, limit = 50): Promise<SnapshotMeta[]> {
    return this.request<SnapshotMeta[]>(
      `/api/projects/${projectId}/snapshots?limit=${limit}`
    );
  }

  getLatestSnapshot(projectId: string): Promise<SnapshotFull | null> {
    return this.request<SnapshotFull>(
      `/api/projects/${projectId}/snapshots/latest`
    ).catch((err) => {
      if ((err as Error & { apiError?: ApiError }).apiError?.status === 404)
        return null;
      throw err;
    });
  }

  getSnapshot(projectId: string, snapId: string): Promise<SnapshotFull> {
    return this.request<SnapshotFull>(
      `/api/projects/${projectId}/snapshots/${snapId}`
    );
  }
}

export function createApiClient(token: string): ApiClient {
  return new ApiClient(token);
}

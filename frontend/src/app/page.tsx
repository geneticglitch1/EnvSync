import Link from "next/link";

/* ------------------------------------------------------------------ */
/*  SVG Icons (inline to avoid extra deps)                            */
/* ------------------------------------------------------------------ */

const ShieldIcon = () => (
  <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />
  </svg>
);

const TerminalIcon = () => (
  <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="m6.75 7.5 3 2.25-3 2.25m4.5 0h3m-9 8.25h13.5A2.25 2.25 0 0 0 21 18V6a2.25 2.25 0 0 0-2.25-2.25H5.25A2.25 2.25 0 0 0 3 6v12a2.25 2.25 0 0 0 2.25 2.25Z" />
  </svg>
);

const BoltIcon = () => (
  <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="m3.75 13.5 10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75Z" />
  </svg>
);

const ClockIcon = () => (
  <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
  </svg>
);

const UsersIcon = () => (
  <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" />
  </svg>
);

const EyeSlashIcon = () => (
  <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88" />
  </svg>
);

const DiffIcon = () => (
  <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21 3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" />
  </svg>
);

const ServerIcon = () => (
  <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 14.25h13.5m-13.5 0a3 3 0 0 1-3-3m3 3a3 3 0 1 0 0 6h13.5a3 3 0 1 0 0-6m-16.5-3a3 3 0 0 1 3-3h13.5a3 3 0 0 1 3 3m-19.5 0a4.5 4.5 0 0 1 .9-2.7L5.737 5.1a3.375 3.375 0 0 1 2.7-1.35h7.126c1.062 0 2.062.5 2.7 1.35l2.587 3.45a4.5 4.5 0 0 1 .9 2.7m0 0a3 3 0 0 1-3 3m0 3h.008v.008h-.008v-.008Zm0-6h.008v.008h-.008v-.008Zm-3 6h.008v.008h-.008v-.008Zm0-6h.008v.008h-.008v-.008Z" />
  </svg>
);

/* ------------------------------------------------------------------ */
/*  Reusable tiny components                                          */
/* ------------------------------------------------------------------ */

function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs font-medium tracking-wide text-emerald-400 uppercase">
      {children}
    </span>
  );
}

function SectionHeading({ badge, title, subtitle }: { badge: string; title: string; subtitle: string }) {
  return (
    <div className="mx-auto max-w-2xl text-center">
      <Badge>{badge}</Badge>
      <h2 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">{title}</h2>
      <p className="mt-4 text-lg leading-relaxed text-zinc-400">{subtitle}</p>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Feature cards data                                                */
/* ------------------------------------------------------------------ */

const features = [
  {
    icon: <TerminalIcon />,
    title: "CLI-first workflow",
    desc: "envsync push, pull, diff — feels like git for your .env files. Integrates into any CI/CD pipeline.",
  },
  {
    icon: <ShieldIcon />,
    title: "End-to-end encryption",
    desc: "Secrets encrypted client-side with libsodium before ever hitting the server. Zero-knowledge by design.",
  },
  {
    icon: <BoltIcon />,
    title: "Real-time notifications",
    desc: "Teammates get notified instantly via Redis pub/sub the moment environment variables change.",
  },
  {
    icon: <DiffIcon />,
    title: ".env diff viewer",
    desc: "Visual diff in the web dashboard showing exactly what changed between vault versions.",
  },
  {
    icon: <UsersIcon />,
    title: "Org & project management",
    desc: "Multi-team support with role-based access control — Admin, Editor, and Viewer roles.",
  },
  {
    icon: <ClockIcon />,
    title: "Audit log & versioning",
    desc: "Full history of who changed what, when, and from where. Rollback to any previous version.",
  },
  {
    icon: <EyeSlashIcon />,
    title: "Zero-knowledge security",
    desc: "Server only stores ciphertext. Argon2 key derivation + XChaCha20-Poly1305 encryption.",
  },
  {
    icon: <ServerIcon />,
    title: "100% self-hosted",
    desc: "Docker Compose one-liner. PostgreSQL, Redis, MinIO, Keycloak, NGINX — all on your infra.",
  },
];

/* ------------------------------------------------------------------ */
/*  Tech stack data                                                   */
/* ------------------------------------------------------------------ */

const techStack = [
  { layer: "Frontend", tech: "Next.js 15", detail: "App Router" },
  { layer: "Backend", tech: "Spring Boot 3", detail: "Java 21" },
  { layer: "Database", tech: "PostgreSQL 16", detail: "Vaults & Audit" },
  { layer: "Cache", tech: "Redis 7", detail: "Pub/Sub" },
  { layer: "Storage", tech: "MinIO", detail: "S3-compatible" },
  { layer: "Auth", tech: "Keycloak", detail: "OIDC / SSO" },
  { layer: "Proxy", tech: "NGINX", detail: "TLS termination" },
  { layer: "Encryption", tech: "libsodium", detail: "Client-side" },
];

/* ------------------------------------------------------------------ */
/*  CLI lines for the terminal animation                              */
/* ------------------------------------------------------------------ */

const cliLines = [
  { prompt: true, text: "envsync login" },
  { prompt: false, text: "✓ Authenticated via Keycloak (SSO)" },
  { prompt: true, text: "envsync init --project my-app --env development" },
  { prompt: false, text: "✓ Vault initialized for my-app/development" },
  { prompt: true, text: "envsync push" },
  { prompt: false, text: "✓ Encrypted & pushed 12 variables to vault" },
  { prompt: true, text: "envsync diff" },
  { prompt: false, text: "  + STRIPE_WEBHOOK_SECRET = ●●●●●●●●" },
  { prompt: false, text: "  ~ DATABASE_URL (modified)" },
  { prompt: false, text: "  - OLD_API_KEY (removed)" },
  { prompt: true, text: "envsync pull" },
  { prompt: false, text: "✓ Pulled latest vault → .env (3 changes)" },
];

/* ------------------------------------------------------------------ */
/*  Architecture nodes                                                */
/* ------------------------------------------------------------------ */

const archNodes = [
  { label: "CLI Tool", sub: "push / pull / diff", color: "border-emerald-500/40 bg-emerald-500/5" },
  { label: "NGINX", sub: "Reverse Proxy · TLS", color: "border-zinc-600 bg-zinc-800/50" },
  { label: "Spring Boot API", sub: "Auth · Vault · Audit", color: "border-emerald-500/30 bg-emerald-500/5" },
  { label: "PostgreSQL", sub: "Vaults & Logs", color: "border-blue-500/30 bg-blue-500/5" },
  { label: "Redis", sub: "Pub/Sub Notifications", color: "border-red-500/30 bg-red-500/5" },
  { label: "MinIO", sub: "Encrypted Backups", color: "border-yellow-500/30 bg-yellow-500/5" },
  { label: "Keycloak", sub: "SSO · OIDC · MFA", color: "border-purple-500/30 bg-purple-500/5" },
  { label: "Next.js Dashboard", sub: "Web UI · Diff Viewer", color: "border-emerald-500/40 bg-emerald-500/5" },
];

/* ================================================================== */
/*  PAGE                                                              */
/* ================================================================== */

export default function LandingPage() {
  return (
    <div className="bg-grid relative min-h-screen overflow-hidden">
      {/* ───── Ambient glow blobs ───── */}
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute -top-40 left-1/2 h-[600px] w-[900px] -translate-x-1/2 rounded-full bg-emerald-500/[0.07] blur-[120px]" />
        <div className="absolute top-[60%] -left-40 h-[400px] w-[400px] rounded-full bg-emerald-600/[0.05] blur-[100px]" />
        <div className="absolute top-[40%] -right-40 h-[350px] w-[350px] rounded-full bg-emerald-400/[0.04] blur-[100px]" />
      </div>

      {/* ═══════════════════════════════════════════════════════════ */}
      {/*  NAV                                                      */}
      {/* ═══════════════════════════════════════════════════════════ */}
      <nav className="sticky top-0 z-50 border-b border-white/5 bg-[#050505]/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <Link href="/" className="flex items-center gap-2 text-lg font-bold tracking-tight">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500 text-sm font-black text-black">
              E
            </span>
            EnvSync
          </Link>

          <div className="hidden items-center gap-8 text-sm text-zinc-400 md:flex">
            <a href="#features" className="transition hover:text-white">Features</a>
            <a href="#cli" className="transition hover:text-white">CLI</a>
            <a href="#architecture" className="transition hover:text-white">Architecture</a>
            <a href="#security" className="transition hover:text-white">Security</a>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/api/auth/signin/keycloak"
              className="rounded-lg border border-white/10 px-4 py-2 text-sm font-medium text-zinc-300 transition hover:border-white/20 hover:text-white"
            >
              Sign in
            </Link>
            <Link
              href="https://github.com/yourusername/envsync"
              target="_blank"
              className="rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-black transition hover:bg-emerald-400"
            >
              GitHub
            </Link>
          </div>
        </div>
      </nav>

      {/* ═══════════════════════════════════════════════════════════ */}
      {/*  HERO                                                     */}
      {/* ═══════════════════════════════════════════════════════════ */}
      <section className="relative mx-auto max-w-6xl px-6 pt-28 pb-20 text-center sm:pt-36 sm:pb-28">
        <div className="animate-fade-in-up">
          <Badge>🚧 Under Development</Badge>
        </div>

        <h1 className="animate-fade-in-up delay-100 mt-8 text-4xl font-extrabold tracking-tight sm:text-6xl lg:text-7xl">
          Git for your <span className="text-gradient">.env</span> files
        </h1>

        <p className="animate-fade-in-up delay-200 mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-zinc-400 sm:text-xl">
          Stop sending secrets over Slack. EnvSync gives your team a single{" "}
          <span className="text-white font-medium">encrypted source of truth</span> for environment variables
          — with diffing, versioning, and real-time notifications.{" "}
          <span className="text-emerald-400">100% self-hosted.</span>
        </p>

        <div className="animate-fade-in-up delay-300 mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Link
            href="https://github.com/yourusername/envsync"
            target="_blank"
            className="glow-green-sm inline-flex h-12 items-center gap-2 rounded-xl bg-emerald-500 px-6 text-sm font-semibold text-black transition hover:bg-emerald-400"
          >
            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
            </svg>
            Star on GitHub
          </Link>
          <code className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-zinc-900/80 px-5 py-3 font-mono text-sm text-zinc-300">
            <span className="text-emerald-400">$</span> npm install -g envsync-cli
          </code>
        </div>

        {/* Hero terminal preview */}
        <div className="animate-fade-in-up delay-400 glow-green mx-auto mt-16 max-w-2xl overflow-hidden rounded-2xl border border-white/10 bg-zinc-950">
          <div className="flex items-center gap-2 border-b border-white/5 px-4 py-3">
            <span className="h-3 w-3 rounded-full bg-red-500/70" />
            <span className="h-3 w-3 rounded-full bg-yellow-500/70" />
            <span className="h-3 w-3 rounded-full bg-green-500/70" />
            <span className="ml-2 text-xs text-zinc-500">Terminal — envsync</span>
          </div>
          <div className="p-5 text-left font-mono text-sm leading-7">
            {cliLines.map((line, i) =>
              line.prompt ? (
                <div key={i} className="text-zinc-200">
                  <span className="text-emerald-400">❯ </span>
                  {line.text}
                </div>
              ) : (
                <div key={i} className="text-zinc-500 pl-4">{line.text}</div>
              ),
            )}
            <div className="text-zinc-200 mt-1">
              <span className="text-emerald-400">❯ </span>
              <span className="cursor-blink">▊</span>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════ */}
      {/*  PROBLEM                                                  */}
      {/* ═══════════════════════════════════════════════════════════ */}
      <section className="mx-auto max-w-4xl px-6 py-20">
        <div className="rounded-2xl border border-red-500/20 bg-red-500/[0.03] p-8 sm:p-12">
          <p className="text-xs font-semibold tracking-widest text-red-400 uppercase">The Problem</p>
          <h2 className="mt-3 text-2xl font-bold tracking-tight sm:text-3xl">
            Every dev team has this conversation
          </h2>
          <div className="mt-6 space-y-4 font-mono text-sm">
            <div className="rounded-lg border border-white/5 bg-black/40 p-4">
              <p className="text-zinc-400">
                <span className="text-blue-400">@alice:</span>{" "}
                Hey did you add the new <span className="text-yellow-300">STRIPE_WEBHOOK_SECRET</span> to your .env?
              </p>
            </div>
            <div className="rounded-lg border border-white/5 bg-black/40 p-4">
              <p className="text-zinc-400">
                <span className="text-purple-400">@bob:</span>{" "}
                Wait there&apos;s a new one? Since when?
              </p>
            </div>
          </div>
          <p className="mt-6 text-zinc-400 leading-relaxed">
            Environment variable drift causes bugs that are impossible to reproduce, broken local setups,
            and secrets leaking through Slack DMs.{" "}
            <span className="font-semibold text-white">EnvSync fixes this</span> — and keeps everything on
            your own infrastructure.
          </p>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════ */}
      {/*  FEATURES                                                 */}
      {/* ═══════════════════════════════════════════════════════════ */}
      <section id="features" className="mx-auto max-w-6xl px-6 py-20">
        <SectionHeading
          badge="Features"
          title="Everything you need to sync secrets"
          subtitle="A CLI-first tool set paired with a powerful web dashboard. Built for teams who take security seriously."
        />

        <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((f, i) => (
            <div
              key={i}
              className="group rounded-2xl border border-white/[0.06] bg-zinc-900/40 p-6 transition hover:border-emerald-500/20 hover:bg-emerald-500/[0.03]"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-zinc-800/80 text-emerald-400 transition group-hover:border-emerald-500/30 group-hover:bg-emerald-500/10">
                {f.icon}
              </div>
              <h3 className="mt-4 font-semibold tracking-tight">{f.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-zinc-500">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════ */}
      {/*  CLI                                                      */}
      {/* ═══════════════════════════════════════════════════════════ */}
      <section id="cli" className="mx-auto max-w-6xl px-6 py-20">
        <SectionHeading
          badge="CLI"
          title="Feels like git for secrets"
          subtitle="Install the CLI, log in via Keycloak SSO, and start syncing env vars in seconds."
        />

        <div className="mt-14 grid gap-6 lg:grid-cols-2">
          {/* Left – command list */}
          <div className="space-y-3">
            {[
              { cmd: "envsync init --project my-app --env dev", desc: "Initialize a vault for your project" },
              { cmd: "envsync push", desc: "Encrypt & push local .env to the vault" },
              { cmd: "envsync pull", desc: "Pull latest secrets from the vault" },
              { cmd: "envsync diff", desc: "See what changed between local & remote" },
              { cmd: "envsync log", desc: "View full audit log for the vault" },
              { cmd: "envsync rollback --version 12", desc: "Restore a previous vault version" },
              { cmd: "envsync set KEY \"value\"", desc: "Set a single variable remotely" },
              { cmd: "envsync envs", desc: "List all environments" },
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-4 rounded-xl border border-white/[0.06] bg-zinc-900/40 px-5 py-4">
                <code className="shrink-0 font-mono text-sm text-emerald-400">{item.cmd}</code>
                <span className="ml-auto text-right text-xs text-zinc-500 min-w-0">{item.desc}</span>
              </div>
            ))}
          </div>

          {/* Right – tall terminal */}
          <div className="overflow-hidden rounded-2xl border border-white/10 bg-zinc-950">
            <div className="flex items-center gap-2 border-b border-white/5 px-4 py-3">
              <span className="h-3 w-3 rounded-full bg-red-500/70" />
              <span className="h-3 w-3 rounded-full bg-yellow-500/70" />
              <span className="h-3 w-3 rounded-full bg-green-500/70" />
              <span className="ml-2 text-xs text-zinc-500">zsh — envsync diff</span>
            </div>
            <div className="p-5 font-mono text-sm leading-7">
              <p className="text-zinc-200"><span className="text-emerald-400">❯ </span>envsync diff</p>
              <p className="mt-3 text-zinc-500">Comparing local .env ↔ vault (v14)</p>
              <div className="mt-3 rounded-lg border border-white/5 bg-black/50 p-4 space-y-1">
                <p className="text-green-400">+ STRIPE_WEBHOOK_SECRET=whsec_●●●●●●●●</p>
                <p className="text-green-400">+ FEATURE_FLAG_V2=true</p>
                <p className="text-yellow-400">~ DATABASE_URL=postgres://...→...prod</p>
                <p className="text-red-400">- DEPRECATED_API_KEY</p>
                <p className="text-zinc-600">  NEXT_PUBLIC_URL=https://app.example.com</p>
                <p className="text-zinc-600">  REDIS_URL=redis://cache:6379</p>
              </div>
              <p className="mt-3 text-zinc-500">3 added · 1 modified · 1 removed · 2 unchanged</p>
              <p className="mt-3 text-zinc-200">
                <span className="text-emerald-400">❯ </span>envsync pull
              </p>
              <p className="text-zinc-500 pl-4">✓ Pulled vault v14 → .env (4 changes applied)</p>
              <div className="mt-1 text-zinc-200">
                <span className="text-emerald-400">❯ </span>
                <span className="cursor-blink">▊</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════ */}
      {/*  ARCHITECTURE                                             */}
      {/* ═══════════════════════════════════════════════════════════ */}
      <section id="architecture" className="mx-auto max-w-6xl px-6 py-20">
        <SectionHeading
          badge="Architecture"
          title="Self-hosted. Zero cloud dependencies."
          subtitle="Every component runs on your own infrastructure with Docker Compose. Nothing phones home."
        />

        <div className="mt-14 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {archNodes.map((node, i) => (
            <div
              key={i}
              className={`rounded-2xl border p-5 transition ${node.color}`}
            >
              <p className="text-sm font-semibold">{node.label}</p>
              <p className="mt-1 text-xs text-zinc-500">{node.sub}</p>
            </div>
          ))}
        </div>

        {/* Connection hint */}
        <div className="mt-8 text-center text-xs text-zinc-600">
          All services connected via Docker internal network · TLS terminated at NGINX
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════ */}
      {/*  TECH STACK                                               */}
      {/* ═══════════════════════════════════════════════════════════ */}
      <section className="mx-auto max-w-4xl px-6 py-20">
        <SectionHeading badge="Stack" title="Built with batteries included" subtitle="Every layer is production-grade, battle-tested open-source tech." />

        <div className="mt-14 overflow-hidden rounded-2xl border border-white/[0.06]">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-white/[0.06] bg-zinc-900/60 text-xs uppercase tracking-wider text-zinc-500">
                <th className="px-6 py-4 font-medium">Layer</th>
                <th className="px-6 py-4 font-medium">Technology</th>
                <th className="px-6 py-4 font-medium hidden sm:table-cell">Detail</th>
              </tr>
            </thead>
            <tbody>
              {techStack.map((row, i) => (
                <tr key={i} className="border-b border-white/[0.03] last:border-0 hover:bg-white/[0.02] transition">
                  <td className="px-6 py-4 text-zinc-400">{row.layer}</td>
                  <td className="px-6 py-4 font-medium text-emerald-400">{row.tech}</td>
                  <td className="px-6 py-4 text-zinc-500 hidden sm:table-cell">{row.detail}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════ */}
      {/*  SECURITY                                                 */}
      {/* ═══════════════════════════════════════════════════════════ */}
      <section id="security" className="mx-auto max-w-6xl px-6 py-20">
        <SectionHeading
          badge="Security"
          title="Zero-knowledge encryption"
          subtitle="Your secrets are encrypted before they leave your machine. The server physically cannot read them."
        />

        <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { step: "01", title: "Key derivation", desc: "Password → secret key via Argon2id (memory-hard KDF)" },
            { step: "02", title: "Client-side encrypt", desc: "XChaCha20-Poly1305 encrypts your .env before upload" },
            { step: "03", title: "Server stores ciphertext", desc: "PostgreSQL only ever sees encrypted blobs — zero knowledge" },
            { step: "04", title: "Team sharing", desc: "Vault key wrapped with each member's public key (asymmetric)" },
          ].map((s, i) => (
            <div key={i} className="rounded-2xl border border-white/[0.06] bg-zinc-900/40 p-6">
              <span className="font-mono text-2xl font-black text-emerald-500/30">{s.step}</span>
              <h3 className="mt-3 font-semibold tracking-tight">{s.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-zinc-500">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════ */}
      {/*  GETTING STARTED CTA                                      */}
      {/* ═══════════════════════════════════════════════════════════ */}
      <section className="mx-auto max-w-4xl px-6 py-20">
        <div className="glow-green rounded-3xl border border-emerald-500/20 bg-emerald-500/[0.04] p-10 text-center sm:p-16">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Ready to stop the <span className="text-gradient">.env chaos</span>?
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-zinc-400 leading-relaxed">
            Get up and running in under 5 minutes. Clone the repo, run Docker Compose, and your whole team
            has a single encrypted source of truth.
          </p>

          <div className="mt-8 overflow-hidden rounded-xl border border-white/10 bg-zinc-950 text-left font-mono text-sm mx-auto max-w-lg">
            <div className="flex items-center gap-2 border-b border-white/5 px-4 py-2.5">
              <span className="h-2.5 w-2.5 rounded-full bg-red-500/70" />
              <span className="h-2.5 w-2.5 rounded-full bg-yellow-500/70" />
              <span className="h-2.5 w-2.5 rounded-full bg-green-500/70" />
            </div>
            <div className="p-4 leading-7">
              <p><span className="text-emerald-400">$</span> <span className="text-zinc-300">git clone https://github.com/yourusername/envsync.git</span></p>
              <p><span className="text-emerald-400">$</span> <span className="text-zinc-300">cd envsync && docker compose up -d</span></p>
              <p className="text-zinc-600"># PostgreSQL, Redis, MinIO, Keycloak, NGINX — all running ✓</p>
            </div>
          </div>

          <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="https://github.com/yourusername/envsync"
              target="_blank"
              className="inline-flex h-12 items-center gap-2 rounded-xl bg-emerald-500 px-6 text-sm font-semibold text-black transition hover:bg-emerald-400"
            >
              View on GitHub
              <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
              </svg>
            </Link>
            <Link
              href="/api/auth/signin/keycloak"
              className="inline-flex h-12 items-center rounded-xl border border-white/10 px-6 text-sm font-medium text-zinc-300 transition hover:border-white/20 hover:text-white"
            >
              Try the Dashboard
            </Link>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════ */}
      {/*  FOOTER                                                   */}
      {/* ═══════════════════════════════════════════════════════════ */}
      <footer className="border-t border-white/5 py-12">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-6 px-6 sm:flex-row">
          <div className="flex items-center gap-2 text-sm font-bold tracking-tight">
            <span className="flex h-7 w-7 items-center justify-center rounded-md bg-emerald-500 text-xs font-black text-black">
              E
            </span>
            EnvSync
          </div>

          <div className="flex items-center gap-6 text-sm text-zinc-500">
            <a href="#features" className="transition hover:text-zinc-300">Features</a>
            <a href="#cli" className="transition hover:text-zinc-300">CLI</a>
            <a href="#architecture" className="transition hover:text-zinc-300">Architecture</a>
            <a href="#security" className="transition hover:text-zinc-300">Security</a>
            <Link href="https://github.com/yourusername/envsync" target="_blank" className="transition hover:text-zinc-300">
              GitHub
            </Link>
          </div>

          <p className="text-xs text-zinc-600">
            Built to solve a real problem. No cloud required.
          </p>
        </div>
      </footer>
    </div>
  );
}

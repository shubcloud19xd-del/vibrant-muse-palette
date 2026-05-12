import { createFileRoute, Outlet, Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { useEffect } from "react";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/app")({
  component: AppLayout,
  head: () => ({ meta: [{ title: "Workspace — HenWork" }] }),
});

function AppLayout() {
  const { user, loading, signOut } = useAuth();
  const nav = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => {
    if (!loading && !user) nav({ to: "/login" });
  }, [user, loading, nav]);

  if (loading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-canvas text-ink/60">Loading…</div>
    );
  }

  return (
    <div className="min-h-screen bg-canvas font-sans text-ink">
      <header className="sticky top-0 z-20 border-b border-ink/10 bg-gradient-sky/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link to="/app" className="flex items-center gap-2 font-serif text-xl font-bold">
            <span aria-hidden>🐦</span> HenWork
          </Link>
          <nav className="hidden items-center gap-6 text-sm font-medium text-ink/80 md:flex">
            <Link to="/app" className={pathname === "/app" ? "text-ink" : "hover:text-ink"}>
              Dashboard
            </Link>
          </nav>
          <div className="flex items-center gap-3">
            <span className="hidden text-sm text-ink/70 sm:inline">{user.email}</span>
            <button
              onClick={async () => {
                await signOut();
                nav({ to: "/login" });
              }}
              className="rounded-md border border-ink/15 bg-white/70 px-3 py-1.5 text-sm transition hover:bg-white"
            >
              Sign out
            </button>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-6 py-10">
        <Outlet />
      </main>
    </div>
  );
}

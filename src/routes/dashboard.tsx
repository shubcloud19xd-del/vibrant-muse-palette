import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/dashboard")({
  component: DashboardPage,
  head: () => ({
    meta: [{ title: "Your workspace — HenWork" }],
  }),
});

function DashboardPage() {
  return (
    <div className="min-h-screen bg-canvas font-sans text-ink">
      <header className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
        <Link to="/" className="flex items-center gap-2 font-serif text-2xl font-bold text-ink">
          <span aria-hidden>🐦</span> HenWork
        </Link>
      </header>
      <main className="mx-auto max-w-3xl px-6 py-16 text-center">
        <h1 className="font-serif text-4xl text-ink sm:text-5xl">Welcome to your workspace</h1>
        <p className="mt-4 text-ink/75">
          This is where your team, projects, and tasks will live.
        </p>
      </main>
    </div>
  );
}

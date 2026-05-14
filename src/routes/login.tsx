import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/login")({
  component: LoginPage,
  head: () => ({
    meta: [
      { title: "Sign in — HenWork" },
      { name: "description", content: "Welcome back. Sign in to your HenWork workspace." },
    ],
  }),
});

function LoginPage() {
  return (
    <div className="min-h-screen bg-canvas font-sans text-ink flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md rounded-2xl border border-ink/10 bg-white/70 p-8 shadow-soft backdrop-blur">
        <Link to="/" className="flex items-center gap-2 font-serif text-xl font-bold text-ink">
          <span aria-hidden>🐦</span> HenWork
        </Link>
        <h1 className="mt-6 font-serif text-3xl text-ink">Welcome back</h1>
        <p className="mt-2 text-sm text-ink/70">Sign in to continue to your workspace.</p>

        <form className="mt-6 space-y-4" onSubmit={(e) => e.preventDefault()}>
          <div>
            <label className="text-sm font-medium text-ink" htmlFor="email">Email</label>
            <input id="email" type="email" required className="mt-1 w-full rounded-md border border-ink/15 bg-white px-3 py-2 text-sm outline-none focus:border-ink/40" />
          </div>
          <div>
            <label className="text-sm font-medium text-ink" htmlFor="password">Password</label>
            <input id="password" type="password" required className="mt-1 w-full rounded-md border border-ink/15 bg-white px-3 py-2 text-sm outline-none focus:border-ink/40" />
          </div>
          <button type="submit" className="w-full rounded-md bg-ink px-4 py-2.5 text-sm font-medium text-canvas transition hover:bg-ink/90">
            Sign in
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-ink/70">
          New to HenWork?{" "}
          <Link to="/signup" className="font-medium text-ink underline-offset-4 hover:underline">
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
}

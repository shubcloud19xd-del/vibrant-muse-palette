import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/signup")({
  component: SignupPage,
  head: () => ({
    meta: [
      { title: "Create your workspace — HenWork" },
      { name: "description", content: "Create your HenWork account and set up a calmer workspace for your team." },
    ],
  }),
});

function SignupPage() {
  return (
    <div className="min-h-screen bg-canvas font-sans text-ink flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md rounded-2xl border border-ink/10 bg-white/70 p-8 shadow-soft backdrop-blur">
        <Link to="/" className="flex items-center gap-2 font-serif text-xl font-bold text-ink">
          <span aria-hidden>🐦</span> HenWork
        </Link>
        <h1 className="mt-6 font-serif text-3xl text-ink">Create your account</h1>
        <p className="mt-2 text-sm text-ink/70">Start organizing your team in minutes.</p>

        <form className="mt-6 space-y-4" onSubmit={(e) => e.preventDefault()}>
          <div>
            <label className="text-sm font-medium text-ink" htmlFor="name">Full name</label>
            <input id="name" type="text" required className="mt-1 w-full rounded-md border border-ink/15 bg-white px-3 py-2 text-sm outline-none focus:border-ink/40" />
          </div>
          <div>
            <label className="text-sm font-medium text-ink" htmlFor="email">Email</label>
            <input id="email" type="email" required className="mt-1 w-full rounded-md border border-ink/15 bg-white px-3 py-2 text-sm outline-none focus:border-ink/40" />
          </div>
          <div>
            <label className="text-sm font-medium text-ink" htmlFor="password">Password</label>
            <input id="password" type="password" required className="mt-1 w-full rounded-md border border-ink/15 bg-white px-3 py-2 text-sm outline-none focus:border-ink/40" />
          </div>
          <button type="submit" className="w-full rounded-md bg-ink px-4 py-2.5 text-sm font-medium text-canvas transition hover:bg-ink/90">
            Create your workspace
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-ink/70">
          Already have an account?{" "}
          <Link to="/login" className="font-medium text-ink underline-offset-4 hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}

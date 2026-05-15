import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";

export const Route = createFileRoute("/signup")({
  component: SignupPage,
  head: () => ({
    meta: [{ title: "Create your account — HenWork" }],
  }),
});

function SignupPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-canvas font-sans text-ink flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-md">
        <Link to="/" className="flex items-center justify-center gap-2 font-serif text-2xl font-bold text-ink mb-8">
          <span aria-hidden>🐦</span> HenWork
        </Link>
        <h1 className="font-serif text-3xl text-ink text-center">Create your account</h1>
        <p className="mt-2 text-center text-ink/70">Start your calmer workspace today.</p>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            navigate({ to: "/dashboard" });
          }}
          className="mt-8 space-y-4"
        >
          <input
            type="text"
            placeholder="Full name"
            className="w-full rounded-md border border-ink/15 bg-white/70 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ink/20"
          />
          <input
            type="email"
            placeholder="Email"
            className="w-full rounded-md border border-ink/15 bg-white/70 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ink/20"
          />
          <input
            type="password"
            placeholder="Password"
            className="w-full rounded-md border border-ink/15 bg-white/70 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ink/20"
          />
          <button
            type="submit"
            className="w-full rounded-md bg-ink px-4 py-2.5 text-sm font-medium text-canvas hover:bg-ink/90 transition"
          >
            Create account
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-ink/70">
          Already have an account?{" "}
          <Link to="/login" className="font-medium text-ink underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}

import { createFileRoute, Link } from "@tanstack/react-router";
import heroLandscape from "@/assets/hero-landscape.jpg";

export const Route = createFileRoute("/")({
  component: Index,
  head: () => ({
    meta: [
      { title: "HenWork — A calmer way to manage team work" },
      {
        name: "description",
        content:
          "Organize teams, projects, and tasks in one calm, beautiful workspace. HenWork keeps your work flowing without the noise.",
      },
    ],
  }),
});

function Index() {
  const navLinks = ["Product", "Teams", "Pricing", "Stories", "Company"];

  return (
    <div className="min-h-screen bg-canvas font-sans text-ink">
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-sky lg:hidden" aria-hidden />
        <img
          src={heroLandscape}
          alt=""
          width={1920}
          height={1080}
          className="pointer-events-none absolute inset-x-0 bottom-0 w-full select-none lg:bottom-auto lg:top-0"
          aria-hidden
        />

        <div className="relative z-10">
          <header className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-4 sm:px-6 sm:py-5">
            <div className="flex items-center gap-10">
              <Link to="/" className="flex items-center gap-2 font-serif text-xl font-bold tracking-tight text-ink sm:text-2xl">
                <span aria-hidden className="text-[1.2rem] sm:text-[1.4rem]">🐦</span>
                HenWork
              </Link>
              <nav className="hidden items-center gap-7 text-sm font-medium text-ink/85 lg:flex">
                {navLinks.map((l) => (
                  <a key={l} href="#" className="transition hover:text-ink">
                    {l}
                  </a>
                ))}
              </nav>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <Link
                to="/login"
                className="whitespace-nowrap rounded-md border border-ink/15 bg-white/70 px-3 py-1.5 text-xs font-medium text-ink transition hover:bg-white sm:px-4 sm:py-2 sm:text-sm"
              >
                Sign in
              </Link>
              <Link
                to="/signup"
                className="whitespace-nowrap rounded-md bg-ink px-3 py-1.5 text-xs font-medium text-canvas transition hover:bg-ink/90 sm:px-4 sm:py-2 sm:text-sm"
              >
                Get started
              </Link>
            </div>
          </header>

          <section className="mx-auto max-w-5xl px-6 pt-16 pb-[28rem] text-center sm:pb-[34rem] md:pt-24 md:pb-[40rem]">
            <h1 className="font-serif text-5xl leading-[1.05] text-ink sm:text-6xl md:text-7xl">
              Team work, finally
              <br />
              at a calmer pace.
            </h1>
            <p className="mx-auto mt-8 max-w-xl text-lg leading-relaxed text-ink/80">
              Organize your team, projects, and tasks in one beautiful workspace —
              <br className="hidden sm:block" /> built for clarity, not clutter.
            </p>
            <div className="mt-10 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:flex-wrap sm:items-center">
              <Link
                to="/signup"
                className="rounded-md bg-ink px-8 py-3.5 text-base font-medium text-canvas shadow-soft transition hover:-translate-y-0.5"
              >
                Create your workspace
              </Link>
              <Link
                to="/login"
                className="rounded-md bg-white px-8 py-3.5 text-base font-medium text-ink shadow-soft transition hover:-translate-y-0.5"
              >
                Sign in
              </Link>
            </div>
          </section>
        </div>
      </div>

      <section className="bg-canvas px-6 py-24">
        <div className="mx-auto max-w-6xl">
          <h2 className="max-w-3xl font-serif text-4xl leading-tight text-ink sm:text-5xl">
            Everything your team needs. Nothing it doesn't.
          </h2>
          <div className="mt-16 grid gap-10 md:grid-cols-3">
            {[
              { t: "Organizations & roles", d: "Group your team, assign admins or members, and keep work properly scoped." },
              { t: "Projects & tasks", d: "Plan with priorities, due dates, and statuses. Track progress without ceremony." },
              { t: "Conversations in context", d: "Threaded comments on every task — decisions live where the work happens." },
            ].map((f) => (
              <article key={f.t} className="rounded-2xl border border-ink/10 bg-white/60 p-7 shadow-soft backdrop-blur transition hover:-translate-y-1">
                <h3 className="font-serif text-2xl text-ink">{f.t}</h3>
                <p className="mt-3 text-ink/75">{f.d}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <footer className="border-t border-ink/10 bg-canvas px-6 py-10 text-sm text-ink/70">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 sm:flex-row">
          <span className="font-serif text-lg text-ink">🐦 HenWork</span>
          <span>© {new Date().getFullYear()} HenWork Workspace.</span>
        </div>
      </footer>
    </div>
  );
}

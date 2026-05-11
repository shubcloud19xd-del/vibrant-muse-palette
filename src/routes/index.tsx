import { createFileRoute } from "@tanstack/react-router";
import heroLandscape from "@/assets/hero-landscape.jpg";

export const Route = createFileRoute("/")({
  component: Index,
  head: () => ({
    meta: [
      { title: "Robin — Answering legal questions shouldn't take days" },
      {
        name: "description",
        content:
          "Get instant insights from your documents with Robin's Legal Intelligence Platform.",
      },
    ],
  }),
});

function Index() {
  const navLinks = ["Platform", "Services", "Security", "News & Resources", "Customers", "Company"];

  return (
    <div className="min-h-screen bg-canvas font-sans text-ink">
      {/* Sky + scene wrapper */}
      <div className="relative overflow-hidden">
        {/* Peach sky gradient backdrop */}
        <div className="absolute inset-0 bg-gradient-sky" aria-hidden />

        {/* Landscape illustration anchored to bottom */}
        <img
          src={heroLandscape}
          alt=""
          width={1920}
          height={1080}
          className="pointer-events-none absolute inset-x-0 bottom-0 w-full select-none"
          aria-hidden
        />

        <div className="relative z-10">
          {/* Nav */}
          <header className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
            <div className="flex items-center gap-10">
              <a href="/" className="flex items-center gap-2 font-serif text-2xl font-bold tracking-tight text-ink">
                <span aria-hidden className="text-[1.4rem]">🐦</span>
                Robin
              </a>
              <nav className="hidden items-center gap-7 text-sm font-medium text-ink/85 lg:flex">
                {navLinks.map((l) => (
                  <a key={l} href="#" className="transition hover:text-ink">
                    {l}
                  </a>
                ))}
              </nav>
            </div>
            <div className="flex items-center gap-2">
              <a
                href="#"
                className="rounded-md bg-ink px-4 py-2 text-sm font-medium text-canvas transition hover:bg-ink/90"
              >
                Request Demo
              </a>
              <a
                href="#"
                className="rounded-md bg-ink px-4 py-2 text-sm font-medium text-canvas transition hover:bg-ink/90"
              >
                Sign In
              </a>
            </div>
          </header>

          {/* Hero */}
          <section className="mx-auto max-w-5xl px-6 pt-16 pb-[28rem] text-center sm:pb-[34rem] md:pt-24 md:pb-[40rem]">
            <h1 className="font-serif text-5xl leading-[1.05] text-ink sm:text-6xl md:text-7xl">
              Answering legal questions
              <br />
              shouldn't take days.
            </h1>
            <p className="mx-auto mt-8 max-w-xl text-lg leading-relaxed text-ink/80">
              Get instant insights from your documents with Robin's
              <br className="hidden sm:block" /> Legal Intelligence Platform.
            </p>
            <div className="mt-10 flex justify-center">
              <a
                href="#"
                className="rounded-md bg-white px-8 py-3.5 text-base font-medium text-ink shadow-soft transition hover:-translate-y-0.5 hover:shadow-lg"
              >
                Get a Demo
              </a>
            </div>
          </section>
        </div>
      </div>

      {/* Features section */}
      <section className="bg-canvas px-6 py-24">
        <div className="mx-auto max-w-6xl">
          <h2 className="max-w-3xl font-serif text-4xl leading-tight text-ink sm:text-5xl">
            A calmer way to work with the law.
          </h2>
          <div className="mt-16 grid gap-10 md:grid-cols-3">
            {[
              {
                t: "Instant document review",
                d: "Upload contracts, briefs, and filings — get summarized insights in seconds, not hours.",
              },
              {
                t: "Ask anything",
                d: "Natural-language questions across your entire matter library, with citations to the source.",
              },
              {
                t: "Built for trust",
                d: "Enterprise-grade security, private deployments, and audit trails your firm can rely on.",
              },
            ].map((f) => (
              <article
                key={f.t}
                className="rounded-2xl border border-ink/10 bg-white/60 p-7 shadow-soft backdrop-blur transition hover:-translate-y-1 hover:shadow-lg"
              >
                <h3 className="font-serif text-2xl text-ink">{f.t}</h3>
                <p className="mt-3 text-ink/75">{f.d}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-ink/10 bg-canvas px-6 py-10 text-sm text-ink/70">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 sm:flex-row">
          <span className="font-serif text-lg text-ink">🐦 Robin</span>
          <span>© {new Date().getFullYear()} Robin Legal Intelligence.</span>
        </div>
      </footer>
    </div>
  );
}

import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import heroLandscape from "@/assets/hero-landscape.jpg";

export function AuthShell({ title, subtitle, children }: { title: string; subtitle?: string; children: ReactNode }) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-canvas font-sans text-ink">
      <div className="absolute inset-0 bg-gradient-sky" aria-hidden />
      <img
        src={heroLandscape}
        alt=""
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 w-full select-none opacity-90"
      />
      <div className="relative z-10 flex min-h-screen flex-col">
        <header className="mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-5">
          <Link to="/" className="flex items-center gap-2 font-serif text-2xl font-bold tracking-tight">
            <span aria-hidden>🐦</span> Robin
          </Link>
        </header>
        <main className="flex flex-1 items-center justify-center px-6 pb-32">
          <div className="w-full max-w-md rounded-2xl border border-ink/10 bg-white/85 p-8 shadow-soft backdrop-blur">
            <h1 className="font-serif text-4xl text-ink">{title}</h1>
            {subtitle && <p className="mt-2 text-sm text-ink/70">{subtitle}</p>}
            <div className="mt-6">{children}</div>
          </div>
        </main>
      </div>
    </div>
  );
}

export function Field({ label, ...props }: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-ink/80">{label}</span>
      <input
        {...props}
        className="w-full rounded-md border border-ink/15 bg-white px-3 py-2.5 text-ink outline-none transition focus:border-ink/40 focus:ring-2 focus:ring-ink/10"
      />
    </label>
  );
}

export function PrimaryButton(props: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      className={
        "inline-flex items-center justify-center rounded-md bg-ink px-5 py-2.5 text-sm font-medium text-canvas transition hover:bg-ink/90 disabled:opacity-50 " +
        (props.className ?? "")
      }
    />
  );
}

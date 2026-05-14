import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { AuthShell, Field, PrimaryButton } from "@/components/AuthShell";

export const Route = createFileRoute("/signup")({
  component: SignupPage,
  head: () => ({ meta: [{ title: "Create account — HenWork" }] }),
});

function SignupPage() {
  const nav = useNavigate();
  const [first, setFirst] = useState("");
  const [last, setLast] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    const redirect = typeof window !== "undefined" ? `${window.location.origin}/app` : undefined;
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: redirect, data: { first_name: first, last_name: last } },
    });
    setBusy(false);
    if (error) return toast.error(error.message);
    toast.success("Account created");
    nav({ to: "/app" });
  };

  return (
    <AuthShell title="Create your account" subtitle="Start organizing work in minutes.">
      <button
        type="button"
        onClick={async () => {
          const redirect = typeof window !== "undefined" ? `${window.location.origin}/app` : undefined;
          const { error } = await supabase.auth.signInWithOAuth({
            provider: "google",
            options: { redirectTo: redirect },
          });
          if (error) toast.error(error.message);
        }}
        className="mb-4 inline-flex w-full items-center justify-center gap-2 rounded-md border border-ink/15 bg-white px-5 py-2.5 text-sm font-medium text-ink transition hover:bg-ink/5"
      >
        <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden>
          <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z"/>
          <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z"/>
          <path fill="#FBBC05" d="M3.964 10.706A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.706V4.962H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.038l3.007-2.332z"/>
          <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.962L3.964 7.294C4.672 5.167 6.656 3.58 9 3.58z"/>
        </svg>
        Continue with Google
      </button>
      <div className="mb-4 flex items-center gap-3 text-xs text-ink/50">
        <div className="h-px flex-1 bg-ink/10" />
        <span>or</span>
        <div className="h-px flex-1 bg-ink/10" />
      </div>
      <form onSubmit={submit} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <Field label="First name" required value={first} onChange={(e) => setFirst(e.target.value)} />
          <Field label="Last name" value={last} onChange={(e) => setLast(e.target.value)} />
        </div>
        <Field label="Email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
        <Field label="Password" type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} />
        <PrimaryButton type="submit" disabled={busy} className="w-full">
          {busy ? "Creating…" : "Create account"}
        </PrimaryButton>
      </form>
      <p className="mt-5 text-sm text-ink/70">
        Already have one?{" "}
        <Link to="/login" className="font-medium text-ink underline underline-offset-4">
          Sign in
        </Link>
      </p>
    </AuthShell>
  );
}

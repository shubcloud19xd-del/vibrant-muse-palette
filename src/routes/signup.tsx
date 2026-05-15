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

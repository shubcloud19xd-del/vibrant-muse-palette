import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/app/")({
  component: Dashboard,
});

type Org = { id: string; name: string; description: string | null; owner_id: string };

function Dashboard() {
  const { user } = useAuth();
  const [orgs, setOrgs] = useState<Org[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [creating, setCreating] = useState(false);
  const [stats, setStats] = useState({ projects: 0, tasks: 0, openTasks: 0 });

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("organizations" as never)
      .select("id, name, description, owner_id")
      .order("created_at", { ascending: false });
    if (error) toast.error(error.message);
    setOrgs((data as unknown as Org[]) ?? []);
    const [{ count: pc }, { count: tc }, { count: ot }] = await Promise.all([
      supabase.from("projects" as never).select("id", { count: "exact", head: true }),
      supabase.from("tasks" as never).select("id", { count: "exact", head: true }),
      supabase.from("tasks" as never).select("id", { count: "exact", head: true }).neq("status", "completed"),
    ]);
    setStats({ projects: pc ?? 0, tasks: tc ?? 0, openTasks: ot ?? 0 });
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const create = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setCreating(true);
    const { error } = await supabase
      .from("organizations" as never)
      .insert({ name, description: desc || null, owner_id: user.id } as never);
    setCreating(false);
    if (error) return toast.error(error.message);
    setName("");
    setDesc("");
    toast.success("Organization created");
    load();
  };

  return (
    <div className="space-y-10">
      <section>
        <h1 className="font-serif text-4xl text-ink">Welcome back.</h1>
        <p className="mt-2 text-ink/70">A calmer way to work with your team.</p>
        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          {[
            { l: "Organizations", v: orgs.length },
            { l: "Projects", v: stats.projects },
            { l: "Open tasks", v: stats.openTasks },
          ].map((s) => (
            <div key={s.l} className="rounded-2xl border border-ink/10 bg-white/70 p-5 shadow-soft">
              <div className="text-sm text-ink/60">{s.l}</div>
              <div className="mt-1 font-serif text-3xl">{s.v}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="grid gap-8 md:grid-cols-[1fr_320px]">
        <div>
          <h2 className="font-serif text-2xl text-ink">Your organizations</h2>
          {loading ? (
            <p className="mt-4 text-ink/60">Loading…</p>
          ) : orgs.length === 0 ? (
            <p className="mt-4 text-ink/60">No organizations yet — create your first.</p>
          ) : (
            <ul className="mt-4 grid gap-3">
              {orgs.map((o) => (
                <li key={o.id}>
                  <Link
                    to="/app/org/$orgId"
                    params={{ orgId: o.id }}
                    className="block rounded-xl border border-ink/10 bg-white/70 p-4 transition hover:-translate-y-0.5 hover:shadow-soft"
                  >
                    <div className="font-serif text-lg text-ink">{o.name}</div>
                    {o.description && <div className="text-sm text-ink/65">{o.description}</div>}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>

        <form onSubmit={create} className="h-fit rounded-2xl border border-ink/10 bg-white/80 p-5 shadow-soft">
          <h3 className="font-serif text-xl">New organization</h3>
          <div className="mt-3 space-y-3">
            <input
              required
              placeholder="Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-md border border-ink/15 bg-white px-3 py-2 text-sm outline-none focus:border-ink/40"
            />
            <textarea
              placeholder="Description (optional)"
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              rows={3}
              className="w-full rounded-md border border-ink/15 bg-white px-3 py-2 text-sm outline-none focus:border-ink/40"
            />
            <button
              type="submit"
              disabled={creating}
              className="w-full rounded-md bg-ink px-4 py-2 text-sm font-medium text-canvas transition hover:bg-ink/90 disabled:opacity-50"
            >
              {creating ? "Creating…" : "Create"}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}

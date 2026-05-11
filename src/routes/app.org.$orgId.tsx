import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/app/org/$orgId")({
  component: OrgPage,
});

type Project = { id: string; name: string; description: string | null };
type Member = { id: string; user_id: string; role: string };
type Profile = { id: string; first_name: string | null; last_name: string | null };

function OrgPage() {
  const { orgId } = Route.useParams();
  const { user } = useAuth();
  const [orgName, setOrgName] = useState("");
  const [projects, setProjects] = useState<Project[]>([]);
  const [members, setMembers] = useState<(Member & { profile?: Profile })[]>([]);
  const [myRole, setMyRole] = useState<string>("member");
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");

  const load = async () => {
    const [{ data: org }, { data: ps }, { data: ms }] = await Promise.all([
      supabase.from("organizations" as never).select("name").eq("id", orgId).single(),
      supabase.from("projects" as never).select("id, name, description").eq("organization_id", orgId).order("created_at", { ascending: false }),
      supabase.from("organization_members" as never).select("id, user_id, role").eq("organization_id", orgId),
    ]);
    setOrgName((org as { name: string } | null)?.name ?? "");
    setProjects((ps as unknown as Project[]) ?? []);
    const memberList = (ms as unknown as Member[]) ?? [];
    const userIds = memberList.map((m) => m.user_id);
    let profiles: Profile[] = [];
    if (userIds.length) {
      const { data: ps2 } = await supabase.from("profiles" as never).select("id, first_name, last_name").in("id", userIds);
      profiles = (ps2 as unknown as Profile[]) ?? [];
    }
    setMembers(memberList.map((m) => ({ ...m, profile: profiles.find((p) => p.id === m.user_id) })));
    if (user) {
      const me = memberList.find((m) => m.user_id === user.id);
      setMyRole(me?.role ?? "member");
    }
  };

  useEffect(() => {
    load();
  }, [orgId]);

  const createProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    const { error } = await supabase
      .from("projects" as never)
      .insert({ organization_id: orgId, name, description: desc || null, owner_id: user.id } as never);
    if (error) return toast.error(error.message);
    setName("");
    setDesc("");
    toast.success("Project created");
    load();
  };

  const addMember = async (e: React.FormEvent) => {
    e.preventDefault();
    // Find user by email via profiles isn't direct; we look up via auth — not exposed.
    // For MVP, accept user UUID OR show informative error.
    toast.info("Invite by user ID for now (see member's profile id).");
    if (inviteEmail.length < 36) return;
    const { error } = await supabase
      .from("organization_members" as never)
      .insert({ organization_id: orgId, user_id: inviteEmail, role: "member" } as never);
    if (error) return toast.error(error.message);
    setInviteEmail("");
    toast.success("Member added");
    load();
  };

  const setRole = async (id: string, role: string) => {
    const { error } = await supabase.from("organization_members" as never).update({ role } as never).eq("id", id);
    if (error) return toast.error(error.message);
    load();
  };

  const removeMember = async (id: string) => {
    const { error } = await supabase.from("organization_members" as never).delete().eq("id", id);
    if (error) return toast.error(error.message);
    load();
  };

  return (
    <div className="space-y-10">
      <div>
        <Link to="/app" className="text-sm text-ink/60 hover:text-ink">← Dashboard</Link>
        <h1 className="mt-2 font-serif text-4xl text-ink">{orgName || "Organization"}</h1>
        <p className="text-sm text-ink/60">Your role: <span className="font-medium text-ink">{myRole}</span></p>
      </div>

      <section className="grid gap-8 md:grid-cols-[1fr_320px]">
        <div>
          <h2 className="font-serif text-2xl">Projects</h2>
          {projects.length === 0 ? (
            <p className="mt-3 text-ink/60">No projects yet.</p>
          ) : (
            <ul className="mt-4 grid gap-3">
              {projects.map((p) => (
                <li key={p.id}>
                  <Link
                    to="/app/project/$projectId"
                    params={{ projectId: p.id }}
                    className="block rounded-xl border border-ink/10 bg-white/70 p-4 transition hover:-translate-y-0.5 hover:shadow-soft"
                  >
                    <div className="font-serif text-lg">{p.name}</div>
                    {p.description && <div className="text-sm text-ink/65">{p.description}</div>}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>

        <form onSubmit={createProject} className="h-fit rounded-2xl border border-ink/10 bg-white/80 p-5 shadow-soft">
          <h3 className="font-serif text-xl">New project</h3>
          <div className="mt-3 space-y-3">
            <input
              required
              placeholder="Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-md border border-ink/15 bg-white px-3 py-2 text-sm outline-none focus:border-ink/40"
            />
            <textarea
              placeholder="Description"
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              rows={3}
              className="w-full rounded-md border border-ink/15 bg-white px-3 py-2 text-sm outline-none focus:border-ink/40"
            />
            <button className="w-full rounded-md bg-ink px-4 py-2 text-sm font-medium text-canvas hover:bg-ink/90">Create</button>
          </div>
        </form>
      </section>

      <section>
        <h2 className="font-serif text-2xl">Members</h2>
        <div className="mt-4 overflow-hidden rounded-2xl border border-ink/10 bg-white/70">
          <table className="w-full text-sm">
            <thead className="bg-ink/5 text-left text-ink/70">
              <tr>
                <th className="px-4 py-2.5">Name</th>
                <th className="px-4 py-2.5">Role</th>
                <th className="px-4 py-2.5"></th>
              </tr>
            </thead>
            <tbody>
              {members.map((m) => (
                <tr key={m.id} className="border-t border-ink/10">
                  <td className="px-4 py-3">
                    {m.profile?.first_name || m.profile?.last_name
                      ? `${m.profile?.first_name ?? ""} ${m.profile?.last_name ?? ""}`.trim()
                      : m.user_id.slice(0, 8) + "…"}
                  </td>
                  <td className="px-4 py-3">
                    {myRole === "admin" ? (
                      <select
                        value={m.role}
                        onChange={(e) => setRole(m.id, e.target.value)}
                        className="rounded border border-ink/15 bg-white px-2 py-1 text-sm"
                      >
                        <option value="admin">admin</option>
                        <option value="member">member</option>
                      </select>
                    ) : (
                      <span>{m.role}</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {myRole === "admin" && m.user_id !== user?.id && (
                      <button onClick={() => removeMember(m.id)} className="text-sm text-ink/60 hover:text-ink">
                        Remove
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {myRole === "admin" && (
          <form onSubmit={addMember} className="mt-4 flex gap-2">
            <input
              placeholder="User ID (UUID) to add"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              className="flex-1 rounded-md border border-ink/15 bg-white px-3 py-2 text-sm outline-none focus:border-ink/40"
            />
            <button className="rounded-md bg-ink px-4 py-2 text-sm font-medium text-canvas hover:bg-ink/90">Add</button>
          </form>
        )}
      </section>
    </div>
  );
}

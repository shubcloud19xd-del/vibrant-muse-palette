import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/app/task/$taskId")({
  component: TaskPage,
});

type Task = {
  id: string;
  project_id: string;
  title: string;
  description: string | null;
  status: "todo" | "in_progress" | "completed";
  priority: "low" | "medium" | "high";
  due_date: string | null;
};
type Comment = { id: string; user_id: string; content: string; created_at: string };
type Profile = { id: string; first_name: string | null; last_name: string | null };

function TaskPage() {
  const { taskId } = Route.useParams();
  const { user } = useAuth();
  const [task, setTask] = useState<Task | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [profiles, setProfiles] = useState<Record<string, Profile>>({});
  const [content, setContent] = useState("");

  const load = async () => {
    const { data: t } = await supabase
      .from("tasks" as never)
      .select("id, project_id, title, description, status, priority, due_date")
      .eq("id", taskId)
      .single();
    setTask((t as unknown as Task) ?? null);
    const { data: cs } = await supabase
      .from("task_comments" as never)
      .select("id, user_id, content, created_at")
      .eq("task_id", taskId)
      .order("created_at", { ascending: true });
    const list = (cs as unknown as Comment[]) ?? [];
    setComments(list);
    const ids = Array.from(new Set(list.map((c) => c.user_id)));
    if (ids.length) {
      const { data: ps } = await supabase.from("profiles" as never).select("id, first_name, last_name").in("id", ids);
      const map: Record<string, Profile> = {};
      ((ps as unknown as Profile[]) ?? []).forEach((p) => (map[p.id] = p));
      setProfiles(map);
    }
  };

  useEffect(() => {
    load();
  }, [taskId]);

  const addComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !content.trim()) return;
    const { error } = await supabase
      .from("task_comments" as never)
      .insert({ task_id: taskId, user_id: user.id, content } as never);
    if (error) return toast.error(error.message);
    setContent("");
    load();
  };

  const updateField = async (patch: Partial<Task>) => {
    const { error } = await supabase.from("tasks" as never).update(patch as never).eq("id", taskId);
    if (error) return toast.error(error.message);
    load();
  };

  if (!task) return <p className="text-ink/60">Loading…</p>;

  return (
    <div className="space-y-8">
      <Link to="/app/project/$projectId" params={{ projectId: task.project_id }} className="text-sm text-ink/60 hover:text-ink">
        ← Back to project
      </Link>

      <div className="rounded-2xl border border-ink/10 bg-white/80 p-6 shadow-soft">
        <h1 className="font-serif text-3xl">{task.title}</h1>
        {task.description && <p className="mt-2 text-ink/75">{task.description}</p>}
        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          <label className="text-sm">
            <span className="block text-ink/60">Status</span>
            <select value={task.status} onChange={(e) => updateField({ status: e.target.value as Task["status"] })}
              className="mt-1 w-full rounded-md border border-ink/15 bg-white px-2 py-1.5">
              <option value="todo">todo</option>
              <option value="in_progress">in progress</option>
              <option value="completed">completed</option>
            </select>
          </label>
          <label className="text-sm">
            <span className="block text-ink/60">Priority</span>
            <select value={task.priority} onChange={(e) => updateField({ priority: e.target.value as Task["priority"] })}
              className="mt-1 w-full rounded-md border border-ink/15 bg-white px-2 py-1.5">
              <option value="low">low</option>
              <option value="medium">medium</option>
              <option value="high">high</option>
            </select>
          </label>
          <label className="text-sm">
            <span className="block text-ink/60">Due date</span>
            <input type="date" value={task.due_date ? task.due_date.slice(0, 10) : ""}
              onChange={(e) => updateField({ due_date: e.target.value || null })}
              className="mt-1 w-full rounded-md border border-ink/15 bg-white px-2 py-1.5" />
          </label>
        </div>
      </div>

      <section>
        <h2 className="font-serif text-2xl">Comments</h2>
        <ul className="mt-4 space-y-3">
          {comments.map((c) => {
            const p = profiles[c.user_id];
            const name = p?.first_name || p?.last_name ? `${p?.first_name ?? ""} ${p?.last_name ?? ""}`.trim() : "Member";
            return (
              <li key={c.id} className="rounded-xl border border-ink/10 bg-white/70 p-4">
                <div className="flex items-baseline justify-between">
                  <span className="font-medium text-ink">{name}</span>
                  <span className="text-xs text-ink/55">{new Date(c.created_at).toLocaleString()}</span>
                </div>
                <p className="mt-1 whitespace-pre-wrap text-ink/80">{c.content}</p>
              </li>
            );
          })}
          {comments.length === 0 && <p className="text-ink/60">No comments yet.</p>}
        </ul>
        <form onSubmit={addComment} className="mt-4 flex gap-2">
          <input
            placeholder="Write a comment…"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="flex-1 rounded-md border border-ink/15 bg-white px-3 py-2 text-sm outline-none focus:border-ink/40"
          />
          <button className="rounded-md bg-ink px-4 py-2 text-sm font-medium text-canvas hover:bg-ink/90">Post</button>
        </form>
      </section>
    </div>
  );
}

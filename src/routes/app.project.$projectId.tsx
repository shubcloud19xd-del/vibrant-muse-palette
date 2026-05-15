import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/app/project/$projectId")({
  component: ProjectPage,
});

type Task = {
  id: string;
  title: string;
  description: string | null;
  status: "todo" | "in_progress" | "completed";
  priority: "low" | "medium" | "high";
  due_date: string | null;
  assigned_to_id: string | null;
  created_by_id: string;
};

type Project = { id: string; name: string; description: string | null; organization_id: string };

const STATUSES: Task["status"][] = ["todo", "in_progress", "completed"];
const PRIORITIES: Task["priority"][] = ["low", "medium", "high"];

const priorityClasses: Record<Task["priority"], string> = {
  low: "bg-emerald-100 text-emerald-900",
  medium: "bg-amber-100 text-amber-900",
  high: "bg-rose-100 text-rose-900",
};

function ProjectPage() {
  const { projectId } = Route.useParams();
  const { user } = useAuth();
  const [project, setProject] = useState<Project | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterPriority, setFilterPriority] = useState<string>("all");

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<Task["priority"]>("medium");
  const [dueDate, setDueDate] = useState("");

  const load = async () => {
    const { data: pr } = await supabase
      .from("projects" as never)
      .select("id, name, description, organization_id")
      .eq("id", projectId)
      .single();
    setProject((pr as unknown as Project) ?? null);
    const { data: ts, error } = await supabase
      .from("tasks" as never)
      .select("id, title, description, status, priority, due_date, assigned_to_id, created_by_id")
      .eq("project_id", projectId)
      .order("created_at", { ascending: false });
    if (error) toast.error(error.message);
    setTasks((ts as unknown as Task[]) ?? []);
  };

  useEffect(() => {
    load();
  }, [projectId]);

  const create = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    const { error } = await supabase.from("tasks" as never).insert({
      project_id: projectId,
      created_by_id: user.id,
      title,
      description: description || null,
      priority,
      due_date: dueDate || null,
    } as never);
    if (error) return toast.error(error.message);
    setTitle("");
    setDescription("");
    setDueDate("");
    setPriority("medium");
    toast.success("Task added");
    load();
  };

  const updateTask = async (id: string, patch: Partial<Task>) => {
    const { error } = await supabase.from("tasks" as never).update(patch as never).eq("id", id);
    if (error) return toast.error(error.message);
    load();
  };

  const deleteTask = async (id: string) => {
    const { error } = await supabase.from("tasks" as never).delete().eq("id", id);
    if (error) return toast.error(error.message);
    load();
  };

  const filtered = useMemo(
    () =>
      tasks.filter(
        (t) =>
          (filterStatus === "all" || t.status === filterStatus) &&
          (filterPriority === "all" || t.priority === filterPriority),
      ),
    [tasks, filterStatus, filterPriority],
  );

  return (
    <div className="space-y-8">
      <div>
        {project && (
          <Link to="/app/org/$orgId" params={{ orgId: project.organization_id }} className="text-sm text-ink/60 hover:text-ink">
            ← Back to organization
          </Link>
        )}
        <h1 className="mt-2 font-serif text-4xl">{project?.name ?? "Project"}</h1>
        {project?.description && <p className="mt-1 text-ink/70">{project.description}</p>}
      </div>

      <section className="rounded-2xl border border-ink/10 bg-white/80 p-5 shadow-soft">
        <h2 className="font-serif text-xl">New task</h2>
        <form onSubmit={create} className="mt-3 grid gap-3 md:grid-cols-2">
          <input
            required
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="rounded-md border border-ink/15 bg-white px-3 py-2 text-sm outline-none focus:border-ink/40 md:col-span-2"
          />
          <textarea
            placeholder="Description (optional)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={2}
            className="rounded-md border border-ink/15 bg-white px-3 py-2 text-sm outline-none focus:border-ink/40 md:col-span-2"
          />
          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value as Task["priority"])}
            className="rounded-md border border-ink/15 bg-white px-3 py-2 text-sm"
          >
            {PRIORITIES.map((p) => (
              <option key={p} value={p}>
                Priority: {p}
              </option>
            ))}
          </select>
          <input
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className="rounded-md border border-ink/15 bg-white px-3 py-2 text-sm"
          />
          <button className="rounded-md bg-ink px-4 py-2 text-sm font-medium text-canvas hover:bg-ink/90 md:col-span-2">
            Add task
          </button>
        </form>
      </section>

      <section>
        <div className="mb-3 flex flex-wrap items-center gap-3">
          <h2 className="font-serif text-2xl">Tasks</h2>
          <div className="ml-auto flex gap-2">
            <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="rounded-md border border-ink/15 bg-white px-2 py-1 text-sm">
              <option value="all">All statuses</option>
              {STATUSES.map((s) => <option key={s} value={s}>{s.replace("_", " ")}</option>)}
            </select>
            <select value={filterPriority} onChange={(e) => setFilterPriority(e.target.value)} className="rounded-md border border-ink/15 bg-white px-2 py-1 text-sm">
              <option value="all">All priorities</option>
              {PRIORITIES.map((p) => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
        </div>

        {filtered.length === 0 ? (
          <p className="text-ink/60">No tasks match.</p>
        ) : (
          <ul className="grid gap-3">
            {filtered.map((t) => (
              <li key={t.id} className="rounded-xl border border-ink/10 bg-white/70 p-4">
                <div className="flex flex-wrap items-start gap-3">
                  <div className="min-w-0 flex-1">
                    <Link to="/app/task/$taskId" params={{ taskId: t.id }} className="font-serif text-lg text-ink hover:underline">
                      {t.title}
                    </Link>
                    {t.description && <p className="mt-1 text-sm text-ink/65 line-clamp-2">{t.description}</p>}
                    <div className="mt-2 flex flex-wrap gap-2 text-xs">
                      <span className={`rounded-full px-2 py-0.5 ${priorityClasses[t.priority]}`}>{t.priority}</span>
                      {t.due_date && (
                        <span className="rounded-full bg-ink/10 px-2 py-0.5 text-ink/70">
                          due {new Date(t.due_date).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                  <select
                    value={t.status}
                    onChange={(e) => updateTask(t.id, { status: e.target.value as Task["status"] })}
                    className="rounded-md border border-ink/15 bg-white px-2 py-1 text-sm"
                  >
                    {STATUSES.map((s) => (
                      <option key={s} value={s}>{s.replace("_", " ")}</option>
                    ))}
                  </select>
                  {t.created_by_id === user?.id && (
                    <button onClick={() => deleteTask(t.id)} className="text-sm text-ink/55 hover:text-ink">
                      Delete
                    </button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

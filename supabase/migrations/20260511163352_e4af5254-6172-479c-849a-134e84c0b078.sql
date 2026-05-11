
-- Profiles
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  first_name text,
  last_name text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.profiles enable row level security;
create policy "profiles viewable by authenticated" on public.profiles for select to authenticated using (true);
create policy "users insert own profile" on public.profiles for insert to authenticated with check (auth.uid() = id);
create policy "users update own profile" on public.profiles for update to authenticated using (auth.uid() = id);

-- Auto profile on signup
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, first_name, last_name)
  values (new.id, new.raw_user_meta_data->>'first_name', new.raw_user_meta_data->>'last_name');
  return new;
end;
$$;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

-- Organizations
create table public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  owner_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.organizations enable row level security;

-- Members
create table public.organization_members (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null default 'member' check (role in ('admin','member')),
  created_at timestamptz not null default now(),
  unique(organization_id, user_id)
);
alter table public.organization_members enable row level security;

-- Helper functions (security definer to avoid RLS recursion)
create or replace function public.is_org_member(_org uuid, _user uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists(select 1 from public.organization_members where organization_id = _org and user_id = _user);
$$;
create or replace function public.is_org_admin(_org uuid, _user uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists(select 1 from public.organization_members where organization_id = _org and user_id = _user and role = 'admin');
$$;

-- Orgs policies
create policy "members view orgs" on public.organizations for select to authenticated
  using (public.is_org_member(id, auth.uid()));
create policy "auth create org" on public.organizations for insert to authenticated
  with check (auth.uid() = owner_id);
create policy "admin update org" on public.organizations for update to authenticated
  using (public.is_org_admin(id, auth.uid()));
create policy "owner delete org" on public.organizations for delete to authenticated
  using (auth.uid() = owner_id);

-- Members policies
create policy "members view members" on public.organization_members for select to authenticated
  using (public.is_org_member(organization_id, auth.uid()));
create policy "admin add members" on public.organization_members for insert to authenticated
  with check (public.is_org_admin(organization_id, auth.uid()) or auth.uid() = user_id);
create policy "admin update members" on public.organization_members for update to authenticated
  using (public.is_org_admin(organization_id, auth.uid()));
create policy "admin delete members" on public.organization_members for delete to authenticated
  using (public.is_org_admin(organization_id, auth.uid()) or auth.uid() = user_id);

-- Auto-add creator as admin
create or replace function public.add_owner_as_admin()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.organization_members (organization_id, user_id, role)
  values (new.id, new.owner_id, 'admin');
  return new;
end;
$$;
create trigger org_add_owner after insert on public.organizations
  for each row execute function public.add_owner_as_admin();

-- Projects
create table public.projects (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  name text not null,
  description text,
  owner_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.projects enable row level security;
create policy "members view projects" on public.projects for select to authenticated
  using (public.is_org_member(organization_id, auth.uid()));
create policy "members create projects" on public.projects for insert to authenticated
  with check (public.is_org_member(organization_id, auth.uid()) and auth.uid() = owner_id);
create policy "members update projects" on public.projects for update to authenticated
  using (public.is_org_member(organization_id, auth.uid()));
create policy "owner delete projects" on public.projects for delete to authenticated
  using (auth.uid() = owner_id);

-- Tasks
create table public.tasks (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  created_by_id uuid not null references auth.users(id) on delete cascade,
  assigned_to_id uuid references auth.users(id) on delete set null,
  title text not null,
  description text,
  status text not null default 'todo' check (status in ('todo','in_progress','completed')),
  priority text not null default 'medium' check (priority in ('low','medium','high')),
  due_date timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.tasks enable row level security;

create or replace function public.user_can_access_task(_task uuid, _user uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists(
    select 1 from public.tasks t
    join public.projects p on p.id = t.project_id
    where t.id = _task and public.is_org_member(p.organization_id, _user)
  );
$$;

create or replace function public.user_can_access_project(_project uuid, _user uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists(
    select 1 from public.projects p
    where p.id = _project and public.is_org_member(p.organization_id, _user)
  );
$$;

create policy "members view tasks" on public.tasks for select to authenticated
  using (public.user_can_access_project(project_id, auth.uid()));
create policy "members create tasks" on public.tasks for insert to authenticated
  with check (public.user_can_access_project(project_id, auth.uid()) and auth.uid() = created_by_id);
create policy "members update tasks" on public.tasks for update to authenticated
  using (public.user_can_access_project(project_id, auth.uid()));
create policy "creator delete tasks" on public.tasks for delete to authenticated
  using (auth.uid() = created_by_id);

-- Comments
create table public.task_comments (
  id uuid primary key default gen_random_uuid(),
  task_id uuid not null references public.tasks(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  content text not null,
  created_at timestamptz not null default now()
);
alter table public.task_comments enable row level security;
create policy "members view comments" on public.task_comments for select to authenticated
  using (public.user_can_access_task(task_id, auth.uid()));
create policy "members add comments" on public.task_comments for insert to authenticated
  with check (public.user_can_access_task(task_id, auth.uid()) and auth.uid() = user_id);
create policy "author delete comments" on public.task_comments for delete to authenticated
  using (auth.uid() = user_id);

-- Updated_at triggers
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end;
$$;
create trigger t_profiles_u before update on public.profiles for each row execute function public.touch_updated_at();
create trigger t_orgs_u before update on public.organizations for each row execute function public.touch_updated_at();
create trigger t_projects_u before update on public.projects for each row execute function public.touch_updated_at();
create trigger t_tasks_u before update on public.tasks for each row execute function public.touch_updated_at();

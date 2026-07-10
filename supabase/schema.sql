create extension if not exists pgcrypto;

create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text unique not null,
  category text check (category in ('Residential Architecture', 'Residential Interior', 'Commercial Architecture', 'Commercial Interior', 'Landscape', 'Others')),
  location text,
  short_description text,
  full_description text,
  cover_image_url text,
  gallery_image_urls jsonb default '[]'::jsonb,
  project_type text,
  year text,
  client_name text,
  status text default 'draft' check (status in ('draft', 'published')),
  featured boolean default false,
  sort_order int default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.careers (
  id uuid primary key default gen_random_uuid(),
  job_title text not null,
  slug text unique not null,
  employment_type text,
  location text,
  work_mode text,
  experience_level text,
  short_description text,
  responsibilities text,
  requirements text,
  application_email text default 'careers@idharchitecture.com',
  status text default 'draft' check (status in ('draft', 'published', 'closed')),
  sort_order int default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.insights (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text unique not null,
  content_type text not null check (content_type in ('Announcement', 'News', 'Article', 'Blog')),
  category_label text,
  excerpt text,
  body_content text,
  cover_image_url text,
  author text,
  published_date date,
  status text default 'draft' check (status in ('draft', 'published')),
  featured boolean default false,
  sort_order int default 0,
  seo_title text,
  seo_description text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  email text,
  created_at timestamptz default now()
);

create table if not exists public.analytics_events (
  id uuid primary key default gen_random_uuid(),
  event_type text not null check (event_type in ('page_view', 'project_view', 'insight_view', 'career_view', 'career_apply_click')),
  page_path text,
  item_type text,
  item_id uuid,
  item_slug text,
  referrer text,
  user_agent text,
  created_at timestamptz default now()
);

update public.projects
set category = case category
  when 'Residential' then 'Residential Architecture'
  when 'Interiors' then 'Residential Interior'
  when 'Commercial' then 'Commercial Interior'
  when 'Hospitality' then 'Commercial Interior'
  when 'Architecture' then 'Residential Architecture'
  when 'Residential Architecture' then 'Residential Architecture'
  when 'Residential Interior' then 'Residential Interior'
  when 'Commercial Architecture' then 'Commercial Architecture'
  when 'Commercial Interior' then 'Commercial Interior'
  when 'Landscape' then 'Landscape'
  when 'Others' then 'Others'
  else 'Others'
end
where category is null
   or category not in ('Residential Architecture', 'Residential Interior', 'Commercial Architecture', 'Commercial Interior', 'Landscape', 'Others');

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'projects_category_fixed_values'
      and conrelid = 'public.projects'::regclass
  ) then
    alter table public.projects
    add constraint projects_category_fixed_values
    check (category in ('Residential Architecture', 'Residential Interior', 'Commercial Architecture', 'Commercial Interior', 'Landscape', 'Others'));
  end if;
end $$;

alter table public.admin_users enable row level security;

drop policy if exists "Admins read own admin record" on public.admin_users;
create policy "Admins read own admin record" on public.admin_users
for select using (auth.uid() = user_id);

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.admin_users
    where user_id = auth.uid()
  );
$$;

create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_projects_updated_at on public.projects;
create trigger set_projects_updated_at before update on public.projects
for each row execute function public.set_updated_at();

drop trigger if exists set_careers_updated_at on public.careers;
create trigger set_careers_updated_at before update on public.careers
for each row execute function public.set_updated_at();

drop trigger if exists set_insights_updated_at on public.insights;
create trigger set_insights_updated_at before update on public.insights
for each row execute function public.set_updated_at();

alter table public.projects enable row level security;
alter table public.careers enable row level security;
alter table public.insights enable row level security;
alter table public.analytics_events enable row level security;

drop policy if exists "Published projects are public" on public.projects;
create policy "Published projects are public" on public.projects
for select using (status = 'published');

drop policy if exists "Admins manage projects" on public.projects;
create policy "Admins manage projects" on public.projects
for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "Published careers are public" on public.careers;
create policy "Published careers are public" on public.careers
for select using (status = 'published');

drop policy if exists "Admins manage careers" on public.careers;
create policy "Admins manage careers" on public.careers
for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "Published insights are public" on public.insights;
create policy "Published insights are public" on public.insights
for select using (status = 'published');

drop policy if exists "Admins manage insights" on public.insights;
create policy "Admins manage insights" on public.insights
for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "Public insert analytics events" on public.analytics_events;
create policy "Public insert analytics events" on public.analytics_events
for insert with check (true);

drop policy if exists "Admins read analytics events" on public.analytics_events;
create policy "Admins read analytics events" on public.analytics_events
for select using (public.is_admin());


insert into storage.buckets (id, name, public)
values ('project-images', 'project-images', true)
on conflict (id) do update set public = excluded.public;

insert into storage.buckets (id, name, public)
values ('insight-images', 'insight-images', true)
on conflict (id) do update set public = excluded.public;

drop policy if exists "Public project images" on storage.objects;
create policy "Public project images" on storage.objects
for select using (bucket_id = 'project-images');

drop policy if exists "Admins upload project images" on storage.objects;
create policy "Admins upload project images" on storage.objects
for insert with check (bucket_id = 'project-images' and public.is_admin());

drop policy if exists "Admins update project images" on storage.objects;
create policy "Admins update project images" on storage.objects
for update using (bucket_id = 'project-images' and public.is_admin());

drop policy if exists "Admins delete project images" on storage.objects;
create policy "Admins delete project images" on storage.objects
for delete using (bucket_id = 'project-images' and public.is_admin());

drop policy if exists "Public insight images" on storage.objects;
create policy "Public insight images" on storage.objects
for select using (bucket_id = 'insight-images');

drop policy if exists "Admins upload insight images" on storage.objects;
create policy "Admins upload insight images" on storage.objects
for insert with check (bucket_id = 'insight-images' and public.is_admin());

drop policy if exists "Admins update insight images" on storage.objects;
create policy "Admins update insight images" on storage.objects
for update using (bucket_id = 'insight-images' and public.is_admin());

drop policy if exists "Admins delete insight images" on storage.objects;
create policy "Admins delete insight images" on storage.objects
for delete using (bucket_id = 'insight-images' and public.is_admin());

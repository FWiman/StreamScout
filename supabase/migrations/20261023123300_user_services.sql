-- "My services": the streaming services each user subscribes to (TMDB provider ids).
create table public.user_services (
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  provider_id integer not null check (provider_id > 0),
  added_at timestamptz not null default now(),
  primary key (user_id, provider_id)
);

alter table public.user_services enable row level security;

create policy "Read own services" on public.user_services
  for select to authenticated using ((select auth.uid()) = user_id);
create policy "Add own services" on public.user_services
  for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "Remove own services" on public.user_services
  for delete to authenticated using ((select auth.uid()) = user_id);

grant select, insert, delete on public.user_services to authenticated;

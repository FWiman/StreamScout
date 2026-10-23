-- Per-user state for a title: seen, thumbs rating, and "not interested" (hidden).
create table public.user_titles (
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  media_type text not null check (media_type in ('movie', 'tv')),
  tmdb_id integer not null check (tmdb_id > 0),
  seen boolean not null default false,
  rating smallint check (rating in (-1, 1)),
  hidden boolean not null default false,
  updated_at timestamptz not null default now(),
  primary key (user_id, media_type, tmdb_id)
);

alter table public.user_titles enable row level security;

create policy "Read own titles" on public.user_titles
  for select to authenticated using ((select auth.uid()) = user_id);
create policy "Add own titles" on public.user_titles
  for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "Update own titles" on public.user_titles
  for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "Remove own titles" on public.user_titles
  for delete to authenticated using ((select auth.uid()) = user_id);

grant select, insert, update, delete on public.user_titles to authenticated;

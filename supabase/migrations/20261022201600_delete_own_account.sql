-- Lets a signed-in user permanently delete their own account (required by the app stores
-- and GDPR). Their watchlist rows go with it via ON DELETE CASCADE.
-- The security advisor warns that signed-in users can call this SECURITY DEFINER
-- function – that's intended: it only ever deletes auth.uid().
create or replace function public.delete_own_account()
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  uid uuid := auth.uid();
begin
  if uid is null then
    raise exception 'Not signed in' using errcode = '42501';
  end if;
  delete from auth.users where id = uid;
end;
$$;

revoke all on function public.delete_own_account() from public, anon;
grant execute on function public.delete_own_account() to authenticated;

comment on function public.delete_own_account() is
  'Deletes the calling user (auth.uid()) and, via cascade, their watchlist.';


-- Allow authenticated users to post apartment listings.
-- Preserve the existing four demo listings.

alter table public.listings
add column if not exists user_id uuid references auth.users(id)
on delete set null;

-- New listings must belong to the signed-in user.
-- Demo listings can retain a null owner.

drop policy if exists "Authenticated users can create listings"
on public.listings;

create policy "Authenticated users can create listings"
on public.listings
for insert
to authenticated
with check (
  user_id = (select auth.uid())
  and is_demo = false
);

-- Existing SELECT policy remains unchanged.
-- Users cannot update or delete listings yet.

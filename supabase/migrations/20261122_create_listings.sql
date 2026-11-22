-- Apartment listings for Notre Coloc
-- The initial four demonstration listings are already
-- inserted in the shared Supabase database.

create table if not exists public.listings (
  id text primary key,
  title text not null,
  neighborhood text not null,
  rent integer not null check (rent >= 0),
  bedrooms integer not null check (bedrooms >= 0),
  image_url text not null,
  is_demo boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.listings enable row level security;

-- Signed-in users can browse apartment listings.
-- No client-side insert, update, or delete access is granted.

drop policy if exists "Authenticated users can view listings"
on public.listings;

create policy "Authenticated users can view listings"
on public.listings
for select
to authenticated
using (true);
-- Automatically generate unique IDs for new listings.
-- Keep the existing text ID type for compatibility
-- with the four demonstration apartments.

alter table public.listings
alter column id set default gen_random_uuid()::text;
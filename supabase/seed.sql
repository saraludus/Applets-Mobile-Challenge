
-- Demo apartment listings for Notre Coloc
-- All listings are fictional and used for demonstration.
-- Run after the listings table migration.

insert into public.listings (
  id,
  title,
  neighborhood,
  rent,
  bedrooms,
  image_url,
  is_demo
)
values
  (
    '1',
    'Appartement lumineux',
    'Le Plateau',
    950,
    2,
    'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=900',
    true
  ),
  (
    '2',
    'Chambre en colocation',
    'Mile End',
    750,
    3,
    'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=900',
    true
  ),
  (
    '3',
    'Appartement près du métro',
    'Verdun',
    1100,
    2,
    'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?w=900',
    true
  ),
  (
    '4',
    'Chambre près des universités',
    'Côte-des-Neiges',
    680,
    4,
    'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=900',
    true
  )
on conflict (id) do nothing;

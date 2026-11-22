import type { Listing } from "@/components/logements/ListingCard";

export const listings: Listing[] = [
  {
    id: "1",
    title: "Appartement lumineux",
    neighborhood: "Le Plateau",
    rent: 950,
    bedrooms: 2,
    imageUrl:
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=900",
    isDemo: true,
  },
  {
    id: "2",
    title: "Chambre en colocation",
    neighborhood: "Mile End",
    rent: 750,
    bedrooms: 3,
    imageUrl:
      "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=900",
    isDemo: true,
  },
  {
    id: "3",
    title: "Appartement près du métro",
    neighborhood: "Verdun",
    rent: 1100,
    bedrooms: 2,
    imageUrl:
      "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?w=900",
    isDemo: true,
  },
  {
    id: "4",
    title: "Chambre près des universités",
    neighborhood: "Côte-des-Neiges",
    rent: 680,
    bedrooms: 4,
    imageUrl:
      "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=900",
    isDemo: true,
  },
];

export function getListingById(id: string) {
  return listings.find((listing) => listing.id === id);
}

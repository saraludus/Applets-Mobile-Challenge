import type { Listing } from "@/components/logements/ListingCard";
import { supabase } from "@/lib/supabase";

export async function fetchListings(): Promise<Listing[]> {
  const { data, error } = await supabase
    .from("listings")
    .select("id, title, neighborhood, rent, bedrooms, image_url")
    .order("created_at", { ascending: false });

  if (error) {
    throw error;
  }

  return (data ?? []).map((row) => ({
    id: row.id,
    title: row.title,
    neighborhood: row.neighborhood,
    rent: row.rent,
    bedrooms: row.bedrooms,
    imageUrl: row.image_url,
  }));
}

export async function fetchListingById(id: string): Promise<Listing | null> {
  const { data, error } = await supabase
    .from("listings")
    .select("id, title, neighborhood, rent, bedrooms, image_url")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    throw error;
  }

  if (!data) {
    return null;
  }

  return {
    id: data.id,
    title: data.title,
    neighborhood: data.neighborhood,
    rent: data.rent,
    bedrooms: data.bedrooms,
    imageUrl: data.image_url,
  };
}

import type { Listing } from "@/components/logements/ListingCard";
import { supabase } from "@/lib/supabase";

export async function fetchListings(): Promise<Listing[]> {
  const { data, error } = await supabase
    .from("listings")
    .select("id, title, neighborhood, rent, bedrooms, image_url, is_demo")
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
    isDemo: row.is_demo,
  }));
}

export async function fetchListingById(id: string): Promise<Listing | null> {
  const { data, error } = await supabase
    .from("listings")
    .select("id, title, neighborhood, rent, bedrooms, image_url, is_demo")
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
    isDemo: data.is_demo,
  };
}

export async function createListing(input: {
  title: string;
  neighborhood: string;
  rent: number;
  bedrooms: number;
  imageUrl: string;
}): Promise<void> {
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    throw new Error("You must be signed in to post an apartment.");
  }

  const { error } = await supabase.from("listings").insert({
    title: input.title.trim(),
    neighborhood: input.neighborhood.trim(),
    rent: input.rent,
    bedrooms: input.bedrooms,
    image_url: input.imageUrl.trim(),
    is_demo: false,
    user_id: user.id,
  });

  if (error) {
    throw error;
  }
}

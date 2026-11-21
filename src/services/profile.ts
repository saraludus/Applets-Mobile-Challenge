
import { supabase } from '../lib/supabase';

export type Profile = {
  id: string;
  display_name: string | null;
  age: number | null;
  gender: string | null;
  budget_min: number | null;
  budget_max: number | null;
  lifestyle: string | null;
  bio: string | null;
  created_at?: string;
  updated_at?: string;
};

export type CreateProfileInput = {
  display_name?: string;
  age?: number;
  gender?: string;
  budget_min?: number;
  budget_max?: number;
  lifestyle?: string;
  bio?: string;
};

export async function createProfile(
  profile: CreateProfileInput
): Promise<Profile> {
  const { data: { user }, error: userError } =
    await supabase.auth.getUser();

  if (userError) throw userError;

  if (!user) {
    throw new Error('You must be logged in to create a profile.');
  }

  const { data, error } = await supabase
    .from('profiles')
    .update({
      ...profile,
      updated_at: new Date().toISOString(),
    })
    .eq('id', user.id)
    .select()
    .single();

  if (error) throw error;

  return data as Profile;
}

export async function getProfile(): Promise<Profile> {
  const { data: { user }, error: userError } =
    await supabase.auth.getUser();

  if (userError) throw userError;

  if (!user) {
    throw new Error('You must be logged in to retrieve a profile.');
  }

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  if (error) throw error;

  return data as Profile;
}


export async function updateProfile(
  updates: Partial<CreateProfileInput>
): Promise<Profile> {
  const { data: { user }, error: userError } =
    await supabase.auth.getUser();

  if (userError) throw userError;

  if (!user) {
    throw new Error('You must be logged in to update your profile.');
  }

  const { data, error } = await supabase
    .from('profiles')
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq('id', user.id)
    .select()
    .single();

  if (error) throw error;

  return data as Profile;
}

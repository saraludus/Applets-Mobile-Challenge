
import { supabase } from '../lib/supabase';

// Register a new user
export async function signUp(
  email: string,
  password: string,
  displayName: string
) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        display_name: displayName,
      },
    },
  });

  if (error) throw error;

  return data;
}

// Log in an existing user
export async function signIn(
  email: string,
  password: string
) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) throw error;

  return data;
}

// Log out the current user
export async function signOut() {
  const { error } = await supabase.auth.signOut();

  if (error) throw error;
}

// Retrieve the current session
export async function getSession() {
  const { data, error } = await supabase.auth.getSession();

  if (error) throw error;

  return data.session;
}

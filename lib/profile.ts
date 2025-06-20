import { supabase } from './supabase';
import type { Profile, ArtistProfile, VenueProfile, ProfileData } from '@/types/profile';

export async function getProfileData(userId: string): Promise<ProfileData> {
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (profileError) {
    console.error('Error fetching profile:', profileError);
  }

  const { data: artistProfile, error: artistError } = await supabase
    .from('artist_profiles')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (artistError && artistError.code !== 'PGRST116') {
    console.error('Error fetching artist profile:', artistError);
  }

  const { data: venueProfile, error: venueError } = await supabase
    .from('venue_profiles')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (venueError && venueError.code !== 'PGRST116') {
    console.error('Error fetching venue profile:', venueError);
  }

  return {
    profile: profile || null,
    artistProfile: artistProfile || null,
    venueProfile: venueProfile || null,
  };
}

export async function updateProfile(userId: string, updates: Partial<Profile>) {
  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId)
    .select()
    .single();

  if (error) {
    console.error('Error updating profile:', error);
    throw error;
  }

  return data;
}

export async function createArtistProfile(userId: string, profile: Partial<ArtistProfile>) {
  const { data, error } = await supabase
    .from('artist_profiles')
    .insert([{ ...profile, user_id: userId }])
    .select()
    .single();

  if (error) {
    console.error('Error creating artist profile:', error);
    throw error;
  }

  return data;
}

export async function updateArtistProfile(userId: string, updates: Partial<ArtistProfile>) {
  const { data, error } = await supabase
    .from('artist_profiles')
    .update(updates)
    .eq('user_id', userId)
    .select()
    .single();

  if (error) {
    console.error('Error updating artist profile:', error);
    throw error;
  }

  return data;
}

export async function createVenueProfile(userId: string, profile: Partial<VenueProfile>) {
  const { data, error } = await supabase
    .from('venue_profiles')
    .insert([{ ...profile, user_id: userId }])
    .select()
    .single();

  if (error) {
    console.error('Error creating venue profile:', error);
    throw error;
  }

  return data;
}

export async function updateVenueProfile(userId: string, updates: Partial<VenueProfile>) {
  const { data, error } = await supabase
    .from('venue_profiles')
    .update(updates)
    .eq('user_id', userId)
    .select()
    .single();

  if (error) {
    console.error('Error updating venue profile:', error);
    throw error;
  }

  return data;
} 
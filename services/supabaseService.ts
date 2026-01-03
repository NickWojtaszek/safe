import { supabase } from './supabaseClient';
import { CollectionRecord } from '../types';

// Auth functions
export const signUp = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error) throw error;
  return data;
};

export const signIn = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
};

export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
};

export const getCurrentUser = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
};

// Study management functions
export interface StoredStudy {
  id: string;
  user_id: string;
  study_name: string;
  records_data: CollectionRecord[];
  created_at: string;
  updated_at: string;
}

export const createStudy = async (studyName: string, recordsData: CollectionRecord[]) => {
  const user = await getCurrentUser();
  if (!user) throw new Error('User not authenticated');

  const { data, error } = await supabase
    .from('studies')
    .insert({
      user_id: user.id,
      study_name: studyName,
      records_data: recordsData,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .select();

  if (error) throw error;
  return data?.[0] as StoredStudy;
};

export const getUserStudies = async () => {
  const user = await getCurrentUser();
  if (!user) throw new Error('User not authenticated');

  const { data, error } = await supabase
    .from('studies')
    .select('*')
    .eq('user_id', user.id)
    .order('updated_at', { ascending: false });

  if (error) throw error;
  return data as StoredStudy[];
};

export const getStudy = async (studyId: string) => {
  const user = await getCurrentUser();
  if (!user) throw new Error('User not authenticated');

  const { data, error } = await supabase
    .from('studies')
    .select('*')
    .eq('id', studyId)
    .eq('user_id', user.id)
    .single();

  if (error) throw error;
  return data as StoredStudy;
};

export const updateStudy = async (studyId: string, recordsData: CollectionRecord[]) => {
  const user = await getCurrentUser();
  if (!user) throw new Error('User not authenticated');

  const { data, error } = await supabase
    .from('studies')
    .update({
      records_data: recordsData,
      updated_at: new Date().toISOString(),
    })
    .eq('id', studyId)
    .eq('user_id', user.id)
    .select();

  if (error) throw error;
  return data?.[0] as StoredStudy;
};

export const deleteStudy = async (studyId: string) => {
  const user = await getCurrentUser();
  if (!user) throw new Error('User not authenticated');

  const { error } = await supabase
    .from('studies')
    .delete()
    .eq('id', studyId)
    .eq('user_id', user.id);

  if (error) throw error;
};

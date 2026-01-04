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
  if (!user) {
    console.error('❌ createStudy: User not authenticated');
    throw new Error('User not authenticated');
  }

  console.log('➕ createStudy: Creating study for user:', user.id);
  console.log('➕ Study name:', studyName);

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

  if (error) {
    console.error('❌ createStudy error:', error);
    throw error;
  }

  console.log('✅ Study created:', data?.[0]?.id);
  return data?.[0] as StoredStudy;
};

export const getUserStudies = async () => {
  const user = await getCurrentUser();
  if (!user) {
    console.error('❌ getUserStudies: User not authenticated');
    throw new Error('User not authenticated');
  }

  console.log('🔍 getUserStudies: Querying for user:', user.id);

  const { data, error } = await supabase
    .from('studies')
    .select('*')
    .eq('user_id', user.id)
    .order('updated_at', { ascending: false });

  if (error) {
    console.error('❌ getUserStudies error:', error);
    throw error;
  }

  console.log('📚 getUserStudies: Found', data?.length || 0, 'studies');
  if (data && data.length > 0) {
    data.forEach((study, idx) => {
      console.log(`  Study ${idx + 1}:`, study.id, '- Records:', study.records_data?.length || 0);
    });
  }

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
  if (!user) {
    console.error('❌ updateStudy: User not authenticated');
    throw new Error('User not authenticated');
  }

  console.log('📝 updateStudy: Attempting to save', recordsData.length, 'records');
  console.log('📝 Study ID:', studyId);
  console.log('📝 User ID:', user.id);

  const { data, error } = await supabase
    .from('studies')
    .update({
      records_data: recordsData,
      updated_at: new Date().toISOString(),
    })
    .eq('id', studyId)
    .eq('user_id', user.id)
    .select();

  if (error) {
    console.error('❌ Supabase update error:', error);
    console.error('Error details:', JSON.stringify(error, null, 2));
    throw error;
  }

  if (!data || data.length === 0) {
    console.error('❌ Update returned no data - possible RLS policy block or wrong study ID');
    console.error('Expected study ID:', studyId);
    console.error('User ID:', user.id);
    throw new Error('Update failed: No data returned. Check RLS policies or study ownership.');
  }

  console.log('✅ Supabase confirmed update:', data[0].id);
  console.log('✅ Records in DB:', data[0].records_data?.length || 0);

  return data[0] as StoredStudy;
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

// Export all functions as a service object for easy importing
export const supabaseService = {
  signUp,
  signIn,
  signOut,
  getCurrentUser,
  createStudy,
  getUserStudies,
  getStudy,
  updateStudy,
  deleteStudy,
};

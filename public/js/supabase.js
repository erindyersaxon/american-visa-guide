import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

const SUPABASE_URL = 'https://lkssaokcpqilrfwagxnv.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxrc3Nhb2tjcHFpbHJmd2FneG52Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg0MjY5MzQsImV4cCI6MjA5NDAwMjkzNH0.oQSl-_JOE4ESrpTqTUoVlnxlVubx7Gi8TdZwgvfL7Kg';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export async function fetchILDrops() {
  try {
    const { data, error } = await supabase
      .from('il_drops')
      .select('*')
      .order('recorded_at', { ascending: false });
    if (error) throw error;
    return data ?? [];
  } catch (err) {
    console.error('fetchILDrops error:', err);
    return [];
  }
}

export async function fetchCommunityStats() {
  try {
    const { data, error } = await supabase
      .from('community_stats')
      .select('*')
      .order('recorded_at', { ascending: false })
      .limit(1)
      .single();
    if (error) throw error;
    return data ?? null;
  } catch (err) {
    console.error('fetchCommunityStats error:', err);
    return null;
  }
}

export async function fetchMemberTimelines() {
  try {
    const { data, error } = await supabase
      .from('member_timelines')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data ?? [];
  } catch (err) {
    console.error('fetchMemberTimelines error:', err);
    return [];
  }
}

export async function fetchWeeklyActivity() {
  try {
    const { data, error } = await supabase
      .from('weekly_activity')
      .select('*')
      .order('week_start', { ascending: false })
      .limit(12);
    if (error) throw error;
    return data ?? [];
  } catch (err) {
    console.error('fetchWeeklyActivity error:', err);
    return [];
  }
}

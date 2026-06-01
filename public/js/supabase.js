// Supabase integration for American Visa Guide
// Loads Supabase client from CDN and fetches data from tables

// Environment setup: Supabase credentials should be injected via window.ENV by Vercel build
// If not available, functions will return null and pages will use static fallbacks

const SUPABASE_URL = window.ENV?.SUPABASE_URL || '';
const SUPABASE_ANON_KEY = window.ENV?.SUPABASE_ANON_KEY || '';

// Cache with 5-minute TTL (300000 ms)
const cache = {};
const CACHE_TTL = 300000;

function isCacheValid(key) {
  if (!cache[key]) return false;
  const age = Date.now() - cache[key].timestamp;
  return age < CACHE_TTL;
}

function getFromCache(key) {
  if (isCacheValid(key)) return cache[key].data;
  delete cache[key];
  return null;
}

function setCache(key, data) {
  cache[key] = { data, timestamp: Date.now() };
}

// Initialize Supabase client (loaded from CDN)
let supabaseClient = null;

async function initSupabase() {
  if (supabaseClient) return supabaseClient;
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    console.warn('Supabase credentials not available. Using static fallbacks.');
    return null;
  }
  
  try {
    const { createClient } = window.supabase;
    supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    return supabaseClient;
  } catch (err) {
    console.error('Failed to initialize Supabase:', err);
    return null;
  }
}

// ============================================
// PUBLIC FUNCTIONS — CALLED BY HTML PAGES
// ============================================

/**
 * fetchILDrops - IL appointment drop history
 * Returns: array of { date, gap_days, time_uk, dq_date_from, dq_date_to, dq_range_days, il_count, notes }
 */
async function fetchILDrops() {
  const cacheKey = 'il_drops';
  const cached = getFromCache(cacheKey);
  if (cached) return cached;

  const client = await initSupabase();
  if (!client) return null;

  try {
    const { data, error } = await client
      .from('il_drops')
      .select('*')
      .order('date', { ascending: false });
    
    if (error) throw error;
    setCache(cacheKey, data);
    return data;
  } catch (err) {
    console.error('fetchILDrops error:', err);
    return null;
  }
}

/**
 * fetchCommunityStats - Aggregate community statistics
 * Returns: { total_members, waiting_for_il, dq_to_il_avg_all, dq_to_il_avg_6m, dq_to_il_avg_3m,
 *            il_to_interview_avg_all, il_to_interview_avg_6m, approved_pct, pending_221g_pct, denied_pct,
 *            pickup_days_avg, mail_days_avg, interview_count_total }
 */
async function fetchCommunityStats() {
  const cacheKey = 'community_stats';
  const cached = getFromCache(cacheKey);
  if (cached) return cached;

  const client = await initSupabase();
  if (!client) return null;

  try {
    const { data, error } = await client
      .from('community_stats')
      .select('*')
      .single();
    
    if (error) throw error;
    setCache(cacheKey, data);
    return data;
  } catch (err) {
    console.error('fetchCommunityStats error:', err);
    return null;
  }
}

/**
 * fetchMemberTimelines - Individual member timelines for per-stage analysis
 * Returns: array of { i130_to_nvc_days, nvc_fee_to_docs_days, docs_to_dq_days, dq_to_il_days,
 *                      il_to_medical_days, medical_to_interview_days, interview_to_passport_days,
 *                      visa_category, embassy }
 */
async function fetchMemberTimelines() {
  const cacheKey = 'member_timelines';
  const cached = getFromCache(cacheKey);
  if (cached) return cached;

  const client = await initSupabase();
  if (!client) return null;

  try {
    const { data, error } = await client
      .from('member_timelines')
      .select('*');
    
    if (error) throw error;
    setCache(cacheKey, data);
    return data;
  } catch (err) {
    console.error('fetchMemberTimelines error:', err);
    return null;
  }
}

/**
 * fetchWeeklyActivity - Activities in the current week
 * Returns: { interviews_this_week, medicals_this_week, flights_this_week, dq_this_week, i130_approved_this_week }
 */
async function fetchWeeklyActivity() {
  const cacheKey = 'weekly_activity';
  const cached = getFromCache(cacheKey);
  if (cached) return cached;

  const client = await initSupabase();
  if (!client) return null;

  try {
    const { data, error } = await client
      .from('weekly_activity')
      .select('*')
      .single();
    
    if (error) throw error;
    setCache(cacheKey, data);
    return data;
  } catch (err) {
    console.error('fetchWeeklyActivity error:', err);
    return null;
  }
}

/**
 * fetchSettlementData - Where community members have settled
 * Returns: array of { state_code, state_name, member_count, gc_median_days, ssn_median_days, intervention_rate }
 */
async function fetchSettlementData() {
  const cacheKey = 'settlement_data';
  const cached = getFromCache(cacheKey);
  if (cached) return cached;

  const client = await initSupabase();
  if (!client) return null;

  try {
    const { data, error } = await client
      .from('settlement_data')
      .select('*')
      .order('member_count', { ascending: false });
    
    if (error) throw error;
    setCache(cacheKey, data);
    return data;
  } catch (err) {
    console.error('fetchSettlementData error:', err);
    return null;
  }
}

// Export for ES modules
export {
  fetchILDrops,
  fetchCommunityStats,
  fetchMemberTimelines,
  fetchWeeklyActivity,
  fetchSettlementData,
  initSupabase
};

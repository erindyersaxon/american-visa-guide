// Environment variable injection (build-time substitution)
// Vercel build command replaces %%VARIABLE%% placeholders with actual values
window.ENV = {
  SUPABASE_URL: "%%SUPABASE_URL%%",
  SUPABASE_ANON_KEY: "%%SUPABASE_ANON_KEY%%"
};

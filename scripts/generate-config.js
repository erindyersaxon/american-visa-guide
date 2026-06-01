// Build-time script to generate config.json from Vercel environment variables
// Run this during the build step in Vercel

const fs = require('fs');
const path = require('path');

const config = {
  SUPABASE_URL: process.env.SUPABASE_URL || '',
  SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY || ''
};

const outputPath = path.join(__dirname, '../public/config.json');

fs.writeFileSync(outputPath, JSON.stringify(config, null, 2));

console.log('✓ Generated config.json with Supabase credentials');
if (!config.SUPABASE_URL) {
  console.warn('⚠ WARNING: SUPABASE_URL not set in environment variables');
}
if (!config.SUPABASE_ANON_KEY) {
  console.warn('⚠ WARNING: SUPABASE_ANON_KEY not set in environment variables');
}

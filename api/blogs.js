import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

export default async function handler(req, res) {
  // ⚠️ CRITICAL CORS CONFIGURATION: Allow Neocities to read this data
  res.setHeader('Access-Control-Allow-Origin', 'https://tchandervar.neocities.org');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Accept');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Prevent caching so new articles appear instantly
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');

  try {
    const client = await pool.connect();
    
    // Fetch published blogs, ordered by newest first
    const result = await client.query(`
      SELECT id, title, excerpt, cover_image, created_at 
      FROM blogs 
      WHERE is_published = true 
      ORDER BY created_at DESC
    `);
    
    client.release();
    res.status(200).json(result.rows);

  } catch (error) {
    console.error("Database connection error:", error);
    res.status(500).json({ error: "Failed to query the archives" });
  }
}
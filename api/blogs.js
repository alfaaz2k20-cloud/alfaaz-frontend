import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

export default async function handler(req, res) {
  // CORS for Neocities
  res.setHeader('Access-Control-Allow-Origin', 'https://tchandervar.neocities.org');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Accept');
  
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');

  const { id } = req.query;
  if (!id) {
    return res.status(400).json({ error: "Missing article ID" });
  }

  try {
    const client = await pool.connect();
    
    // Fetch the specific blog by ID
    const result = await client.query('SELECT * FROM blogs WHERE id = $1 AND is_published = true', [id]);
    client.release();

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Article not found in the archives." });
    }

    res.status(200).json(result.rows[0]);

  } catch (error) {
    console.error("Database connection error:", error);
    res.status(500).json({ error: "Failed to read from the vault." });
  }
}
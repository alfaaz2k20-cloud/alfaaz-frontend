import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Accept');
  
  if (req.method === 'OPTIONS') { res.status(200).end(); return; }
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');

  const { id } = req.query;
  
  // 1. Ensure ID exists
  if (!id) {
    return res.status(400).json({ error: "Missing article ID" });
  }

  // 2. THE FIX: Force the ID to be a strict number. 
  // If the browser accidentally sent ?id=1/, this strips the slash.
  const numericId = parseInt(id, 10);

  if (isNaN(numericId)) {
    return res.status(400).json({ error: "Invalid ID format" });
  }

  try {
    const client = await pool.connect();
    
    // 3. Query the database using the strict number
    const result = await client.query('SELECT * FROM blogs WHERE id = $1 AND is_published = true', [numericId]);
    client.release();

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Article not found." });
    }

    res.status(200).json(result.rows[0]);

  } catch (error) {
    console.error("Database connection error:", error);
    res.status(500).json({ error: "Failed to read from the vault." });
  }
}
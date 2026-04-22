import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false } // Required for Neon
});

export default async function handler(req, res) {
  // Allow CORS just in case
  res.setHeader('Access-Control-Allow-Origin', '*');

  try {
    const client = await pool.connect();
    
    // 1. Fetch Active Events & Count Registrations
    const eventsResult = await client.query(`
      SELECT e.id, e.name, e.event_date, e.description, e.capacity,
             (SELECT COUNT(*) FROM event_registrations r WHERE r.event_id = e.id) as registered_count
      FROM events e
      WHERE e.registration_open = true
    `);
    
    const events = eventsResult.rows.map(e => {
        const count = parseInt(e.registered_count) || 0;
        return {
            name: e.name,
            event_date: e.event_date,
            description: e.description,
            capacity: e.capacity,
            spots_left: e.capacity > 0 ? e.capacity - count : null,
            full: e.capacity > 0 && count >= e.capacity
        };
    });

    // 2. Fetch Exhibition Config
    const exhResult = await client.query(`SELECT * FROM exhibition_config LIMIT 1`);
    let exhibition = null;
    if (exhResult.rows.length > 0) {
        const row = exhResult.rows[0];
        exhibition = {
            is_open: row.is_open,
            title: row.title,
            date_text: row.date_text,
            about_text: row.about_text
        };
    }
    
    client.release();

    // 3. Return the exact JSON format your frontend expects
    res.status(200).json({ events, exhibition });

  } catch (error) {
    console.error("Database connection error:", error);
    res.status(500).json({ error: "Failed to query Neon Vault" });
  }
}
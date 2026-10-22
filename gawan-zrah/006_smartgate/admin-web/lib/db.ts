import { Pool } from "pg";

// Kredensial hanya dari environment (.env.local), tidak pernah ditulis di kode.
// Pool dipakai bersama antar-request, koneksi dibuat lazily oleh pg.
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 5,
});

export async function query<T>(text: string): Promise<T[]> {
  const result = await pool.query(text);
  return result.rows as T[];
}

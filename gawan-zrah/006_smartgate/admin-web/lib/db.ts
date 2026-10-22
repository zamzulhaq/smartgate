import { Pool } from "pg";

// Kredensial hanya dari environment (.env.local), tidak pernah ditulis di kode.
// Pool dipakai bersama antar-request, koneksi dibuat lazily oleh pg.
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 5,
});

export async function query<T>(text: string, values: unknown[] = []): Promise<T[]> {
  const result = await pool.query(text, values);
  return result.rows as T[];
}

// Kode error PostgreSQL (mis. 23505 = unique violation, 23503 = foreign key).
export function kodeError(error: unknown): string | undefined {
  if (typeof error === "object" && error !== null && "code" in error) {
    return String((error as { code?: unknown }).code);
  }
  return undefined;
}

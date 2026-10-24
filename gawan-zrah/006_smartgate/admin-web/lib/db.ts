import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 5,
});

export type DbUser = { role: string; userId: string };

export async function query<T>(text: string, values: unknown[] = []): Promise<T[]> {
  const result = await pool.query(text, values);
  return result.rows as T[];
}

// Menjalankan query dengan konteks user/peran untuk RLS. Setting dibuat
// transaksi-lokal (set_config(..., true)) supaya tidak terbawa ke request lain
// saat koneksi dikembalikan ke pool.
export async function queryAs<T>(
  user: DbUser | null,
  text: string,
  values: unknown[] = [],
): Promise<T[]> {
  const client = await pool.connect();
  try {
    await client.query("begin");
    await client.query(
      "select set_config('app.role', $1, true), set_config('app.user_id', $2, true)",
      [user?.role ?? "", user?.userId ?? ""],
    );
    const result = await client.query(text, values);
    await client.query("commit");
    return result.rows as T[];
  } catch (error) {
    await client.query("rollback");
    throw error;
  } finally {
    client.release();
  }
}

export function kodeError(error: unknown): string | undefined {
  if (typeof error === "object" && error !== null && "code" in error) {
    return String((error as { code?: unknown }).code);
  }
  return undefined;
}

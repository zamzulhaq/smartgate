// Field dan nilai mengikuti PRD v0.2 bagian 3.1 (data warga dan rumah)
// dan bagian 7 (desain tabel). Jangan menambah field di luar daftar ini.

export const STATUS_HUNIAN = ["pemilik", "kontrak", "kosong"] as const;
export const STATUS_KELUARGA = [
  "kepala_keluarga",
  "pasangan",
  "anak",
  "art",
  "lainnya",
] as const;

export type StatusHunian = (typeof STATUS_HUNIAN)[number];
export type StatusKeluarga = (typeof STATUS_KELUARGA)[number];

export type Rumah = {
  id: string;
  blok: string;
  nomor: string;
  status_hunian: StatusHunian;
  catatan: string | null;
};

export type Warga = {
  id: string;
  house_id: string;
  nama: string;
  status_keluarga: StatusKeluarga;
  no_hp: string | null;
  aktif: boolean;
};

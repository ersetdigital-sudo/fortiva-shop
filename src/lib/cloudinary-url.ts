/**
 * Helper Cloudinary yang AMAN dipakai di client.
 * Jangan tambahkan `node:crypto` atau rahasia apa pun di file ini.
 */

export const CLOUDINARY_CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME ?? '';
export const CLOUDINARY_UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET ?? '';

export const CLOUDINARY_ACCEPTED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
export const CLOUDINARY_MAX_BYTES = 10 * 1024 * 1024; // 10MB (batas aman paket Cloudinary)
export const CLOUDINARY_ACCEPT_ATTR = 'image/jpeg,image/png,image/webp';

export interface TransformOptions {
  /** Lebar maksimum gambar yang dikirim ke browser. */
  w?: number;
  /** Tinggi (opsional, dipakai bareng c_fill). */
  h?: number;
  crop?: 'fill' | 'fit' | 'limit';
  /** Tambahan mentah, mis. "e_grayscale". */
  extra?: string;
}

/**
 * Bangun URL Cloudinary dengan optimasi otomatis (HEMAT KUOTA):
 *  - f_auto -> format paling ringan yang didukung browser (avif/webp)
 *  - q_auto -> kualitas otomatis, ukuran file turun tanpa kelihatan jelek
 *  - w_xxx  -> jangan serve gambar 4000px buat thumbnail
 *  - c_fill -> crop otomatis, tanpa whitespace
 */
export function cldUrl(source: string | null | undefined, options: TransformOptions = {}): string {
  if (!source) return '';

  // Data URI / blob / URL non-Cloudinary dibiarkan apa adanya.
  if (!source.includes('res.cloudinary.com')) return source;

  const { w = 800, h, crop = 'fill', extra } = options;

  const parts = ['f_auto', 'q_auto', `w_${w}`];
  if (h) parts.push(`h_${h}`);
  parts.push(`c_${crop}`);
  if (extra) parts.push(extra);

  const transform = parts.join(',');

  // Sisipkan transformasi tepat setelah "/upload/", dan hanya buang segmen
  // transformasi lama atau tag versi (v123/) — JANGAN buang nama folder.
  return source.replace(
    /\/upload\/((?:v\d+|[a-z]{1,3}_[^/]*(?:,[a-z]{1,3}_[^/]*)*)\/)?/,
    `/upload/${transform}/`
  );
}

/**
 * Ambil public_id dari secure_url Cloudinary.
 * https://res.cloudinary.com/<cloud>/image/upload/f_auto,q_auto,w_800/v123/folder/nama.webp
 *   -> folder/nama
 */
export function cldPublicId(source: string | null | undefined): string | null {
  if (!source || !source.includes('res.cloudinary.com')) return null;

  const match = source.match(/\/upload\/(.+)$/);
  if (!match) return null;

  let rest = match[1];

  // Buang segmen transformasi (mis. "f_auto,q_auto,w_800/").
  rest = rest.replace(/^(?:[a-z]{1,3}_[^/,]*)(?:,[a-z]{1,3}_[^/,]*)*\//, '');
  // Buang versi "v123456/".
  rest = rest.replace(/^v\d+\//, '');
  // Buang ekstensi.
  rest = rest.replace(/\.[a-z0-9]+$/i, '');

  return rest || null;
}

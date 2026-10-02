import crypto from 'node:crypto';

/**
 * Helper Cloudinary khusus SERVER (memakai node:crypto dan api_secret).
 * Jangan diimpor dari client component.
 *
 * Untuk helper yang aman di client (cldUrl, cldPublicId), pakai `@/lib/cloudinary-url`.
 */

export { CLOUDINARY_ACCEPTED_TYPES, CLOUDINARY_MAX_BYTES } from './cloudinary-url';
export { CLOUDINARY_CLOUD_NAME, CLOUDINARY_UPLOAD_PRESET } from './cloudinary-url';

export type CloudinaryParams = Record<string, string | number>;

/**
 * Signature Cloudinary: SHA-1 dari "k=v&k=v" (key terurut alfabetis) + api_secret.
 */
export function signCloudinaryParams(params: CloudinaryParams): string {
  const secret = process.env.CLOUDINARY_API_SECRET;
  if (!secret) throw new Error('CLOUDINARY_API_SECRET belum diisi di .env.local');

  const payload = Object.keys(params)
    .filter((key) => params[key] !== undefined && params[key] !== null && `${params[key]}` !== '')
    .sort()
    .map((key) => `${key}=${params[key]}`)
    .join('&');

  return crypto.createHash('sha1').update(payload + secret).digest('hex');
}

export function getCloudinaryCredentials() {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const secret = process.env.CLOUDINARY_API_SECRET;

  if (!apiKey || !secret || !cloudName) {
    throw new Error('Kredensial Cloudinary belum lengkap di .env.local');
  }

  return { cloudName, apiKey, secret };
}

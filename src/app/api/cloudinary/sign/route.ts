import { NextResponse } from 'next/server';
import { getAdminUser } from '@/lib/supabase/server';
import {
  CLOUDINARY_UPLOAD_PRESET,
  getCloudinaryCredentials,
  signCloudinaryParams,
} from '@/lib/cloudinary';

export const runtime = 'nodejs';

/**
 * Membuat signature untuk upload Cloudinary (SIGNED).
 * Hanya admin yang login boleh memanggil endpoint ini.
 */
export async function POST(request: Request) {
  const admin = await getAdminUser();
  if (!admin) {
    return NextResponse.json({ error: 'Tidak diizinkan.' }, { status: 401 });
  }

  let folder = 'fortiva';
  try {
    const body = (await request.json()) as { folder?: unknown };
    if (typeof body.folder === 'string' && body.folder.trim()) {
      // Bersihkan folder: hanya huruf, angka, garis miring, strip, underscore.
      folder = body.folder.trim().replace(/[^a-zA-Z0-9/_-]/g, '');
    }
  } catch {
    // Body kosong -> pakai folder default.
  }

  const { cloudName, apiKey } = getCloudinaryCredentials();
  const timestamp = Math.floor(Date.now() / 1000);

  const paramsToSign = {
    folder,
    timestamp,
    upload_preset: CLOUDINARY_UPLOAD_PRESET,
  };

  return NextResponse.json({
    cloudName,
    apiKey,
    uploadPreset: CLOUDINARY_UPLOAD_PRESET,
    ...paramsToSign,
    signature: signCloudinaryParams(paramsToSign),
  });
}

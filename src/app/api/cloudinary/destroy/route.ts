import { NextResponse } from 'next/server';
import { getAdminUser } from '@/lib/supabase/server';
import { getCloudinaryCredentials, signCloudinaryParams } from '@/lib/cloudinary';
import { cldPublicId } from '@/lib/cloudinary-url';

export const runtime = 'nodejs';

/**
 * Menghapus gambar lama di Cloudinary (dipakai saat gambar diganti).
 * Signature wajib, jadi hanya bisa lewat server.
 */
export async function POST(request: Request) {
  const admin = await getAdminUser();
  if (!admin) {
    return NextResponse.json({ error: 'Tidak diizinkan.' }, { status: 401 });
  }

  let source = '';
  try {
    const body = (await request.json()) as { publicId?: unknown; url?: unknown };
    if (typeof body.publicId === 'string') source = body.publicId;
    else if (typeof body.url === 'string') source = body.url;
  } catch {
    return NextResponse.json({ error: 'Body tidak valid.' }, { status: 400 });
  }

  const publicId = cldPublicId(source) ?? (source && !source.includes('http') ? source : null);
  if (!publicId) {
    return NextResponse.json({ error: 'public_id tidak ditemukan pada gambar ini.' }, { status: 400 });
  }

  const { cloudName, apiKey } = getCloudinaryCredentials();
  const timestamp = Math.floor(Date.now() / 1000);

  const paramsToSign = { invalidate: 'true', public_id: publicId, timestamp };
  const signature = signCloudinaryParams(paramsToSign);

  const form = new URLSearchParams({
    public_id: publicId,
    timestamp: String(timestamp),
    api_key: apiKey,
    signature,
    invalidate: 'true',
  });

  try {
    const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/destroy`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: form.toString(),
    });

    const result = (await response.json()) as { result?: string; error?: { message?: string } };

    if (!response.ok) {
      return NextResponse.json(
        { error: result.error?.message ?? 'Gagal menghapus gambar di Cloudinary.' },
        { status: response.status }
      );
    }

    return NextResponse.json({ ok: true, result: result.result ?? 'ok', publicId });
  } catch {
    return NextResponse.json({ error: 'Tidak dapat menghubungi Cloudinary.' }, { status: 502 });
  }
}

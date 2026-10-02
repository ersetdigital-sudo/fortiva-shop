'use client';

import React, { useRef, useState } from 'react';
import {
  CLOUDINARY_ACCEPT_ATTR,
  CLOUDINARY_ACCEPTED_TYPES,
  CLOUDINARY_MAX_BYTES,
  cldUrl,
} from '@/lib/cloudinary-url';
import { IconCheck, IconImage } from './icons';

interface ImageUploaderProps {
  /** URL gambar saat ini (secure_url Cloudinary). */
  value: string;
  /** Dipanggil setelah upload sukses atau gambar dihapus. */
  onChange: (url: string) => void;
  /** Folder tujuan di Cloudinary, mis. "fortiva/produk". */
  folder?: string;
  label?: string;
  hint?: string;
  /** Batas ukuran file dalam byte. Bawaan: CLOUDINARY_MAX_BYTES. */
  maxBytes?: number;
  /** Rasio preview. */
  aspect?: 'square' | 'wide';
}

function humanSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/**
 * Upload gambar langsung dari browser ke Cloudinary (SIGNED).
 * Gambar TIDAK pernah melewati Vercel maupun Supabase Storage —
 * backend hanya membuat signature, file-nya langsung dari browser ke Cloudinary.
 */
export function ImageUploader({
  value,
  onChange,
  folder = 'fortiva',
  label = 'Gambar',
  hint,
  maxBytes = CLOUDINARY_MAX_BYTES,
  aspect = 'wide',
}: ImageUploaderProps) {
  const resolvedHint = hint ?? `JPG, PNG, atau WEBP · maksimal ${humanSize(maxBytes)}`;
  const inputRef = useRef<HTMLInputElement>(null);
  const xhrRef = useRef<XMLHttpRequest | null>(null);

  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [localPreview, setLocalPreview] = useState<string | null>(null);

  const previewSrc = localPreview ?? cldUrl(value, { w: 800, crop: 'fit' });
  const boxClass = aspect === 'square' ? 'h-40 w-40' : 'h-40 w-full max-w-sm';

  /** Hapus gambar lama di Cloudinary (best-effort, tidak memblokir UI). */
  const destroyOld = async (url: string) => {
    if (!url || !url.includes('res.cloudinary.com')) return;
    try {
      await fetch('/api/cloudinary/destroy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      });
    } catch {
      // Diamkan: gambar lama gagal dihapus bukan alasan menggagalkan upload baru.
    }
  };

  const upload = async (file: File) => {
    setError(null);

    if (!CLOUDINARY_ACCEPTED_TYPES.includes(file.type)) {
      setError('Format harus JPG, PNG, atau WEBP.');
      return;
    }
    if (file.size > maxBytes) {
      setError(`Ukuran maksimal ${humanSize(maxBytes)} (file ini ${humanSize(file.size)}).`);
      return;
    }

    // Preview lokal muncul duluan supaya terasa instan.
    const objectUrl = URL.createObjectURL(file);
    setLocalPreview(objectUrl);
    setIsUploading(true);
    setProgress(0);

    try {
      const signResponse = await fetch('/api/cloudinary/sign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ folder }),
      });

      if (!signResponse.ok) {
        const payload = (await signResponse.json().catch(() => ({}))) as { error?: string };
        throw new Error(payload.error ?? 'Gagal mengambil signature upload.');
      }

      const signed = (await signResponse.json()) as {
        cloudName: string;
        apiKey: string;
        uploadPreset: string;
        timestamp: number;
        folder: string;
        signature: string;
      };

      const form = new FormData();
      form.append('file', file);
      form.append('api_key', signed.apiKey);
      form.append('timestamp', String(signed.timestamp));
      form.append('upload_preset', signed.uploadPreset);
      form.append('folder', signed.folder);
      form.append('signature', signed.signature);

      const secureUrl = await new Promise<string>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhrRef.current = xhr;
        xhr.open('POST', `https://api.cloudinary.com/v1_1/${signed.cloudName}/image/upload`);

        xhr.upload.onprogress = (event) => {
          if (event.lengthComputable) {
            setProgress(Math.round((event.loaded / event.total) * 100));
          }
        };

        xhr.onload = () => {
          try {
            const result = JSON.parse(xhr.responseText) as {
              secure_url?: string;
              error?: { message?: string };
            };
            if (xhr.status >= 200 && xhr.status < 300 && result.secure_url) {
              resolve(result.secure_url);
            } else {
              reject(new Error(result.error?.message ?? 'Upload ke Cloudinary gagal.'));
            }
          } catch {
            reject(new Error('Respons Cloudinary tidak dapat dibaca.'));
          }
        };

        xhr.onerror = () => reject(new Error('Koneksi ke Cloudinary terputus.'));
        xhr.send(form);
      });

      // Gambar baru sudah aman -> baru hapus yang lama.
      const previous = value;
      onChange(secureUrl);
      if (previous && previous !== secureUrl) await destroyOld(previous);

      setLocalPreview(null);
      setProgress(100);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload gagal.');
      setLocalPreview(null);
    } finally {
      setIsUploading(false);
      xhrRef.current = null;
      URL.revokeObjectURL(objectUrl);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  const handleRemove = async () => {
    setError(null);
    const current = value;
    setLocalPreview(null);
    setProgress(0);
    onChange('');
    await destroyOld(current);
  };

  const handleFiles = (files: FileList | null) => {
    const file = files?.[0];
    if (file) void upload(file);
  };

  return (
    <div className="w-full">
      <div className="mb-1.5 flex items-baseline justify-between gap-3">
        <label className="text-[13px] font-semibold text-[#111827]">{label}</label>
        <span className="text-[11px] text-[#6B7280]">{resolvedHint}</span>
      </div>

      <div
        onDragOver={(event) => {
          event.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(event) => {
          event.preventDefault();
          setIsDragging(false);
          handleFiles(event.dataTransfer.files);
        }}
        className={`${boxClass} relative overflow-hidden rounded-2xl border-2 border-dashed transition-colors ${
          isDragging ? 'border-[#F2352B] bg-[#F2352B]/5' : 'border-[#E5E3DC] bg-white'
        }`}
      >
        {previewSrc ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={previewSrc}
              alt={label}
              loading="lazy"
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-2 bg-gradient-to-t from-black/70 to-transparent px-3 py-2">
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                disabled={isUploading}
                className="rounded-full bg-white/95 px-3 py-1 text-[11px] font-semibold text-[#111827] transition hover:bg-white disabled:opacity-60"
              >
                Ganti
              </button>
              <button
                type="button"
                onClick={handleRemove}
                disabled={isUploading}
                className="rounded-full bg-[#F2352B] px-3 py-1 text-[11px] font-semibold text-white transition hover:bg-[#DC2626] disabled:opacity-60"
              >
                Hapus
              </button>
            </div>
          </>
        ) : (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={isUploading}
            className="flex h-full w-full flex-col items-center justify-center gap-1.5 px-4 text-center"
          >
            <IconImage className="h-7 w-7 text-[#6B7280]" />
            <span className="text-[13px] font-semibold text-[#111827]">
              {isUploading ? 'Mengunggah…' : 'Pilih atau tarik gambar ke sini'}
            </span>
            <span className="text-[11px] text-[#6B7280]">Maksimal {humanSize(maxBytes)}</span>
          </button>
        )}

        {isUploading && (
          <div className="absolute inset-x-0 top-0 h-1 bg-black/10">
            <div
              className="h-full bg-[#245BE8] transition-[width] duration-200"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept={CLOUDINARY_ACCEPT_ATTR}
        className="hidden"
        onChange={(event) => handleFiles(event.target.files)}
      />

      {isUploading && (
        <p className="mt-1.5 text-[11px] font-medium text-[#245BE8]">
          Mengunggah ke Cloudinary… {progress}%
        </p>
      )}

      {error && (
        <p className="mt-1.5 text-[11px] font-medium text-[#F2352B]">{error}</p>
      )}

      {value && !isUploading && !error && (
        <p className="mt-1.5 flex items-center gap-1 truncate text-[11px] text-[#16803C]">
          <IconCheck className="h-3.5 w-3.5 shrink-0" /> Tersimpan ·{' '}
          <span className="font-mono text-[10px] text-[#6B7280]">{value}</span>
        </p>
      )}
    </div>
  );
}

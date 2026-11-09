import "server-only";
import crypto from "crypto";
import { createClient } from "@supabase/supabase-js";

/**
 * Photo uploads for the admin, stored in the public Supabase Storage bucket `media` (see supabase/schema.sql).
 * The server signs a one-time upload URL and the browser sends the file straight to Supabase, so big photos never
 * pass through (or hit the size limits of) our own server.
 */

export const MEDIA_BUCKET = "media";
export const MEDIA_TYPES = ["image/jpeg", "image/png", "image/webp", "image/avif"] as const;
export const MEDIA_MAX_BYTES = 10 * 1024 * 1024;

const url = () => process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const secret = () => process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

export const mediaEnabled = () => !!(url() && secret());

export async function signUpload(folder: string, type: string) {
  const ext = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp", "image/avif": "avif" }[type] ?? "jpg";
  const safeFolder = folder.replace(/[^a-z0-9-]/gi, "").slice(0, 30) || "misc";
  const path = `${safeFolder}/${new Date().toISOString().slice(0, 7)}/${crypto.randomBytes(8).toString("hex")}.${ext}`;
  const supabase = createClient(url()!, secret()!, { auth: { persistSession: false, autoRefreshToken: false } });
  const { data, error } = await supabase.storage.from(MEDIA_BUCKET).createSignedUploadUrl(path);
  if (error || !data) throw new Error(`[media] ${error?.message ?? "could not sign upload"}`);
  const publicUrl = supabase.storage.from(MEDIA_BUCKET).getPublicUrl(path).data.publicUrl;
  return { signedUrl: data.signedUrl, token: data.token, path, publicUrl };
}

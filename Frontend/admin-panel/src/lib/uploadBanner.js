import { api } from './api';

const MAX_BYTES = 5 * 1024 * 1024;

/**
 * Upload banner through the API proxy (POST /admin/upload).
 * Avoids browser ↔ S3 CORS failures on presigned PUT.
 * Returns the S3 object key to store as banner_key.
 */
export async function uploadBannerFile(file) {
  if (!file) return null;

  if (!/^image\/(jpeg|png|webp|gif)$/.test(file.type)) {
    throw new Error('Banner must be JPG, PNG, WEBP, or GIF');
  }
  if (file.size > MAX_BYTES) {
    throw new Error('Banner must be 5MB or smaller');
  }

  const form = new FormData();
  form.append('banner', file);

  // Let the browser set multipart boundary — do not force Content-Type
  const { data } = await api.post('/admin/upload', form);

  return data.key;
}

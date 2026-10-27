import { UploadApiResponse } from 'cloudinary';
import { cloudinaryClient } from '../lib/cloudinary';

const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

export async function uploadImage(buffer: Buffer, mimeType: string, folder: 'avatars' | 'article-covers'): Promise<UploadApiResponse> {
  if (buffer.length > MAX_IMAGE_BYTES) throw new Error('IMAGE_TOO_LARGE');
  if (!['image/jpeg', 'image/png', 'image/webp', 'image/gif'].includes(mimeType)) throw new Error('INVALID_IMAGE');

  return cloudinaryClient.uploadStream(buffer, {
    folder: `barruu/${folder}`,
    transformation: [{ width: folder === 'avatars' ? 512 : 1600, height: folder === 'avatars' ? 512 : 1000, crop: 'limit', quality: 'auto', fetch_format: 'auto' }],
  });
}

export { MAX_IMAGE_BYTES };


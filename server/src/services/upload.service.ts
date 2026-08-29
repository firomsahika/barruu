import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';

const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

let configured = false;

function configureCloudinary(): void {
  if (configured) return;

  const { CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET } = process.env;
  if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET) {
    throw new Error('CLOUDINARY_NOT_CONFIGURED');
  }

  cloudinary.config({
    cloud_name: CLOUDINARY_CLOUD_NAME,
    api_key: CLOUDINARY_API_KEY,
    api_secret: CLOUDINARY_API_SECRET,
    secure: true,
  });
  configured = true;
}

export async function uploadImage(buffer: Buffer, mimeType: string, folder: 'avatars' | 'article-covers'): Promise<UploadApiResponse> {
  configureCloudinary();

  if (buffer.length > MAX_IMAGE_BYTES) throw new Error('IMAGE_TOO_LARGE');
  if (!['image/jpeg', 'image/png', 'image/webp', 'image/gif'].includes(mimeType)) throw new Error('INVALID_IMAGE');

  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream({
      folder: `barruu/${folder}`,
      resource_type: 'image',
      transformation: [{ width: folder === 'avatars' ? 512 : 1600, height: folder === 'avatars' ? 512 : 1000, crop: 'limit', quality: 'auto', fetch_format: 'auto' }],
    }, (error, result) => {
      if (error || !result) reject(error || new Error('UPLOAD_FAILED'));
      else resolve(result);
    });
    stream.end(buffer);
  });
}

export { MAX_IMAGE_BYTES };

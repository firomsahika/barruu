import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';

export interface CloudinaryClient {
  uploadStream(
    buffer: Buffer,
    options: { folder: string; transformation?: Record<string, unknown>[] }
  ): Promise<UploadApiResponse>;
}

class RealCloudinaryClient implements CloudinaryClient {
  private configured = false;

  private ensureConfigured(): void {
    if (this.configured) return;
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
    this.configured = true;
  }

  async uploadStream(
    buffer: Buffer,
    options: { folder: string; transformation?: Record<string, unknown>[] }
  ): Promise<UploadApiResponse> {
    this.ensureConfigured();
    return new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder: options.folder,
          resource_type: 'image',
          transformation: options.transformation,
        },
        (error, result) => {
          if (error || !result) reject(error || new Error('UPLOAD_FAILED'));
          else resolve(result);
        }
      );
      stream.end(buffer);
    });
  }
}

class InMemoryFakeCloudinaryClient implements CloudinaryClient {
  async uploadStream(
    buffer: Buffer,
    options: { folder: string; transformation?: Record<string, unknown>[] }
  ): Promise<UploadApiResponse> {
    const fakeId = `fake_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    return {
      public_id: `${options.folder}/${fakeId}`,
      version: 1,
      signature: 'fake_signature',
      width: 800,
      height: 600,
      format: 'webp',
      resource_type: 'image',
      created_at: new Date().toISOString(),
      tags: [],
      bytes: buffer.length,
      type: 'upload',
      etag: 'fake_etag',
      placeholder: false,
      url: `http://localhost:5000/fake-media/${fakeId}.webp`,
      secure_url: `https://res.cloudinary.com/fake-cloud/image/upload/${options.folder}/${fakeId}.webp`,
      access_mode: 'public',
    } as UploadApiResponse;
  }
}

export const cloudinaryClient: CloudinaryClient =
  process.env.NODE_ENV === 'test'
    ? new InMemoryFakeCloudinaryClient()
    : new RealCloudinaryClient();

import axios from 'axios';

export function getApiErrorMessage(error: unknown, fallback: string): string {
  if (!axios.isAxiosError(error)) return fallback;

  const status = error.response?.status;
  const serverMessage = error.response?.data?.error;

  if (status && status >= 500) return 'Rakkoon serverii uumame. Mee yeroo muraasa booda yaali.';
  if (!error.response) return 'Serverii bira gahuu hin dandeenye. Internet kee mirkaneessi.';
  if (typeof serverMessage === 'string' && serverMessage.trim()) return serverMessage;
  return fallback;
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT token to every request
api.interceptors.request.use((config) => {                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    
  if (typeof window !== 'undefined') {
    const token =                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              localStorage.getItem('sb_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         
    }
  }
  return config;
});

// Leave session clearing to the auth flow so refreshes and transient 401s do not log users out unexpectedly.
api.interceptors.response.use(
  (res) => res,
  (error) => Promise.reject(error)
);

export default api;

export async function uploadImage(file: File, folder: 'avatars' | 'article-covers'): Promise<string> {
  if (!['image/jpeg', 'image/png', 'image/webp', 'image/gif'].includes(file.type)) {
    throw new Error('JPG, PNG, WebP ykn GIF qofa fayyadami');
  }
  if (file.size > 5 * 1024 * 1024) {
    throw new Error('Fakkiin guddaan 5MB caaluu hin qabu');
  }

  const formData = new FormData();
  formData.append('image', file);
  formData.append('folder', folder);
  const response = await api.post('/uploads/image', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data.url as string;
}

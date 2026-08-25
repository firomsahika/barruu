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

// Handle 401 unauthorized
api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      localStorage.removeItem('sb_token');
      localStorage.removeItem('sb_user');
    }
    return Promise.reject(error);
  }
);

export default api;

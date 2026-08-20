import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';

export function useTags() {
  return useQuery({
    queryKey: ['tags'],
    queryFn: async () => {
      const { data } = await api.get('/tags');
      return data;
    },
  });
}

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { Article, ArticlesResponse } from '@/types';

export function useArticles(params: {
  page?: number;
  limit?: number;
  category?: string;
  tag?: string;
  sort?: 'relevant' | 'latest' | 'top';
  search?: string;
}) {
  return useQuery({
    queryKey: ['articles', params],
    queryFn: async () => {
      const { data } = await api.get<ArticlesResponse>('/articles', { params });
      return data;
    },
  });
}

export function useArticle(slug: string) {
  return useQuery({
    queryKey: ['article', slug],
    queryFn: async () => {
      const { data } = await api.get<Article>(`/articles/${slug}`);
      return data;
    },
    enabled: !!slug,
  });
}

export function useReactToArticle() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, type }: { id: string; type: 'LIKE' | 'UNICORN' }) => {
      const { data } = await api.post(`/articles/${id}/react`, { type });
      return data;
    },
    onSuccess: (_, variables) => {
      // Invalidate both lists and specific article to ensure freshness
      queryClient.invalidateQueries({ queryKey: ['articles'] });
      // We could also do optimistic updates here for true professionalism
    }
  });
}

export function useBookmarkArticle() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await api.post(`/articles/${id}/bookmark`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['articles'] });
    }
  });
}

export function useAddComment() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, content }: { id: string; content: string }) => {
      const { data } = await api.post(`/articles/${id}/comments`, { content });
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['article'] }); // invalidate all article queries to get new comments
    }
  });
}

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { Article, User } from '@/types';

export interface BookmarkRecord {
  id: string;
  createdAt: string;
  article: Article;
}

export function useBookmarks(enabled = true) {
  return useQuery<BookmarkRecord[]>({
    queryKey: ['bookmarks'],
    queryFn: async () => (await api.get('/users/bookmarks')).data,
    enabled,
  });
}

export function useDrafts() {
  return useQuery<Article[]>({
    queryKey: ['drafts'],
    queryFn: async () => (await api.get('/users/drafts')).data,
  });
}

export function useFollowing(enabled = true) {
  return useQuery<User[]>({
    queryKey: ['following'],
    queryFn: async () => (await api.get('/users/following')).data,
    enabled,
  });
}

export function useFollowUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ followeeId, following }: { followeeId: string; following: boolean }) => {
      const path = following ? '/users/unfollow' : '/users/follow';
      return (await api.post(path, { followeeId })).data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['following'] }),
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: { name?: string; username?: string; email?: string; bio?: string; avatarUrl?: string }) =>
      (await api.put('/users/me', data)).data,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['me'] }),
  });
}

export function useDeleteArticle() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => (await api.delete(`/articles/${id}`)).data,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['articles'] });
      queryClient.invalidateQueries({ queryKey: ['drafts'] });
    },
  });
}

export function useNotifications() {
  return useQuery({
    queryKey: ['notifications'],
    queryFn: async () => (await api.get('/notifications')).data,
  });
}

export function useUnreadNotificationCount(enabled = true) {
  return useQuery<{ count: number }>({
    queryKey: ['notifications', 'unread-count'],
    queryFn: async () => (await api.get('/notifications/unread-count')).data,
    enabled,
    refetchInterval: 30_000,
  });
}

export function useMarkNotificationRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => (await api.patch(`/notifications/${id}/read`)).data,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  });
}

export function useMarkAllNotificationsRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => (await api.patch('/notifications/mark-all-read')).data,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  });
}

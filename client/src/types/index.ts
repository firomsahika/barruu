export type Category = 'ODUU' | 'MAMMAAKSA' | 'SEENAA' | 'WALALOO' | 'DURDURII' | 'ASOOSAMA' | 'OOLMAA' | 'SAGALEE';
export type ReactionType = 'LIKE' | 'UNICORN';

export interface Tag {
  id: string;
  name: string;
  slug: string;
  color?: string;
  _count?: { articles: number };
}

export interface ArticleTag {
  tag: Tag;
}

export interface User {
  id: string;
  name: string;
  username: string;
  email?: string;
  avatarUrl?: string;
  bio?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Author {
  id: string;
  name: string;
  username: string;
  avatarUrl?: string;
  bio?: string;
  createdAt?: string;
  _count?: { articles: number };
}

export interface Comment {
  id: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  author: Author;
  articleId: string;
  parentId?: string;
  replies?: Comment[];
}

export interface ArticleCount {
  reactions: number;
  comments: number;
  bookmarks: number;
}

export interface Article {
  id: string;
  slug: string;
  title: string;
  content: string;
  excerpt?: string;
  coverImageUrl?: string;
  audioUrl?: string;
  category: Category;
  readingTime: number;
  published: boolean;
  featured: boolean;
  viewCount: number;
  createdAt: string;
  updatedAt: string;
  author: Author;
  tags: ArticleTag[];
  comments?: Comment[];
  _count: ArticleCount;
  reactionCounts?: { likes: number; unicorns: number };
  userReactions?: { liked: boolean; unicorned: boolean };
  userBookmarked?: boolean;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export interface ArticlesResponse {
  articles: Article[];
  pagination: PaginationMeta;
}

export const CATEGORY_LABELS: Record<Category, string> = {
  ODUU: 'Oduu',
  MAMMAAKSA: 'Mammaaksa',
  SEENAA: 'Seenaa',
  WALALOO: 'Walaloo',
  DURDURII: 'Durdurii',
  ASOOSAMA: 'Asoosama',
  OOLMAA: 'Oolmaa',
  SAGALEE: 'Sagalee',
};

export const CATEGORY_COLORS: Record<Category, string> = {
  ODUU: '#2563eb',
  MAMMAAKSA: '#ca8a04',
  SEENAA: '#9333ea',
  WALALOO: '#7c3aed',
  DURDURII: '#ea580c',
  ASOOSAMA: '#0891b2',
  OOLMAA: '#16a34a',
  SAGALEE: '#dc2626',
};

export function getAvatarUrl(user: { avatarUrl?: string; name: string }): string {
  if (user.avatarUrl) return user.avatarUrl;
  const seed = encodeURIComponent(user.name);
  return `https://api.dicebear.com/7.x/initials/svg?seed=${seed}&backgroundColor=3b49df&textColor=ffffff`;
}

export function formatDate(date: string): string {
  const d = new Date(date);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export function formatRelativeDate(date: string): string {
  const now = new Date();
  const d = new Date(date);
  const diff = now.getTime() - d.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return 'amma dura';
  if (minutes < 60) return `daqiiqaa ${minutes} dura`;
  if (hours < 24) return `sa'aatii ${hours} dura`;
  if (days < 7) return `guyyaa ${days} dura`;
  return formatDate(date);
}

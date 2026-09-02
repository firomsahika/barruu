'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import { useAuthStore } from '@/store/authStore';
import { useMarkAllNotificationsRead, useMarkNotificationRead, useNotifications } from '@/hooks/useUserActions';
import { formatRelativeDate } from '@/types';

interface NotificationItem { id: string; message: string; link?: string; isRead: boolean; createdAt: string; actor?: { name: string } }

export default function NotificationsPage() {
  const router = useRouter();
  const { user, isInitialized } = useAuthStore();
  const { data: notifications = [], isLoading } = useNotifications() as { data?: NotificationItem[]; isLoading: boolean };
  const markRead = useMarkNotificationRead();
  const markAllRead = useMarkAllNotificationsRead();

  useEffect(() => {
    if (!isInitialized) return;
    if (!user) router.replace('/login');
  }, [isInitialized, user, router]);

  if (!isInitialized) return <><Header /><p className="mx-auto max-w-3xl px-4 py-16 text-center text-gray-600">Sessionii ni eegama...</p></>;
  if (!user) return <><Header /><p className="mx-auto max-w-3xl px-4 py-16 text-center text-gray-600">Beeksisa ilaaluuf seeni.</p></>;

  return (
    <><Header /><main className="mx-auto max-w-3xl px-4 py-8">
      <div className="mb-8 flex items-center justify-between gap-4"><h1 className="text-xs font-bold text-gray-900">Beeksisa</h1><button onClick={() => markAllRead.mutate()} disabled={markAllRead.isPending} className="text-xs font-semibold text-blue-600 disabled:opacity-50">Hundaa dubbifame godhi</button></div>
      {isLoading && <p className="py-12 text-center text-gray-500">Fe'aa jira...</p>}
      {!isLoading && notifications.length === 0 && <p className="py-12 text-center text-gray-500">Beeksisni hin jiru.</p>}
      <div className="divide-y divide-gray-200 rounded-md border border-gray-200 bg-white">{notifications.map((notification) => {
        const content = <div className={`px-4 py-4 ${notification.isRead ? '' : 'bg-blue-50'}`}><p className="text-xs text-gray-800">{notification.actor?.name ? `${notification.actor.name}: ` : ''}{notification.message}</p><p className="mt-1 text-xs text-gray-500">{formatRelativeDate(notification.createdAt)}</p></div>;
        return <div key={notification.id} onClick={() => { if (!notification.isRead) markRead.mutate(notification.id); }}>{notification.link ? <Link href={notification.link}>{content}</Link> : content}</div>;
      })}</div>
    </main></>
  );
}

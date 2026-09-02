'use client';

import { FormEvent, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import { useAuthStore } from '@/store/authStore';
import { useDeleteArticle, useDrafts, useUpdateProfile } from '@/hooks/useUserActions';
import { getAvatarUrl } from '@/types';
import { uploadImage } from '@/lib/api';
import toast from 'react-hot-toast';

export default function DashboardPage() {
  const { user, isInitialized, updateUser } = useAuthStore();
  const router = useRouter();
  const { data: drafts = [], isLoading } = useDrafts();
  const updateProfile = useUpdateProfile();
  const deleteArticle = useDeleteArticle();
  const [form, setForm] = useState({ name: '', username: '', email: '', bio: '' });
  const [avatarUrl, setAvatarUrl] = useState('');
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);

  useEffect(() => {
    if (isInitialized && !user) router.replace('/login');
    if (user) {
      setForm({ name: user.name, username: user.username, email: user.email, bio: user.bio || '' });
      setAvatarUrl(user.avatarUrl || '');
    }
  }, [isInitialized, user, router]);

  const persistProfile = async (nextAvatarUrl?: string) => {
    const persistedAvatarUrl = nextAvatarUrl ?? avatarUrl;
    const payload = {
      ...form,
      bio: form.bio?.trim() ? form.bio.trim() : undefined,
      avatarUrl: persistedAvatarUrl || undefined,
    };

    const updated = await updateProfile.mutateAsync(payload);
    updateUser(updated);
    return updated;
  };

  const saveProfile = async (event: FormEvent) => {
    event.preventDefault();
    try {
      await persistProfile();
      toast.success('Odeeffannoon kee haaromfame.');
    } catch (error: unknown) {
      toast.error((error as { response?: { data?: { error?: string } } })?.response?.data?.error || 'Fooyyeessuu hin dandeenye.');
    }
  };

  const handleAvatarUpload = async (file: File) => {
    setIsUploadingAvatar(true);
    try {
      const uploadedUrl = await uploadImage(file, 'avatars');
      setAvatarUrl(uploadedUrl);
      updateUser({ avatarUrl: uploadedUrl });
      await persistProfile(uploadedUrl);
      toast.success('Suuraan kee olkaa\'ame');
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : 'Suuraa olkaa\'uu hin dandeenye');
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  if (!isInitialized || !user) return null;

  return <><Header /><main className="mx-auto max-w-4xl px-4 py-8"><h1 className="mb-8 text-xl font-bold text-gray-900">Dashboard</h1>
    <section className="mb-8 rounded-md border border-gray-200 bg-white p-6"><h2 className="mb-4 text-base font-bold text-gray-900">Profile kee gulaali</h2><form onSubmit={saveProfile} className="grid gap-4 sm:grid-cols-2">
      <div className="flex items-center gap-4 sm:col-span-2">
        <img src={avatarUrl || getAvatarUrl(user)} alt={user.name} className="h-16 w-16 rounded-full object-cover ring-2 ring-slate-100" />
        <label className="flex min-h-11 cursor-pointer items-center rounded-md border border-gray-200 px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50">
          {isUploadingAvatar ? 'Olkaa\'aa jira...' : 'Suuraa jijjiiri'}
          <input type="file" accept="image/jpeg,image/png,image/webp,image/gif" className="sr-only" disabled={isUploadingAvatar} onChange={(event) => { const file = event.target.files?.[0]; if (file) void handleAvatarUpload(file); event.target.value = ''; }} />
        </label>
      </div>
      {(['name', 'username', 'email'] as const).map((field) => <label key={field} className="text-xs font-semibold text-gray-700">{field === 'name' ? 'Maqaa' : field === 'username' ? 'Maqaa fayyadamaa' : 'Email'}<input value={form[field]} onChange={(event) => setForm({ ...form, [field]: event.target.value })} type={field === 'email' ? 'email' : 'text'} className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 font-normal outline-none focus:border-blue-600" required /></label>)}
      <label className="text-xs font-semibold text-gray-700 sm:col-span-2">Bio<textarea value={form.bio} onChange={(event) => setForm({ ...form, bio: event.target.value })} rows={3} className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 font-normal outline-none focus:border-blue-600" /></label>
      <button disabled={updateProfile.isPending} className="w-fit rounded-md bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-700 disabled:opacity-50">{updateProfile.isPending ? 'Kuufaa...' : 'Kuufi'}</button>
    </form></section>
    <section><div className="mb-4 flex items-center justify-between"><h2 className="text-base font-bold text-gray-900">Draftwwan kee</h2><Link href="/write" className="text-xs font-semibold text-blue-600">Draft haaraa</Link></div>{isLoading && <p className="text-xs text-gray-500">Fe'aa jira...</p>}{!isLoading && drafts.length === 0 && <p className="text-xs text-gray-500">Draft hin jiru.</p>}<div className="space-y-3">{drafts.map((draft) => <div key={draft.id} className="flex items-center justify-between gap-4 rounded-md border border-gray-200 bg-white p-4"><div><h3 className="text-xs font-semibold text-gray-900">{draft.title}</h3><p className="text-xs text-gray-500">{new Date(draft.updatedAt).toLocaleDateString()}</p></div><div className="flex gap-3 text-xs"><Link href={`/write?slug=${encodeURIComponent(draft.slug)}`} className="font-semibold text-blue-600">Gulaali</Link><button onClick={() => { if (window.confirm('Draft kana haquu barbaaddaa?')) deleteArticle.mutate(draft.id); }} className="font-semibold text-red-600">Haqi</button></div></div>)}</div></section>
  </main></>;
}

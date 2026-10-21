'use client';

import { FormEvent, useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import Header from '@/components/Header';
import api from '@/lib/api';
import toast from 'react-hot-toast';

function ResetPasswordForm() {
  const token = useSearchParams().get('token') || '';
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!token) {
      toast.error('Mallattoo haaromsaa hin jiru.');
      return;
    }
    if (password !== confirmPassword) {
      toast.error('Jechoonni darbii wal hin fakkaatan.');
      return;
    }
    setIsSaving(true);
    try {
      await api.post('/auth/reset-password', { token, password, confirmPassword });
      toast.success('Jechi darbii kee haaromfame.');
      router.push('/login');
    } catch (error: unknown) {
      toast.error(
        (error as { response?: { data?: { error?: string } } })?.response?.data?.error ||
          'Haaromsuu hin dandeenye.'
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="rounded-md border border-gray-200 bg-white p-6">
      <h1 className="mb-2 text-lg font-bold text-gray-900">Jecha darbii haaromsi</h1>
      <p className="mb-6 text-xs text-gray-600">Jechocha darbii haaraa kee galchi.</p>
      {token ? (
        <form onSubmit={submit} className="space-y-4">
          <label className="block text-xs font-semibold text-gray-700">
            Jecha darbii haaraa
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 font-normal outline-none focus:border-blue-600"
            />
          </label>
          <label className="block text-xs font-semibold text-gray-700">
            Irra deebi&apos;i
            <input
              type="password"
              required
              minLength={6}
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 font-normal outline-none focus:border-blue-600"
            />
          </label>
          <button
            disabled={isSaving}
            className="w-full rounded-md bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {isSaving ? 'Haaromsaa jira...' : 'Jechocha darbii haaromsi'}
          </button>
        </form>
      ) : (
        <div className="space-y-3">
          <p className="rounded-md bg-red-50 p-3 text-xs text-red-700">Linkiin haaromsaa sirrii miti.</p>
          <Link href="/forgot-password" className="text-xs font-semibold text-blue-600">
            Link haaraa gaafadhu
          </Link>
        </div>
      )}
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <>
      <Header />
      <main className="mx-auto max-w-md px-4 py-16">
        <Suspense fallback={<div className="p-8 text-center text-xs text-gray-500">Fe&apos;aa jira...</div>}>
          <ResetPasswordForm />
        </Suspense>
      </main>
    </>
  );
}

'use client';

import { FormEvent, useState } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import api from '@/lib/api';
import toast from 'react-hot-toast';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [sent, setSent] = useState(false);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setIsSending(true);
    try {
      await api.post('/auth/forgot-password', { email });
      setSent(true);
    } catch { toast.error('Gaafii ergaa sana erguu hin dandeenye.'); }
    finally { setIsSending(false); }
  };

   return <><Header /><main className="mx-auto max-w-md px-4 py-16"><div className="rounded-md border border-gray-200 bg-white p-6"><h1 className="mb-2 text-lg font-bold text-gray-900">Jecha darbii dagattee?</h1><p className="mb-6 text-xs text-gray-600">Imeelii kee galchi; qajeelfama haaromsaa yoo jiraate ni ergina.</p>{sent ? <div className="space-y-4"><p className="rounded-md bg-green-50 p-3 text-xs text-green-800">Yoo akaawuntiin jiraate, qajeelfamni gara imeelii keetti ergama.</p><Link href="/login" className="text-xs font-semibold text-blue-600">Gara seensaatti deebi&apos;i</Link></div> : <form onSubmit={submit} className="space-y-4"><label className="block text-xs font-semibold text-gray-700">Email<input type="email" required value={email} onChange={(event) => setEmail(event.target.value)} className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 font-normal outline-none focus:border-blue-600" /></label><button disabled={isSending} className="w-full rounded-md bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-700 disabled:opacity-50">{isSending ? 'Ergaa jira...' : 'Qajeelfama ergi'}</button></form>}</div></main></>;
}

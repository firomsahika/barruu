'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { getApiErrorMessage } from '@/lib/api';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { login, isLoading } = useAuthStore();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login(email, password);
      toast.success('Simaate! Seentaniittu.');
      router.push('/');
    } catch (error: unknown) {
      toast.error(getApiErrorMessage(error, 'Seenuu hin danda\'amne'));
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: '#f5f5f5',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
      }}
    >
      {/* Logo */}
      <Link
        href="/"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '48px',
          height: '48px',
          backgroundColor: '#08090a',
          borderRadius: '8px',
          color: '#ffffff',
          fontWeight: 800,
          fontSize: '16px',
          textDecoration: 'none',
          marginBottom: '24px',
        }}
      >
        B
      </Link>

      <h1
        style={{
          fontSize: '28px',
          fontWeight: 800,
          color: '#08090a',
          marginBottom: '8px',
          textAlign: 'center',
        }}
      >
        Barruu Seeni
      </h1>
      <p style={{ color: '#6b7280', fontSize: '15px', marginBottom: '32px', textAlign: 'center' }}>
        Akaawuntii kee fayyadamii seeni
      </p>

      <div
        style={{
          backgroundColor: '#ffffff',
          border: '1px solid #e5e7eb',
          borderRadius: '12px',
          padding: '32px',
          width: '100%',
          maxWidth: '400px',
        }}
      >
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '16px' }}>
            <label
              htmlFor="email"
              style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: '#08090a', marginBottom: '6px' }}
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="email@fkn.com"
              style={{
                width: '100%',
                padding: '10px 14px',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                fontSize: '15px',
                color: '#08090a',
                outline: 'none',
                fontFamily: 'inherit',
                boxSizing: 'border-box',
                transition: 'border-color 0.15s',
              }}
              onFocus={(e) => (e.target.style.borderColor = '#3b49df')}
              onBlur={(e) => (e.target.style.borderColor = '#e5e7eb')}
            />
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label
              htmlFor="password"
              style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: '#08090a', marginBottom: '6px' }}
            >
              Jecha Darbii
            </label>
            <div style={{ position: 'relative' }}>
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                style={{
                  width: '100%',
                  padding: '10px 40px 10px 14px',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  fontSize: '15px',
                  color: '#08090a',
                  outline: 'none',
                  fontFamily: 'inherit',
                  boxSizing: 'border-box',
                  transition: 'border-color 0.15s',
                }}
                onFocus={(e) => (e.target.style.borderColor = '#3b49df')}
                onBlur={(e) => (e.target.style.borderColor = '#e5e7eb')}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  border: 'none',
                  background: 'none',
                  cursor: 'pointer',
                  color: '#6b7280',
                  display: 'flex',
                  alignItems: 'center',
                  padding: 0,
                }}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="bg-slate-800 "
            style={{
              width: '100%',
              padding: '12px',
              
              color: '#ffffff',
              border: 'none',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: 700,
              cursor: isLoading ? 'not-allowed' : 'pointer',
              fontFamily: 'inherit',
              transition: 'background 0.15s',
            }}
          >
            {isLoading ? 'Seenaa jira...' : 'Seeni'}
          </button>
          <Link href="/forgot-password" style={{ display: 'block', marginTop: '12px', textAlign: 'center', color: '#3b49df', fontSize: '13px', textDecoration: 'none' }}>
            Jecha darbii dagattee?
          </Link>
        </form>

        <div style={{ textAlign: 'center', marginTop: '24px', fontSize: '14px', color: '#6b7280' }}>
          Akaawuntii hin qabdu?{' '}
          <Link href="/register" style={{ color: '#3b49df', fontWeight: 600, textDecoration: 'none' }}>
            Galmaa&apos;i
          </Link>
        </div>
      </div>
    </div>
  );
}

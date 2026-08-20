'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, Check } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import toast from 'react-hot-toast';

export default function RegisterPage() {
  const [form, setForm] = useState({
    name: '',
    username: '',
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const { register, isLoading } = useAuthStore();
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: name === 'username' ? value.toLowerCase().replace(/[^a-z0-9_]/g, '') : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password.length < 6) {
      toast.error('Jecha darbii waraabbii 6 caaluu qaba');
      return;
    }
    try {
      await register(form);
      toast.success('Simaate! Galmooftaniittu.');
      router.push('/');
    } catch (error: unknown) {
      toast.error((error as Error).message || 'Galmaa\'uun hin danda\'amne');
    }
  };

  const passwordStrength = () => {
    const p = form.password;
    if (p.length === 0) return null;
    if (p.length < 6) return { label: 'Laafaa', color: '#ef4444' };
    if (p.length < 10) return { label: 'Jidduu', color: '#f59e0b' };
    return { label: 'Cimaa', color: '#16a34a' };
  };
  const strength = passwordStrength();

  const benefits = [
    'Walaloo, Durdurii fi Asoosama maxxansi',
    'Walitti dhufeenya uumi',
    'Barruu kuusi & simsiir',
  ];

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
        S|B
      </Link>

      <h1
        style={{
          fontSize: '28px',
          fontWeight: 800,
          color: '#08090a',
          marginBottom: '4px',
          textAlign: 'center',
        }}
      >
        Siidaa Barruu Maatii Keenya Makamaa
      </h1>
      <p style={{ color: '#6b7280', fontSize: '15px', marginBottom: '16px', textAlign: 'center' }}>
        Akaawuntii haaraa uumi, bilisaan!
      </p>

      {/* Benefits */}
      <div style={{ marginBottom: '24px' }}>
        {benefits.map((b) => (
          <div key={b} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <div
              style={{
                width: '20px',
                height: '20px',
                borderRadius: '50%',
                backgroundColor: '#dcfce7',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <Check size={12} color="#16a34a" strokeWidth={3} />
            </div>
            <span style={{ fontSize: '14px', color: '#4b5563' }}>{b}</span>
          </div>
        ))}
      </div>

      <div
        style={{
          backgroundColor: '#ffffff',
          border: '1px solid #e5e7eb',
          borderRadius: '12px',
          padding: '32px',
          width: '100%',
          maxWidth: '420px',
        }}
      >
        <form onSubmit={handleSubmit}>
          {[
            { id: 'name', label: 'Maqaa Guutuu', type: 'text', placeholder: 'Oromoo Tolasaa' },
            { id: 'username', label: 'Maqaa Fayyadamaa', type: 'text', placeholder: 'oromoo_tolasaa' },
            { id: 'email', label: 'Email', type: 'email', placeholder: 'email@fkn.com' },
          ].map((field) => (
            <div key={field.id} style={{ marginBottom: '16px' }}>
              <label
                htmlFor={field.id}
                style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: '#08090a', marginBottom: '6px' }}
              >
                {field.label}
              </label>
              <input
                id={field.id}
                name={field.id}
                type={field.type}
                value={form[field.id as keyof typeof form]}
                onChange={handleChange}
                required
                placeholder={field.placeholder}
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
              {field.id === 'username' && form.username && (
                <p style={{ fontSize: '12px', color: '#9ca3af', marginTop: '4px' }}>
                  Fuulli kee: siidaabarruu.com/user/{form.username}
                </p>
              )}
            </div>
          ))}

          {/* Password */}
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
                name="password"
                type={showPassword ? 'text' : 'password'}
                value={form.password}
                onChange={handleChange}
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
            {strength && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '6px' }}>
                <div style={{ flex: 1, height: '4px', backgroundColor: '#f3f4f6', borderRadius: '2px', overflow: 'hidden' }}>
                  <div
                    style={{
                      height: '100%',
                      width: strength.label === 'Laafaa' ? '33%' : strength.label === 'Jidduu' ? '66%' : '100%',
                      backgroundColor: strength.color,
                      borderRadius: '2px',
                      transition: 'width 0.3s, background-color 0.3s',
                    }}
                  />
                </div>
                <span style={{ fontSize: '12px', color: strength.color, fontWeight: 600 }}>{strength.label}</span>
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            style={{
              width: '100%',
              padding: '12px',
              backgroundColor: isLoading ? '#6b7280' : '#3b49df',
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
            {isLoading ? 'Galmaa\'aa...' : 'Akaawuntii Uumi'}
          </button>

          <p style={{ fontSize: '12px', color: '#9ca3af', marginTop: '12px', textAlign: 'center' }}>
            Galmaa&#39;uun kee Seera Fayyadamaa fi Dhuunfaa keenya wajjin waliigaluu kee agarsiisa.
          </p>
        </form>

        <div style={{ textAlign: 'center', marginTop: '20px', fontSize: '14px', color: '#6b7280' }}>
          Dursaa akaawuntii qabdaa?{' '}
          <Link href="/login" style={{ color: '#3b49df', fontWeight: 600, textDecoration: 'none' }}>
            Seeni
          </Link>
        </div>
      </div>
    </div>
  );
}

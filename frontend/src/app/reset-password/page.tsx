'use client';

import { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { api } from '@/lib/api';

function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token') || '';

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      setError('Password tidak sama');
      return;
    }

    if (password.length < 6) {
      setError('Password minimal 6 karakter');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await api.post('/auth/reset-password', { token, newPassword: password });
      setSuccess(true);
    } catch (err: any) {
      setError(err?.message || 'Token tidak valid atau sudah expired');
    }
    setLoading(false);
  };

  if (!token) {
    return (
      <main>
        <header className="navbar">
          <div className="container navbar-inner">
            <Link href="/" className="nav-logo">TokDig</Link>
          </div>
        </header>
        <div className="container" style={{ maxWidth: '440px', padding: '64px 16px' }}>
          <div className="card" style={{ textAlign: 'center' }}>
            <p style={{ fontSize: '32px', marginBottom: '12px' }}>⚠️</p>
            <p>Token reset tidak ditemukan.</p>
            <Link href="/forgot-password" className="btn btn-primary" style={{ marginTop: '16px' }}>
              Minta Link Baru
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main>
      <header className="navbar">
        <div className="container navbar-inner">
          <Link href="/" className="nav-logo">TokDig</Link>
        </div>
      </header>

      <div className="container" style={{ maxWidth: '440px', padding: '64px 16px' }}>
        <div className="card">
          <h1 style={{ fontSize: '22px', fontWeight: 700, marginBottom: '8px' }}>🔑 Reset Password</h1>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '14px', marginBottom: '24px' }}>
            Masukkan password baru Anda.
          </p>

          {success ? (
            <div>
              <div className="alert alert-success" style={{ marginBottom: '16px' }}>
                ✅ Password berhasil diubah! Silakan login dengan password baru.
              </div>
              <Link href="/login" className="btn btn-primary btn-full">Login Sekarang</Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              {error && <div className="alert alert-error" style={{ marginBottom: '16px' }}>{error}</div>}

              <div className="form-group">
                <label className="form-label" htmlFor="rp-password">Password Baru</label>
                <input
                  id="rp-password"
                  type="password"
                  className="form-input"
                  placeholder="Minimal 6 karakter"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="rp-confirm">Konfirmasi Password</label>
                <input
                  id="rp-confirm"
                  type="password"
                  className="form-input"
                  placeholder="Ulangi password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>

              <button
                type="submit"
                className="btn btn-primary btn-full"
                disabled={loading || !password || !confirmPassword}
              >
                {loading ? <><span className="spinner" /> Menyimpan...</> : 'Simpan Password Baru'}
              </button>
            </form>
          )}
        </div>
      </div>
    </main>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
        <div className="spinner spinner-dark" style={{ width: 40, height: 40 }} />
      </div>
    }>
      <ResetPasswordContent />
    </Suspense>
  );
}

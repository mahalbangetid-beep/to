'use client';

import { useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await api.post('/auth/forgot-password', { email });
      setSuccess(true);
    } catch (err: any) {
      setError(err?.message || 'Terjadi kesalahan');
    }
    setLoading(false);
  };

  return (
    <main>
      <header className="navbar">
        <div className="container navbar-inner">
          <Link href="/" className="nav-logo">TokDig</Link>
        </div>
      </header>

      <div className="container" style={{ maxWidth: '440px', padding: '64px 16px' }}>
        <div className="card">
          <h1 style={{ fontSize: '22px', fontWeight: 700, marginBottom: '8px' }}>🔐 Lupa Password</h1>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '14px', marginBottom: '24px' }}>
            Masukkan email akun Anda dan kami akan mengirim link reset password.
          </p>

          {success ? (
            <div>
              <div className="alert alert-success" style={{ marginBottom: '16px' }}>
                ✅ Jika email terdaftar, link reset telah dikirim ke email Anda. Cek inbox atau folder spam.
              </div>
              <Link href="/login" className="btn btn-primary btn-full">Kembali ke Login</Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              {error && <div className="alert alert-error" style={{ marginBottom: '16px' }}>{error}</div>}

              <div className="form-group">
                <label className="form-label" htmlFor="fg-email">Email</label>
                <input
                  id="fg-email"
                  type="email"
                  className="form-input"
                  placeholder="email@contoh.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <button
                type="submit"
                className="btn btn-primary btn-full"
                disabled={loading || !email}
                style={{ marginBottom: '12px' }}
              >
                {loading ? <><span className="spinner" /> Mengirim...</> : 'Kirim Link Reset'}
              </button>

              <div style={{ textAlign: 'center' }}>
                <Link href="/login" style={{ fontSize: '13px', color: 'var(--color-primary)' }}>
                  ← Kembali ke Login
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </main>
  );
}

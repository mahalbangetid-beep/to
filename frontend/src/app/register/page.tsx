'use client';

import { useState, FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { ApiError } from '@/lib/api';

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [agreed, setAgreed] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    // Validations
    if (formData.password.length < 8) {
      setError('Password minimal 8 karakter');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Konfirmasi password tidak cocok');
      return;
    }

    if (!agreed) {
      setError('Anda harus menyetujui syarat dan ketentuan');
      return;
    }

    setLoading(true);

    try {
      await register({
        email: formData.email,
        password: formData.password,
        name: formData.name || undefined,
        phone: formData.phone || undefined,
      });
      router.push('/dashboard');
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('Terjadi kesalahan. Silakan coba lagi.');
      }
    } finally {
      setLoading(false);
    }
  };

  const isFormValid =
    formData.email &&
    formData.password &&
    formData.confirmPassword &&
    agreed;

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="card card-glass">
          <div className="auth-header">
            <div className="auth-logo">TokDig</div>
            <p className="auth-subtitle">
              Buat akun untuk mulai belanja produk digital
            </p>
          </div>

          {error && (
            <div className="alert alert-error" role="alert">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="name" className="form-label">
                Nama Lengkap <span className="text-muted">(opsional)</span>
              </label>
              <input
                id="name"
                name="name"
                type="text"
                className="form-input"
                placeholder="Nama Anda"
                value={formData.name}
                onChange={handleChange}
                autoComplete="name"
                autoFocus
              />
            </div>

            <div className="form-group">
              <label htmlFor="register-email" className="form-label">
                Email
              </label>
              <input
                id="register-email"
                name="email"
                type="email"
                className="form-input"
                placeholder="nama@email.com"
                value={formData.email}
                onChange={handleChange}
                required
                autoComplete="email"
              />
            </div>

            <div className="form-group">
              <label htmlFor="phone" className="form-label">
                Nomor HP <span className="text-muted">(opsional)</span>
              </label>
              <input
                id="phone"
                name="phone"
                type="tel"
                className="form-input"
                placeholder="08xxxxxxxxxx"
                value={formData.phone}
                onChange={handleChange}
                autoComplete="tel"
              />
            </div>

            <div className="form-group">
              <label htmlFor="register-password" className="form-label">
                Password
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  id="register-password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  className="form-input"
                  placeholder="Minimal 8 karakter"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  minLength={8}
                  autoComplete="new-password"
                  style={{ paddingRight: '48px' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    color: 'var(--color-text-muted)',
                    cursor: 'pointer',
                    fontSize: '13px',
                    padding: '4px',
                  }}
                  aria-label={showPassword ? 'Sembunyikan password' : 'Tampilkan password'}
                >
                  {showPassword ? '🙈' : '👁️'}
                </button>
              </div>
              {formData.password && formData.password.length < 8 && (
                <span className="form-error">Minimal 8 karakter</span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword" className="form-label">
                Konfirmasi Password
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                className="form-input"
                placeholder="Ulangi password"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                autoComplete="new-password"
              />
              {formData.confirmPassword &&
                formData.password !== formData.confirmPassword && (
                  <span className="form-error">Password tidak cocok</span>
                )}
            </div>

            <div
              className="form-group"
              style={{
                flexDirection: 'row',
                alignItems: 'flex-start',
                gap: '10px',
              }}
            >
              <input
                id="agree-terms"
                type="checkbox"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                style={{
                  marginTop: '3px',
                  accentColor: 'var(--color-primary)',
                  width: '16px',
                  height: '16px',
                }}
              />
              <label
                htmlFor="agree-terms"
                style={{
                  fontSize: '13px',
                  color: 'var(--color-text-secondary)',
                  cursor: 'pointer',
                  lineHeight: '1.5',
                }}
              >
                Saya setuju dengan{' '}
                <Link href="/terms" style={{ fontWeight: 600 }}>
                  Syarat & Ketentuan
                </Link>{' '}
                dan{' '}
                <Link href="/privacy" style={{ fontWeight: 600 }}>
                  Kebijakan Privasi
                </Link>
              </label>
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-lg btn-full"
              disabled={loading || !isFormValid}
              id="register-submit"
            >
              {loading ? (
                <>
                  <span className="spinner" />
                  Mendaftarkan...
                </>
              ) : (
                'Daftar Sekarang'
              )}
            </button>
          </form>

          <div className="auth-footer">
            Sudah punya akun?{' '}
            <Link href="/login">Masuk di sini</Link>
          </div>
        </div>
      </div>
    </div>
  );
}

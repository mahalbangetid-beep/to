'use client';

import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { api, ApiError } from '@/lib/api';

export default function DashboardSettingsPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'profile' | 'password'>('profile');

  // Profile form
  const [fullName, setFullName] = useState(user?.fullName || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileMsg, setProfileMsg] = useState('');

  // Password form
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordMsg, setPasswordMsg] = useState('');

  const handleProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileLoading(true);
    setProfileMsg('');
    try {
      await api.put('/auth/profile', { name: fullName, phone: phone || undefined });
      setProfileMsg('✅ Profil berhasil diperbarui');
    } catch (err) {
      setProfileMsg(err instanceof ApiError ? `❌ ${err.message}` : '❌ Gagal memperbarui profil');
    } finally {
      setProfileLoading(false);
    }
  };

  const handlePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setPasswordMsg('❌ Password baru tidak cocok');
      return;
    }
    setPasswordLoading(true);
    setPasswordMsg('');
    try {
      await api.put('/auth/password', { currentPassword, newPassword });
      setPasswordMsg('✅ Password berhasil diubah');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setPasswordMsg(err instanceof ApiError ? `❌ ${err.message}` : '❌ Gagal mengubah password');
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <div>
      <h1 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '24px' }}>⚙️ Pengaturan Akun</h1>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '4px', marginBottom: '24px' }}>
        <button
          className={`btn ${activeTab === 'profile' ? 'btn-primary' : 'btn-ghost'} btn-sm`}
          onClick={() => setActiveTab('profile')}
        >
          Profil
        </button>
        <button
          className={`btn ${activeTab === 'password' ? 'btn-primary' : 'btn-ghost'} btn-sm`}
          onClick={() => setActiveTab('password')}
        >
          Password
        </button>
      </div>

      {activeTab === 'profile' ? (
        <div className="card" style={{ maxWidth: '500px' }}>
          <form onSubmit={handleProfile}>
            <div className="form-group">
              <label className="form-label">Email</label>
              <input
                type="email"
                className="form-input"
                value={user?.email || ''}
                disabled
                style={{ opacity: 0.6 }}
              />
              <span className="form-hint">Email tidak dapat diubah</span>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="settings-name">Nama Lengkap</label>
              <input
                id="settings-name"
                type="text"
                className="form-input"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Nama lengkap Anda"
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="settings-phone">No. HP</label>
              <input
                id="settings-phone"
                type="tel"
                className="form-input"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="08xxxxxxxxxx"
              />
            </div>

            {profileMsg && (
              <div style={{ fontSize: '14px', marginBottom: '16px' }}>{profileMsg}</div>
            )}

            <button
              type="submit"
              className="btn btn-primary"
              disabled={profileLoading}
            >
              {profileLoading ? 'Menyimpan...' : 'Simpan Perubahan'}
            </button>
          </form>
        </div>
      ) : (
        <div className="card" style={{ maxWidth: '500px' }}>
          <form onSubmit={handlePassword}>
            <div className="form-group">
              <label className="form-label" htmlFor="current-pw">Password Saat Ini</label>
              <input
                id="current-pw"
                type="password"
                className="form-input"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="new-pw">Password Baru</label>
              <input
                id="new-pw"
                type="password"
                className="form-input"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                minLength={6}
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="confirm-pw">Konfirmasi Password</label>
              <input
                id="confirm-pw"
                type="password"
                className="form-input"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>

            {passwordMsg && (
              <div style={{ fontSize: '14px', marginBottom: '16px' }}>{passwordMsg}</div>
            )}

            <button
              type="submit"
              className="btn btn-primary"
              disabled={passwordLoading}
            >
              {passwordLoading ? 'Mengubah...' : 'Ubah Password'}
            </button>
          </form>
        </div>
      ) }
    </div>
  );
}

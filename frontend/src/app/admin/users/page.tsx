'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';

interface UserRow {
  id: string;
  email: string;
  role: string;
  isActive: boolean;
  emailVerified: boolean;
  createdAt: string;
  profile?: { name: string; phone: string };
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get<any>('/admin/users');
        const data = res?.data || res;
        setUsers(data?.users || []);
      } catch {
        setUsers([]);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const toggleUser = async (userId: string) => {
    setToggling(userId);
    try {
      await api.put(`/admin/users/${userId}/toggle`, {});
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, isActive: !u.isActive } : u)),
      );
    } catch {
      alert('Gagal mengubah status user');
    } finally {
      setToggling(null);
    }
  };

  return (
    <div>
      <h1 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '24px' }}>👥 Kelola Users</h1>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '48px' }}>
          <div className="spinner spinner-dark" style={{ width: 32, height: 32, margin: '0 auto' }} />
        </div>
      ) : users.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '48px' }}>
          <p className="text-muted text-sm">Belum ada user</p>
        </div>
      ) : (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--color-border)', textAlign: 'left' }}>
                <th style={{ padding: '12px 16px', fontWeight: 600, color: 'var(--color-text-muted)' }}>Email</th>
                <th style={{ padding: '12px 16px', fontWeight: 600, color: 'var(--color-text-muted)' }}>Nama</th>
                <th style={{ padding: '12px 16px', fontWeight: 600, color: 'var(--color-text-muted)' }}>Role</th>
                <th style={{ padding: '12px 16px', fontWeight: 600, color: 'var(--color-text-muted)' }}>Status</th>
                <th style={{ padding: '12px 16px', fontWeight: 600, color: 'var(--color-text-muted)' }}>Tgl Daftar</th>
                <th style={{ padding: '12px 16px', fontWeight: 600, color: 'var(--color-text-muted)' }}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ fontWeight: 600 }}>{user.email}</div>
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    {user.profile?.name || '—'}
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <span className={`badge ${user.role === 'admin' || user.role === 'superadmin' ? 'badge-primary' : 'badge-neutral'}`}>
                      {user.role}
                    </span>
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <span className={`badge ${user.isActive ? 'badge-success' : 'badge-danger'}`}>
                      {user.isActive ? 'Aktif' : 'Nonaktif'}
                    </span>
                  </td>
                  <td style={{ padding: '12px 16px', fontSize: '12px', color: 'var(--color-text-muted)' }}>
                    {new Date(user.createdAt).toLocaleDateString('id-ID')}
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <button
                      className={`btn btn-sm ${user.isActive ? 'btn-danger' : 'btn-success'}`}
                      onClick={() => toggleUser(user.id)}
                      disabled={toggling === user.id}
                      style={{ fontSize: '11px' }}
                    >
                      {toggling === user.id ? '...' : (user.isActive ? 'Nonaktifkan' : 'Aktifkan')}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

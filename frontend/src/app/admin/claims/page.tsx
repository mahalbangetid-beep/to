'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';

interface ClaimItem {
  id: string;
  orderId: string;
  type: string;
  description: string | null;
  status: string;
  adminNotes: string | null;
  proofUrls: string[];
  createdAt: string;
  resolvedAt: string | null;
  user: { id: string; email: string } | null;
}

const STATUS_MAP: Record<string, { label: string; cls: string }> = {
  pending: { label: 'Menunggu', cls: 'badge-warning' },
  approved: { label: 'Disetujui', cls: 'badge-primary' },
  rejected: { label: 'Ditolak', cls: '' },
  completed: { label: 'Selesai', cls: 'badge-success' },
};

const TYPE_MAP: Record<string, string> = {
  replacement: '🔄 Ganti',
  error: '⚠️ Error',
  not_received: '📭 Belum Diterima',
};

export default function AdminClaimsPage() {
  const [claims, setClaims] = useState<ClaimItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');

  const fetchClaims = async () => {
    try {
      const params = statusFilter ? `?status=${statusFilter}` : '';
      const res = await api.get<any>(`/admin/claims${params}`);
      const data = res?.data || res;
      setClaims(data?.claims || []);
    } catch { /* skip */ }
    setLoading(false);
  };

  useEffect(() => { fetchClaims(); }, [statusFilter]);

  const handleApprove = async (id: string) => {
    const notes = prompt('Catatan admin (opsional):');
    await api.put(`/admin/claims/${id}/approve`, { notes: notes || undefined });
    fetchClaims();
  };

  const handleReject = async (id: string) => {
    const notes = prompt('Alasan penolakan:');
    if (!notes) return;
    await api.put(`/admin/claims/${id}/reject`, { notes });
    fetchClaims();
  };

  const handleComplete = async (id: string) => {
    await api.put(`/admin/claims/${id}/complete`, {});
    fetchClaims();
  };

  if (loading) {
    return <div style={{ padding: '24px' }}><span className="spinner spinner-dark" /></div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center" style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '22px', fontWeight: 700 }}>🛡️ Klaim & Garansi</h1>
        <select className="form-input" style={{ maxWidth: '180px' }} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="">Semua</option>
          <option value="pending">Menunggu</option>
          <option value="approved">Disetujui</option>
          <option value="rejected">Ditolak</option>
          <option value="completed">Selesai</option>
        </select>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--color-border)', background: 'var(--color-bg-elevated)' }}>
              <th style={{ padding: '12px 16px', textAlign: 'left' }}>User</th>
              <th style={{ padding: '12px 16px', textAlign: 'left' }}>Tipe</th>
              <th style={{ padding: '12px 16px', textAlign: 'left' }}>Deskripsi</th>
              <th style={{ padding: '12px 16px', textAlign: 'center' }}>Bukti</th>
              <th style={{ padding: '12px 16px', textAlign: 'center' }}>Status</th>
              <th style={{ padding: '12px 16px', textAlign: 'right' }}>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {claims.length === 0 && (
              <tr>
                <td colSpan={6} style={{ padding: '32px', textAlign: 'center', color: 'var(--color-text-muted)' }}>
                  Tidak ada klaim
                </td>
              </tr>
            )}
            {claims.map((c) => {
              const st = STATUS_MAP[c.status] || STATUS_MAP.pending;
              return (
                <tr key={c.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                  <td style={{ padding: '12px 16px' }}>{c.user?.email || '—'}</td>
                  <td style={{ padding: '12px 16px' }}>{TYPE_MAP[c.type] || c.type}</td>
                  <td style={{ padding: '12px 16px', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {c.description || '—'}
                  </td>
                  <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                    {c.proofUrls?.length > 0 ? `📎 ${c.proofUrls.length}` : '—'}
                  </td>
                  <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                    <span className={`badge ${st.cls}`}>{st.label}</span>
                  </td>
                  <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: '4px', justifyContent: 'flex-end' }}>
                      {c.status === 'pending' && (
                        <>
                          <button className="btn btn-ghost btn-sm" onClick={() => handleApprove(c.id)} title="Setujui">✅</button>
                          <button className="btn btn-ghost btn-sm" onClick={() => handleReject(c.id)} title="Tolak">❌</button>
                        </>
                      )}
                      {c.status === 'approved' && (
                        <button className="btn btn-ghost btn-sm" onClick={() => handleComplete(c.id)} title="Selesai">🎉</button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

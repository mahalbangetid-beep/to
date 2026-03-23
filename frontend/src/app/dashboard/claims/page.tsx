'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';

interface ClaimItem {
  id: string;
  orderId: string;
  type: string;
  description: string;
  status: string;
  adminNotes: string | null;
  createdAt: string;
  resolvedAt: string | null;
}

const STATUS_MAP: Record<string, { label: string; cls: string }> = {
  pending: { label: 'Menunggu', cls: 'badge-warning' },
  approved: { label: 'Disetujui', cls: 'badge-success' },
  rejected: { label: 'Ditolak', cls: 'badge-danger' },
  completed: { label: 'Selesai', cls: 'badge-success' },
};

export default function DashboardClaimsPage() {
  const [claims, setClaims] = useState<ClaimItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get<{ data: ClaimItem[] }>('/claims/my');
        setClaims((res as any).data || (res as any) || []);
      } catch { /* skip */ }
      setLoading(false);
    })();
  }, []);

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '48px' }}><div className="spinner spinner-dark" style={{ width: 32, height: 32, margin: '0 auto' }} /></div>;
  }

  return (
    <div>
      <h1 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '24px' }}>🛡️ Klaim Saya</h1>

      {claims.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '48px' }}>
          <p style={{ fontSize: '32px', marginBottom: '8px' }}>🛡️</p>
          <p style={{ fontWeight: 600, marginBottom: '4px' }}>Belum ada klaim</p>
          <p className="text-muted text-sm">Ajukan klaim garansi dari halaman detail pesanan</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {claims.map((claim) => {
            const st = STATUS_MAP[claim.status] || STATUS_MAP.pending;
            return (
              <div key={claim.id} className="card">
                <div className="flex justify-between items-center" style={{ marginBottom: '8px' }}>
                  <span className={`badge ${st.cls}`}>{st.label}</span>
                  <span style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>
                    {new Date(claim.createdAt).toLocaleDateString('id-ID')}
                  </span>
                </div>
                <p style={{ fontSize: '14px', marginBottom: '8px' }}>{claim.description}</p>
                <div style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>
                  Tipe: <span style={{ textTransform: 'capitalize' }}>{claim.type}</span>
                </div>
                {claim.adminNotes && (
                  <div style={{ marginTop: '8px', padding: '10px', background: 'var(--color-bg-elevated)', borderRadius: 'var(--radius-sm)', fontSize: '13px' }}>
                    <span style={{ fontWeight: 600, fontSize: '12px' }}>💬 Catatan Admin:</span>
                    <p style={{ marginTop: '4px' }}>{claim.adminNotes}</p>
                  </div>
                )}
                {claim.resolvedAt && (
                  <p style={{ fontSize: '11px', color: 'var(--color-text-muted)', marginTop: '8px' }}>
                    Ditangani: {new Date(claim.resolvedAt).toLocaleString('id-ID')}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

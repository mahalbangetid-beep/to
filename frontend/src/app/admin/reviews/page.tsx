'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';

interface ReviewItem {
  id: string;
  rating: number;
  comment: string | null;
  isApproved: boolean;
  isFeatured: boolean;
  createdAt: string;
  user: { id: string; email: string } | null;
  product: { id: string; name: string } | null;
}

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');

  const fetchReviews = async () => {
    try {
      const params = filter !== 'all' ? `?approved=${filter}` : '';
      const res = await api.get<any>(`/admin/reviews${params}`);
      const data = res?.data || res;
      setReviews(data?.reviews || []);
    } catch { /* skip */ }
    setLoading(false);
  };

  useEffect(() => { fetchReviews(); }, [filter]);

  const handleApprove = async (id: string) => {
    await api.put(`/admin/reviews/${id}/approve`, {});
    fetchReviews();
  };

  const handleFeatured = async (id: string) => {
    await api.put(`/admin/reviews/${id}/featured`, {});
    fetchReviews();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Hapus review ini?')) return;
    await api.delete(`/admin/reviews/${id}`);
    fetchReviews();
  };

  const renderStars = (rating: number) => {
    return '★'.repeat(rating) + '☆'.repeat(5 - rating);
  };

  if (loading) {
    return <div style={{ padding: '24px' }}><span className="spinner spinner-dark" /></div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center" style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '22px', fontWeight: 700 }}>⭐ Review & Rating</h1>
        <select className="form-input" style={{ maxWidth: '180px' }} value={filter} onChange={(e) => setFilter(e.target.value)}>
          <option value="all">Semua</option>
          <option value="false">Belum Disetujui</option>
          <option value="true">Disetujui</option>
        </select>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--color-border)', background: 'var(--color-bg-elevated)' }}>
              <th style={{ padding: '12px 16px', textAlign: 'left' }}>User</th>
              <th style={{ padding: '12px 16px', textAlign: 'left' }}>Produk</th>
              <th style={{ padding: '12px 16px', textAlign: 'center' }}>Rating</th>
              <th style={{ padding: '12px 16px', textAlign: 'left' }}>Komentar</th>
              <th style={{ padding: '12px 16px', textAlign: 'center' }}>Status</th>
              <th style={{ padding: '12px 16px', textAlign: 'right' }}>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {reviews.length === 0 && (
              <tr>
                <td colSpan={6} style={{ padding: '32px', textAlign: 'center', color: 'var(--color-text-muted)' }}>
                  Belum ada review
                </td>
              </tr>
            )}
            {reviews.map((r) => (
              <tr key={r.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                <td style={{ padding: '12px 16px' }}>{r.user?.email || '—'}</td>
                <td style={{ padding: '12px 16px' }}>{r.product?.name || '—'}</td>
                <td style={{ padding: '12px 16px', textAlign: 'center', color: '#f59e0b' }}>
                  {renderStars(r.rating)}
                </td>
                <td style={{ padding: '12px 16px', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {r.comment || '—'}
                </td>
                <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                  <div style={{ display: 'flex', gap: '4px', justifyContent: 'center' }}>
                    <span className={`badge ${r.isApproved ? 'badge-primary' : ''}`}>
                      {r.isApproved ? '✅' : '⏳'}
                    </span>
                    {r.isFeatured && <span className="badge badge-warning">⭐</span>}
                  </div>
                </td>
                <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                  <div style={{ display: 'flex', gap: '4px', justifyContent: 'flex-end' }}>
                    {!r.isApproved && (
                      <button className="btn btn-ghost btn-sm" onClick={() => handleApprove(r.id)} title="Approve">✅</button>
                    )}
                    <button className="btn btn-ghost btn-sm" onClick={() => handleFeatured(r.id)} title="Toggle Featured">
                      {r.isFeatured ? '⭐' : '☆'}
                    </button>
                    <button className="btn btn-ghost btn-sm" onClick={() => handleDelete(r.id)} title="Hapus">🗑️</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

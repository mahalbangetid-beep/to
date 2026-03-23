'use client';

import { useState, useEffect, useCallback } from 'react';
import { api } from '@/lib/api';

interface FulfillmentItem {
  id: string;
  orderId: string;
  orderItemId: string;
  type: string;
  status: string;
  processedBy: string | null;
  deliveryContent: Record<string, any> | null;
  notes: string | null;
  completedAt: string | null;
  createdAt: string;
}

const STATUS_MAP: Record<string, { label: string; cls: string }> = {
  pending: { label: 'Pending', cls: 'badge-warning' },
  processing: { label: 'Diproses', cls: 'badge-primary' },
  completed: { label: 'Dikirim', cls: 'badge-success' },
};

export default function AdminFulfillmentsPage() {
  const [items, setItems] = useState<FulfillmentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Input fields per fulfillment
  const [contentInputs, setContentInputs] = useState<Record<string, string>>({});
  const [notesInputs, setNotesInputs] = useState<Record<string, string>>({});
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [msg, setMsg] = useState('');

  const fetchData = useCallback(async () => {
    try {
      const params = statusFilter ? `?status=${statusFilter}` : '';
      const res = await api.get<{ data: { fulfillments: FulfillmentItem[] } }>(`/fulfillments${params}`);
      setItems((res as any).data?.fulfillments || (res as any).fulfillments || []);
    } catch { setItems([]); }
    setLoading(false);
  }, [statusFilter]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleAssign = async (id: string) => {
    setActionLoading(id);
    try {
      await api.put(`/fulfillments/${id}/assign`, {});
      setMsg('✅ Berhasil di-assign');
      fetchData();
    } catch { setMsg('❌ Gagal assign'); }
    setActionLoading(null);
  };

  const handleSaveContent = async (id: string) => {
    setActionLoading(id);
    try {
      const rawContent = contentInputs[id] || '{}';
      const content = JSON.parse(rawContent);
      await api.put(`/fulfillments/${id}/content`, {
        content,
        notes: notesInputs[id] || undefined,
      });
      setMsg('✅ Konten tersimpan');
      fetchData();
    } catch (err: any) {
      setMsg(`❌ ${err?.message || 'Gagal simpan. Pastikan format JSON valid.'}`);
    }
    setActionLoading(null);
  };

  const handleDeliver = async (id: string) => {
    if (!confirm('Kirim delivery sekarang? Pesanan akan ditandai selesai.')) return;
    setActionLoading(id);
    try {
      await api.put(`/fulfillments/${id}/deliver`, {});
      setMsg('✅ Delivery berhasil dikirim!');
      fetchData();
    } catch { setMsg('❌ Gagal mengirim delivery'); }
    setActionLoading(null);
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h1 style={{ fontSize: '20px', fontWeight: 700 }}>📦 Fulfillment Queue</h1>
        <select className="catalog-sort" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="">Semua</option>
          <option value="pending">Pending</option>
          <option value="processing">Diproses</option>
          <option value="completed">Dikirim</option>
        </select>
      </div>

      {msg && (
        <div className="card" style={{ marginBottom: '16px', padding: '10px 16px', fontSize: '13px' }}>
          {msg}
          <button className="btn btn-ghost btn-sm" onClick={() => setMsg('')} style={{ marginLeft: '8px' }}>×</button>
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: 'center', padding: '48px' }}><div className="spinner spinner-dark" style={{ width: 32, height: 32, margin: '0 auto' }} /></div>
      ) : items.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '48px' }}>
          <p style={{ fontSize: '32px', marginBottom: '8px' }}>🎉</p>
          <p style={{ fontWeight: 600 }}>Tidak ada fulfillment pending</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {items.map((item) => {
            const st = STATUS_MAP[item.status] || STATUS_MAP.pending;
            const isExpanded = expandedId === item.id;

            return (
              <div key={item.id} className="card">
                <div
                  style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}
                  onClick={() => setExpandedId(isExpanded ? null : item.id)}
                >
                  <div>
                    <span className={`badge ${st.cls}`} style={{ marginRight: '8px' }}>{st.label}</span>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '12px' }}>
                      Order: {item.orderId.slice(0, 8)}...
                    </span>
                    <span style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginLeft: '8px' }}>
                      {item.type}
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>
                      {new Date(item.createdAt).toLocaleDateString('id-ID')}
                    </span>
                    <span>{isExpanded ? '▲' : '▼'}</span>
                  </div>
                </div>

                {isExpanded && (
                  <div style={{ marginTop: '16px', borderTop: '1px solid var(--color-border)', paddingTop: '16px' }}>
                    {/* Info */}
                    <div style={{ fontSize: '13px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '16px' }}>
                      <div><span className="text-muted">ID:</span> <code>{item.id.slice(0, 12)}</code></div>
                      <div><span className="text-muted">Order ID:</span> <code>{item.orderId.slice(0, 12)}</code></div>
                      <div><span className="text-muted">Tipe:</span> {item.type}</div>
                      <div><span className="text-muted">Assigned:</span> {item.processedBy ? item.processedBy.slice(0, 8) : '—'}</div>
                    </div>

                    {/* Current delivery content */}
                    {item.deliveryContent && (
                      <div style={{ marginBottom: '16px', padding: '12px', background: 'var(--color-bg-elevated)', borderRadius: 'var(--radius-sm)', fontFamily: 'var(--font-mono)', fontSize: '12px' }}>
                        <div style={{ fontWeight: 600, marginBottom: '4px', fontSize: '11px', color: 'var(--color-text-muted)' }}>KONTEN DELIVERY:</div>
                        <pre style={{ whiteSpace: 'pre-wrap', margin: 0 }}>{JSON.stringify(item.deliveryContent, null, 2)}</pre>
                      </div>
                    )}

                    {item.notes && (
                      <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', marginBottom: '12px' }}>📝 {item.notes}</p>
                    )}

                    {/* Action buttons */}
                    {item.status !== 'completed' && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {item.status === 'pending' && (
                          <button
                            className="btn btn-primary btn-sm"
                            onClick={() => handleAssign(item.id)}
                            disabled={actionLoading === item.id}
                          >
                            {actionLoading === item.id ? '⏳...' : '👤 Assign ke Saya'}
                          </button>
                        )}

                        {/* Content input */}
                        <div>
                          <label style={{ fontSize: '12px', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
                            Konten Delivery (JSON)
                          </label>
                          <textarea
                            className="form-input"
                            rows={4}
                            placeholder='{"email": "user@mail.com", "password": "xxx"}'
                            value={contentInputs[item.id] || ''}
                            onChange={(e) => setContentInputs({ ...contentInputs, [item.id]: e.target.value })}
                            style={{ fontFamily: 'var(--font-mono)', fontSize: '12px' }}
                          />
                        </div>
                        <div>
                          <label style={{ fontSize: '12px', fontWeight: 600, display: 'block', marginBottom: '4px' }}>Catatan (opsional)</label>
                          <input
                            className="form-input"
                            placeholder="Catatan internal..."
                            value={notesInputs[item.id] || ''}
                            onChange={(e) => setNotesInputs({ ...notesInputs, [item.id]: e.target.value })}
                          />
                        </div>

                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button
                            className="btn btn-secondary btn-sm"
                            onClick={() => handleSaveContent(item.id)}
                            disabled={actionLoading === item.id}
                          >
                            {actionLoading === item.id ? '⏳...' : '💾 Simpan Konten'}
                          </button>
                          <button
                            className="btn btn-primary btn-sm"
                            onClick={() => handleDeliver(item.id)}
                            disabled={actionLoading === item.id || !item.deliveryContent}
                          >
                            {actionLoading === item.id ? '⏳...' : '🚀 Kirim Delivery'}
                          </button>
                        </div>
                      </div>
                    )}

                    {item.status === 'completed' && item.completedAt && (
                      <p style={{ fontSize: '12px', color: 'var(--color-secondary)' }}>
                        ✅ Dikirim pada {new Date(item.completedAt).toLocaleString('id-ID')}
                      </p>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

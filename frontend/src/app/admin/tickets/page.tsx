'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';

interface TicketItem {
  id: string;
  ticketNumber: string;
  subject: string;
  category: string | null;
  status: string;
  priority: string;
  assignedTo: string | null;
  createdAt: string;
  user: { id: string; email: string } | null;
}

const STATUS_MAP: Record<string, { label: string; cls: string }> = {
  open: { label: 'Open', cls: 'badge-warning' },
  processing: { label: 'Proses', cls: 'badge-primary' },
  resolved: { label: 'Selesai', cls: 'badge-success' },
  closed: { label: 'Ditutup', cls: '' },
};

const PRIORITY_MAP: Record<string, { label: string; color: string }> = {
  low: { label: 'Low', color: 'var(--color-text-muted)' },
  medium: { label: 'Medium', color: '#f59e0b' },
  high: { label: 'High', color: '#ef4444' },
  urgent: { label: 'Urgent', color: '#dc2626' },
};

export default function AdminTicketsPage() {
  const [tickets, setTickets] = useState<TicketItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');

  const fetchTickets = async () => {
    try {
      const params = statusFilter ? `?status=${statusFilter}` : '';
      const res = await api.get<any>(`/admin/tickets${params}`);
      const data = res?.data || res;
      setTickets(data?.tickets || []);
    } catch { /* skip */ }
    setLoading(false);
  };

  useEffect(() => { fetchTickets(); }, [statusFilter]);

  const handleAssign = async (id: string) => {
    await api.put(`/admin/tickets/${id}/assign`, {});
    fetchTickets();
  };

  const handleStatus = async (id: string, status: string) => {
    await api.put(`/admin/tickets/${id}/status`, { status });
    fetchTickets();
  };

  if (loading) {
    return <div style={{ padding: '24px' }}><span className="spinner spinner-dark" /></div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center" style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '22px', fontWeight: 700 }}>🎫 Tiket Support</h1>
        <select className="form-input" style={{ maxWidth: '180px' }} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="">Semua</option>
          <option value="open">Open</option>
          <option value="processing">Proses</option>
          <option value="resolved">Selesai</option>
          <option value="closed">Ditutup</option>
        </select>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--color-border)', background: 'var(--color-bg-elevated)' }}>
              <th style={{ padding: '12px 16px', textAlign: 'left' }}>No. Tiket</th>
              <th style={{ padding: '12px 16px', textAlign: 'left' }}>User</th>
              <th style={{ padding: '12px 16px', textAlign: 'left' }}>Subject</th>
              <th style={{ padding: '12px 16px', textAlign: 'center' }}>Prioritas</th>
              <th style={{ padding: '12px 16px', textAlign: 'center' }}>Status</th>
              <th style={{ padding: '12px 16px', textAlign: 'right' }}>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {tickets.length === 0 && (
              <tr>
                <td colSpan={6} style={{ padding: '32px', textAlign: 'center', color: 'var(--color-text-muted)' }}>
                  Tidak ada tiket
                </td>
              </tr>
            )}
            {tickets.map((t) => {
              const st = STATUS_MAP[t.status] || STATUS_MAP.open;
              const pr = PRIORITY_MAP[t.priority] || PRIORITY_MAP.medium;
              return (
                <tr key={t.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                  <td style={{ padding: '12px 16px' }}>
                    <code style={{ background: 'var(--color-bg-elevated)', padding: '2px 6px', borderRadius: '4px', fontSize: '12px' }}>{t.ticketNumber}</code>
                  </td>
                  <td style={{ padding: '12px 16px' }}>{t.user?.email || '—'}</td>
                  <td style={{ padding: '12px 16px', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {t.subject}
                  </td>
                  <td style={{ padding: '12px 16px', textAlign: 'center', fontWeight: 600, color: pr.color }}>
                    {pr.label}
                  </td>
                  <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                    <span className={`badge ${st.cls}`}>{st.label}</span>
                  </td>
                  <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: '4px', justifyContent: 'flex-end' }}>
                      {!t.assignedTo && (
                        <button className="btn btn-ghost btn-sm" onClick={() => handleAssign(t.id)} title="Ambil Tiket">🙋</button>
                      )}
                      {t.status === 'open' && (
                        <button className="btn btn-ghost btn-sm" onClick={() => handleStatus(t.id, 'processing')} title="Proses">▶️</button>
                      )}
                      {t.status === 'processing' && (
                        <button className="btn btn-ghost btn-sm" onClick={() => handleStatus(t.id, 'resolved')} title="Selesai">✅</button>
                      )}
                      {t.status !== 'closed' && (
                        <button className="btn btn-ghost btn-sm" onClick={() => handleStatus(t.id, 'closed')} title="Tutup">🔒</button>
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

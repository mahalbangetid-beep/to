'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';

interface UserTicket {
  id: string;
  ticketNumber: string;
  subject: string;
  category: string | null;
  status: string;
  priority: string;
  message: string;
  createdAt: string;
  updatedAt: string;
}

const STATUS_LABEL: Record<string, string> = {
  open: '🟡 Menunggu',
  processing: '🔵 Diproses',
  resolved: '🟢 Selesai',
  closed: '⚫ Ditutup',
};

export default function DashboardSupportPage() {
  const [tickets, setTickets] = useState<UserTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [error, setError] = useState('');

  const [subject, setSubject] = useState('');
  const [category, setCategory] = useState('');
  const [message, setMessage] = useState('');

  const fetchTickets = async () => {
    try {
      const res = await api.get<any>('/tickets');
      const data = res?.data || res;
      setTickets(data?.tickets || []);
    } catch { /* skip */ }
    setLoading(false);
  };

  useEffect(() => { fetchTickets(); }, []);

  const handleSubmit = async () => {
    if (!subject || !message) {
      setError('Subject dan pesan wajib diisi');
      return;
    }
    setFormLoading(true);
    setError('');
    try {
      await api.post('/tickets', {
        subject,
        category: category || undefined,
        message,
      });
      setSubject('');
      setCategory('');
      setMessage('');
      setShowForm(false);
      fetchTickets();
    } catch (err: any) {
      setError(err?.message || 'Gagal mengirim tiket');
    }
    setFormLoading(false);
  };

  if (loading) {
    return <div style={{ padding: '24px' }}><span className="spinner spinner-dark" /></div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center" style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '22px', fontWeight: 700 }}>📩 Bantuan & Support</h1>
        <button className="btn btn-primary btn-sm" onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Tutup' : '+ Buat Tiket'}
        </button>
      </div>

      {/* Create form */}
      {showForm && (
        <div className="card" style={{ marginBottom: '24px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '16px' }}>Buat Tiket Baru</h3>
          {error && <div className="alert alert-error" style={{ marginBottom: '12px' }}>{error}</div>}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div className="form-group">
              <label className="form-label">Subject *</label>
              <input className="form-input" value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Masalah pembayaran..." />
            </div>
            <div className="form-group">
              <label className="form-label">Kategori</label>
              <select className="form-input" value={category} onChange={(e) => setCategory(e.target.value)}>
                <option value="">Pilih kategori</option>
                <option value="payment">💳 Pembayaran</option>
                <option value="product">📦 Produk</option>
                <option value="error">⚠️ Error/Bug</option>
                <option value="other">💬 Lainnya</option>
              </select>
            </div>
            <div className="form-group" style={{ gridColumn: 'span 2' }}>
              <label className="form-label">Pesan *</label>
              <textarea className="form-input" rows={4} value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Jelaskan masalah Anda secara detail..." />
            </div>
          </div>

          <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
            <button className="btn btn-primary btn-sm" onClick={handleSubmit} disabled={formLoading}>
              {formLoading ? '⏳ Mengirim...' : '📨 Kirim Tiket'}
            </button>
            <button className="btn btn-ghost btn-sm" onClick={() => setShowForm(false)}>Batal</button>
          </div>
        </div>
      )}

      {/* Ticket list */}
      {tickets.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '48px' }}>
          <p style={{ fontSize: '32px', marginBottom: '8px' }}>📩</p>
          <p style={{ color: 'var(--color-text-muted)' }}>Belum ada tiket support</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {tickets.map((t) => (
            <div key={t.id} className="card" style={{ padding: '16px 20px' }}>
              <div className="flex justify-between items-center" style={{ marginBottom: '8px' }}>
                <div>
                  <code style={{ fontSize: '11px', background: 'var(--color-bg-elevated)', padding: '2px 6px', borderRadius: '4px', marginRight: '8px' }}>
                    {t.ticketNumber}
                  </code>
                  <span style={{ fontWeight: 600 }}>{t.subject}</span>
                </div>
                <span style={{ fontSize: '13px' }}>
                  {STATUS_LABEL[t.status] || t.status}
                </span>
              </div>
              <p style={{ fontSize: '13px', color: 'var(--color-text-muted)', lineHeight: '1.5' }}>
                {t.message.length > 150 ? t.message.slice(0, 150) + '...' : t.message}
              </p>
              <p style={{ fontSize: '11px', color: 'var(--color-text-muted)', marginTop: '8px' }}>
                {new Date(t.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { formatPrice } from '@/lib/utils';

interface PromoCode {
  id: string;
  code: string;
  discountType: string;
  discountValue: number;
  minPurchase: number;
  maxDiscount: number | null;
  usageLimit: number | null;
  usedCount: number;
  perUserLimit: number;
  applicableProducts: string[] | null;
  startDate: string | null;
  expiryDate: string | null;
  isActive: boolean;
  createdAt: string;
}

export default function AdminPromoPage() {
  const [promos, setPromos] = useState<PromoCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);

  // Form state
  const [code, setCode] = useState('');
  const [discountType, setDiscountType] = useState('percentage');
  const [discountValue, setDiscountValue] = useState(0);
  const [minPurchase, setMinPurchase] = useState(0);
  const [maxDiscount, setMaxDiscount] = useState<number | undefined>();
  const [usageLimit, setUsageLimit] = useState<number | undefined>();
  const [expiryDate, setExpiryDate] = useState('');

  const fetchPromos = async () => {
    try {
      const res = await api.get<any>('/admin/promo');
      setPromos(res?.data || res || []);
    } catch { /* skip */ }
    setLoading(false);
  };

  useEffect(() => { fetchPromos(); }, []);

  const resetForm = () => {
    setCode('');
    setDiscountType('percentage');
    setDiscountValue(0);
    setMinPurchase(0);
    setMaxDiscount(undefined);
    setUsageLimit(undefined);
    setExpiryDate('');
    setEditId(null);
    setShowForm(false);
  };

  const handleSubmit = async () => {
    const body: any = {
      code,
      discountType,
      discountValue,
      minPurchase,
      maxDiscount: maxDiscount || null,
      usageLimit: usageLimit || null,
      expiryDate: expiryDate || null,
    };

    try {
      if (editId) {
        await api.put(`/admin/promo/${editId}`, body);
      } else {
        await api.post('/admin/promo', body);
      }
      resetForm();
      fetchPromos();
    } catch (err: any) {
      alert(err?.message || 'Gagal menyimpan promo');
    }
  };

  const handleEdit = (p: PromoCode) => {
    setEditId(p.id);
    setCode(p.code);
    setDiscountType(p.discountType);
    setDiscountValue(Number(p.discountValue));
    setMinPurchase(Number(p.minPurchase));
    setMaxDiscount(p.maxDiscount ? Number(p.maxDiscount) : undefined);
    setUsageLimit(p.usageLimit || undefined);
    setExpiryDate(p.expiryDate ? p.expiryDate.split('T')[0] : '');
    setShowForm(true);
  };

  const handleToggle = async (id: string) => {
    await api.put(`/admin/promo/${id}/toggle`, {});
    fetchPromos();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Hapus promo ini?')) return;
    await api.delete(`/admin/promo/${id}`);
    fetchPromos();
  };

  if (loading) {
    return <div style={{ padding: '24px' }}><span className="spinner spinner-dark" /></div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center" style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '22px', fontWeight: 700 }}>🎫 Promo Management</h1>
        <button
          className="btn btn-primary btn-sm"
          onClick={() => { resetForm(); setShowForm(!showForm); }}
        >
          {showForm ? 'Tutup' : '+ Buat Promo'}
        </button>
      </div>

      {/* ─── Form ─── */}
      {showForm && (
        <div className="card" style={{ marginBottom: '24px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '16px' }}>
            {editId ? 'Edit Promo' : 'Buat Promo Baru'}
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div className="form-group">
              <label className="form-label">Kode Promo *</label>
              <input
                className="form-input"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="PROMO50"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Tipe Diskon *</label>
              <select
                className="form-input"
                value={discountType}
                onChange={(e) => setDiscountType(e.target.value)}
              >
                <option value="percentage">Persentase (%)</option>
                <option value="fixed">Nominal (Rp)</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">
                Nilai Diskon * {discountType === 'percentage' ? '(%)' : '(Rp)'}
              </label>
              <input
                type="number"
                className="form-input"
                value={discountValue}
                onChange={(e) => setDiscountValue(Number(e.target.value))}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Minimal Pembelian (Rp)</label>
              <input
                type="number"
                className="form-input"
                value={minPurchase}
                onChange={(e) => setMinPurchase(Number(e.target.value))}
              />
            </div>

            {discountType === 'percentage' && (
              <div className="form-group">
                <label className="form-label">Max Diskon (Rp)</label>
                <input
                  type="number"
                  className="form-input"
                  value={maxDiscount || ''}
                  onChange={(e) => setMaxDiscount(e.target.value ? Number(e.target.value) : undefined)}
                  placeholder="Tanpa batas"
                />
              </div>
            )}

            <div className="form-group">
              <label className="form-label">Batas Penggunaan</label>
              <input
                type="number"
                className="form-input"
                value={usageLimit || ''}
                onChange={(e) => setUsageLimit(e.target.value ? Number(e.target.value) : undefined)}
                placeholder="Tanpa batas"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Tanggal Expired</label>
              <input
                type="date"
                className="form-input"
                value={expiryDate}
                onChange={(e) => setExpiryDate(e.target.value)}
              />
            </div>
          </div>

          <div style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
            <button className="btn btn-primary btn-sm" onClick={handleSubmit}>
              {editId ? 'Update' : 'Simpan'}
            </button>
            <button className="btn btn-ghost btn-sm" onClick={resetForm}>Batal</button>
          </div>
        </div>
      )}

      {/* ─── Table ─── */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--color-border)', background: 'var(--color-bg-elevated)' }}>
              <th style={{ padding: '12px 16px', textAlign: 'left' }}>Kode</th>
              <th style={{ padding: '12px 16px', textAlign: 'left' }}>Diskon</th>
              <th style={{ padding: '12px 16px', textAlign: 'left' }}>Min. Pembelian</th>
              <th style={{ padding: '12px 16px', textAlign: 'center' }}>Penggunaan</th>
              <th style={{ padding: '12px 16px', textAlign: 'left' }}>Expired</th>
              <th style={{ padding: '12px 16px', textAlign: 'center' }}>Status</th>
              <th style={{ padding: '12px 16px', textAlign: 'right' }}>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {promos.length === 0 && (
              <tr>
                <td colSpan={7} style={{ padding: '32px', textAlign: 'center', color: 'var(--color-text-muted)' }}>
                  Belum ada promo
                </td>
              </tr>
            )}
            {promos.map((p) => (
              <tr key={p.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                <td style={{ padding: '12px 16px' }}>
                  <code style={{ background: 'var(--color-bg-elevated)', padding: '2px 8px', borderRadius: '4px', fontWeight: 600 }}>
                    {p.code}
                  </code>
                </td>
                <td style={{ padding: '12px 16px' }}>
                  {p.discountType === 'percentage'
                    ? `${p.discountValue}%${p.maxDiscount ? ` (max ${formatPrice(Number(p.maxDiscount))})` : ''}`
                    : formatPrice(Number(p.discountValue))}
                </td>
                <td style={{ padding: '12px 16px' }}>
                  {Number(p.minPurchase) > 0 ? formatPrice(Number(p.minPurchase)) : '-'}
                </td>
                <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                  {p.usedCount}{p.usageLimit ? ` / ${p.usageLimit}` : ''}
                </td>
                <td style={{ padding: '12px 16px' }}>
                  {p.expiryDate
                    ? new Date(p.expiryDate).toLocaleDateString('id-ID')
                    : 'Tanpa batas'}
                </td>
                <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                  <span
                    className={`badge ${p.isActive ? 'badge-primary' : ''}`}
                    style={!p.isActive ? { background: 'rgba(255,255,255,0.05)' } : {}}
                  >
                    {p.isActive ? 'Aktif' : 'Nonaktif'}
                  </span>
                </td>
                <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                  <div style={{ display: 'flex', gap: '4px', justifyContent: 'flex-end' }}>
                    <button className="btn btn-ghost btn-sm" onClick={() => handleEdit(p)}>✏️</button>
                    <button className="btn btn-ghost btn-sm" onClick={() => handleToggle(p.id)}>
                      {p.isActive ? '⏸️' : '▶️'}
                    </button>
                    <button className="btn btn-ghost btn-sm" onClick={() => handleDelete(p.id)}>🗑️</button>
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

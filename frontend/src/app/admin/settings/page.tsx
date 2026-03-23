'use client';

import { useState } from 'react';

interface SettingGroup {
  title: string;
  icon: string;
  settings: { key: string; label: string; type: string; value: string; hint?: string }[];
}

export default function AdminSettingsPage() {
  const [saved, setSaved] = useState(false);

  const groups: SettingGroup[] = [
    {
      title: 'Toko',
      icon: '🏪',
      settings: [
        { key: 'store_name', label: 'Nama Toko', type: 'text', value: 'TokDig', hint: 'Nama yang ditampilkan di header dan email' },
        { key: 'store_description', label: 'Deskripsi', type: 'textarea', value: 'Toko produk digital terlengkap dan terpercaya' },
        { key: 'store_email', label: 'Email Support', type: 'email', value: 'support@tokdig.com' },
        { key: 'store_whatsapp', label: 'WhatsApp', type: 'text', value: '6281234567890', hint: 'Format: 628xxx' },
      ],
    },
    {
      title: 'Pembayaran',
      icon: '💳',
      settings: [
        { key: 'payment_midtrans_server', label: 'Midtrans Server Key', type: 'password', value: '***', hint: 'Server key dari dashboard Midtrans' },
        { key: 'payment_midtrans_client', label: 'Midtrans Client Key', type: 'text', value: '', hint: 'Client key untuk Snap.js' },
        { key: 'payment_expiry_hours', label: 'Waktu Expired (jam)', type: 'number', value: '24', hint: 'Default 24 jam' },
      ],
    },
    {
      title: 'Notifikasi',
      icon: '🔔',
      settings: [
        { key: 'notif_email_enabled', label: 'Email Notifikasi', type: 'toggle', value: 'true' },
        { key: 'notif_whatsapp_enabled', label: 'WhatsApp Notifikasi', type: 'toggle', value: 'false' },
        { key: 'notif_admin_order', label: 'Email Admin per Order', type: 'toggle', value: 'true' },
      ],
    },
    {
      title: 'SEO & Lainnya',
      icon: '🌐',
      settings: [
        { key: 'seo_title', label: 'Meta Title', type: 'text', value: 'TokDig — Toko Digital Terpercaya' },
        { key: 'seo_description', label: 'Meta Description', type: 'textarea', value: 'Beli produk digital premium dengan harga terjangkau' },
        { key: 'maintenance_mode', label: 'Mode Maintenance', type: 'toggle', value: 'false', hint: 'Aktifkan untuk menonaktifkan toko sementara' },
      ],
    },
  ];

  const [values, setValues] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {};
    groups.forEach((g) => g.settings.forEach((s) => { initial[s.key] = s.value; }));
    return initial;
  });

  const handleSave = () => {
    // In production: POST to /api/admin/settings
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div>
      <div className="flex justify-between items-center" style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '22px', fontWeight: 700 }}>⚙️ Pengaturan</h1>
        <button className="btn btn-primary" onClick={handleSave}>
          {saved ? '✅ Tersimpan!' : '💾 Simpan Perubahan'}
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {groups.map((group) => (
          <div key={group.title} className="card">
            <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '20px' }}>
              {group.icon} {group.title}
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {group.settings.map((setting) => (
                <div key={setting.key} className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">{setting.label}</label>
                  {setting.type === 'textarea' ? (
                    <textarea
                      className="form-input"
                      rows={2}
                      value={values[setting.key] || ''}
                      onChange={(e) => setValues({ ...values, [setting.key]: e.target.value })}
                    />
                  ) : setting.type === 'toggle' ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <button
                        type="button"
                        onClick={() => setValues({ ...values, [setting.key]: values[setting.key] === 'true' ? 'false' : 'true' })}
                        style={{
                          width: '44px', height: '24px', borderRadius: '12px', border: 'none', cursor: 'pointer',
                          background: values[setting.key] === 'true' ? 'var(--color-primary)' : 'var(--color-bg-elevated)',
                          position: 'relative', transition: 'background 0.2s',
                        }}
                      >
                        <span style={{
                          display: 'block', width: '18px', height: '18px', borderRadius: '50%', background: '#fff',
                          position: 'absolute', top: '3px',
                          left: values[setting.key] === 'true' ? '23px' : '3px',
                          transition: 'left 0.2s',
                          boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                        }} />
                      </button>
                      <span style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>
                        {values[setting.key] === 'true' ? 'Aktif' : 'Nonaktif'}
                      </span>
                    </div>
                  ) : (
                    <input
                      type={setting.type}
                      className="form-input"
                      value={values[setting.key] || ''}
                      onChange={(e) => setValues({ ...values, [setting.key]: e.target.value })}
                    />
                  )}
                  {setting.hint && <span className="form-hint">{setting.hint}</span>}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';

interface AuditLogEntry {
  id: string;
  userId: string | null;
  action: string;
  entityType: string | null;
  entityId: string | null;
  oldData: Record<string, unknown> | null;
  newData: Record<string, unknown> | null;
  ipAddress: string | null;
  createdAt: string;
}

const ACTION_ICONS: Record<string, string> = {
  'order.created': '📦',
  'order.paid': '💰',
  'order.expired': '⏰',
  'order.failed': '❌',
  'product.created': '🏷️',
  'product.updated': '✏️',
  'user.login': '🔐',
  'user.register': '👤',
};

export default function AdminAuditPage() {
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [entityTypeFilter, setEntityTypeFilter] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const fetchLogs = async () => {
    try {
      const params = entityTypeFilter ? `?entityType=${entityTypeFilter}` : '';
      const res = await api.get<any>(`/admin/audit-logs${params}`);
      const data = res?.data || res;
      setLogs(data?.logs || []);
    } catch { /* skip */ }
    setLoading(false);
  };

  useEffect(() => { fetchLogs(); }, [entityTypeFilter]);

  if (loading) {
    return <div style={{ padding: '24px' }}><span className="spinner spinner-dark" /></div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center" style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '22px', fontWeight: 700 }}>📋 Audit Log</h1>
        <select className="form-input" style={{ maxWidth: '180px' }} value={entityTypeFilter} onChange={(e) => setEntityTypeFilter(e.target.value)}>
          <option value="">Semua</option>
          <option value="order">Order</option>
          <option value="product">Product</option>
          <option value="user">User</option>
        </select>
      </div>

      {logs.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '48px' }}>
          <p style={{ fontSize: '32px', marginBottom: '8px' }}>📋</p>
          <p style={{ color: 'var(--color-text-muted)' }}>Belum ada log</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {logs.map((log) => {
            const icon = ACTION_ICONS[log.action] || '📝';
            const isExpanded = expandedId === log.id;
            return (
              <div
                key={log.id}
                className="card"
                style={{ padding: '12px 16px', cursor: 'pointer' }}
                onClick={() => setExpandedId(isExpanded ? null : log.id)}
              >
                <div className="flex justify-between items-center">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontSize: '18px' }}>{icon}</span>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '13px' }}>
                        {log.action}
                      </div>
                      <div style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>
                        {log.entityType && <span>{log.entityType}:{log.entityId?.slice(0, 8)}... </span>}
                        {log.ipAddress && <span>• IP: {log.ipAddress} </span>}
                        {log.userId && <span>• User: {log.userId.slice(0, 8)}...</span>}
                      </div>
                    </div>
                  </div>
                  <span style={{ fontSize: '12px', color: 'var(--color-text-muted)', whiteSpace: 'nowrap' }}>
                    {new Date(log.createdAt).toLocaleString('id-ID')}
                  </span>
                </div>

                {isExpanded && (log.oldData || log.newData) && (
                  <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid var(--color-border)' }}>
                    {log.newData && (
                      <div style={{ marginBottom: '8px' }}>
                        <div style={{ fontSize: '11px', fontWeight: 600, color: '#22c55e', marginBottom: '4px' }}>NEW DATA</div>
                        <pre style={{
                          background: 'var(--color-bg-elevated)', padding: '8px', borderRadius: '6px',
                          fontSize: '11px', fontFamily: 'var(--font-mono)', overflow: 'auto', maxHeight: '200px',
                        }}>
                          {JSON.stringify(log.newData, null, 2)}
                        </pre>
                      </div>
                    )}
                    {log.oldData && (
                      <div>
                        <div style={{ fontSize: '11px', fontWeight: 600, color: '#ef4444', marginBottom: '4px' }}>OLD DATA</div>
                        <pre style={{
                          background: 'var(--color-bg-elevated)', padding: '8px', borderRadius: '6px',
                          fontSize: '11px', fontFamily: 'var(--font-mono)', overflow: 'auto', maxHeight: '200px',
                        }}>
                          {JSON.stringify(log.oldData, null, 2)}
                        </pre>
                      </div>
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

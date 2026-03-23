'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';

interface NotificationItem {
  id: string;
  type: string;
  title: string;
  message: string;
  data: Record<string, any>;
  isRead: boolean;
  createdAt: string;
}

const TYPE_ICONS: Record<string, string> = {
  order: '📦',
  subscription: '🔔',
  promo: '🎫',
  system: 'ℹ️',
};

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get<any>('/notifications');
        const data = res?.data || res;
        setNotifications(data?.notifications || []);
        setUnreadCount(data?.unreadCount || 0);
      } catch {
        setNotifications([]);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const markAsRead = async (id: string) => {
    try {
      await api.put(`/notifications/${id}/read`, {});
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)),
      );
      setUnreadCount((c) => Math.max(0, c - 1));
    } catch { /* silent */ }
  };

  const markAllAsRead = async () => {
    try {
      await api.put('/notifications/read-all', {});
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch { /* silent */ }
  };

  const timeAgo = (date: string) => {
    const diff = Date.now() - new Date(date).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'baru saja';
    if (mins < 60) return `${mins} menit lalu`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours} jam lalu`;
    const days = Math.floor(hours / 24);
    return `${days} hari lalu`;
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <h1 style={{ fontSize: '20px', fontWeight: 700 }}>🔔 Notifikasi</h1>
          {unreadCount > 0 && (
            <span className="badge badge-primary" style={{ fontSize: '11px' }}>
              {unreadCount} baru
            </span>
          )}
        </div>
        {unreadCount > 0 && (
          <button className="btn btn-ghost btn-sm" onClick={markAllAsRead}>
            Tandai semua dibaca
          </button>
        )}
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '48px' }}>
          <div className="spinner spinner-dark" style={{ width: 32, height: 32, margin: '0 auto' }} />
        </div>
      ) : notifications.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '48px' }}>
          <p style={{ fontSize: '32px', marginBottom: '8px' }}>🔔</p>
          <p className="text-muted text-sm">Belum ada notifikasi</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {notifications.map((notif) => {
            const actionUrl = notif.data?.actionUrl as string | undefined;
            const Wrapper = actionUrl ? Link : 'div';
            const wrapperProps = actionUrl
              ? { href: actionUrl, style: { textDecoration: 'none', color: 'inherit' } }
              : {};

            return (
              <Wrapper
                key={notif.id}
                {...wrapperProps as any}
                className={`card card-hover`}
                style={{
                  opacity: notif.isRead ? 0.7 : 1,
                  borderLeft: notif.isRead ? 'none' : '3px solid var(--color-primary)',
                  cursor: 'pointer',
                  textDecoration: 'none',
                  color: 'inherit',
                }}
                onClick={() => !notif.isRead && markAsRead(notif.id)}
              >
                <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                  <span style={{ fontSize: '20px', lineHeight: '1' }}>
                    {TYPE_ICONS[notif.type] || '📌'}
                  </span>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                      <span style={{ fontSize: '14px', fontWeight: notif.isRead ? 400 : 600 }}>
                        {notif.title}
                      </span>
                      <span className="text-muted" style={{ fontSize: '11px' }}>
                        {timeAgo(notif.createdAt)}
                      </span>
                    </div>
                    <p className="text-muted" style={{ fontSize: '13px', lineHeight: '1.5', margin: 0 }}>
                      {notif.message}
                    </p>
                  </div>
                  {!notif.isRead && (
                    <span style={{
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      background: 'var(--color-primary)',
                      flexShrink: 0,
                      marginTop: '6px',
                    }} />
                  )}
                </div>
              </Wrapper>
            );
          })}
        </div>
      )}
    </div>
  );
}

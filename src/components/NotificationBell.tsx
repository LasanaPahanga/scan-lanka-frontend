'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthProvider';
import {
  InboxItem,
  inboxSummary,
  inboxTypeLabel,
  listInbox,
  markAllInboxRead,
  markInboxRead,
} from '@/lib/inbox';

export function NotificationBell() {
  const { user } = useAuth();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [unread, setUnread] = useState(0);
  const [items, setItems] = useState<InboxItem[]>([]);
  const [loading, setLoading] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  const refresh = useCallback(async () => {
    if (!user) return;
    try {
      const [summary, page] = await Promise.all([inboxSummary(), listInbox(0)]);
      setUnread(summary.unreadCount);
      setItems(page.items);
    } catch {
      setUnread(0);
      setItems([]);
    }
  }, [user]);

  useEffect(() => {
    if (!user) return;
    void refresh();
    const id = window.setInterval(() => void refresh(), 30000);
    return () => window.clearInterval(id);
  }, [user, refresh]);

  useEffect(() => {
    if (!open || !user) return;
    setLoading(true);
    listInbox(0)
      .then((page) => {
        setItems(page.items);
        setUnread(page.unreadCount);
      })
      .finally(() => setLoading(false));
  }, [open, user]);

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, []);

  if (!user) return null;

  async function onItemClick(item: InboxItem) {
    if (!item.read) {
      try {
        await markInboxRead(item.id);
        setUnread((n) => Math.max(0, n - 1));
        setItems((prev) => prev.map((i) => (i.id === item.id ? { ...i, read: true } : i)));
      } catch {
        /* ignore */
      }
    }
    setOpen(false);
    if (item.link) router.push(item.link);
  }

  async function onMarkAllRead() {
    await markAllInboxRead();
    setUnread(0);
    setItems((prev) => prev.map((i) => ({ ...i, read: true })));
  }

  return (
    <div ref={wrapRef} className="notification-bell">
      <button
        type="button"
        className="icon-link notification-bell-btn"
        aria-label={`Notifications${unread > 0 ? `, ${unread} unread` : ''}`}
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        🔔
        {unread > 0 && <span style={badgeStyle}>{unread > 9 ? '9+' : unread}</span>}
      </button>

      {open && (
        <div className="notification-panel" role="dialog" aria-label="Notifications">
          <div className="notification-panel-head">
            <strong>Notifications</strong>
            {unread > 0 && (
              <button type="button" className="notification-mark-all" onClick={() => void onMarkAllRead()}>
                Mark all read
              </button>
            )}
          </div>

          {loading ? (
            <p className="notification-empty">Loading…</p>
          ) : items.length === 0 ? (
            <p className="notification-empty">No notifications yet.</p>
          ) : (
            <ul className="notification-list">
              {items.map((item) => (
                <li key={item.id}>
                  <button
                    type="button"
                    className={`notification-item${item.read ? '' : ' notification-item--unread'}`}
                    onClick={() => void onItemClick(item)}
                  >
                    <span className="notification-item-type">{inboxTypeLabel(item.type)}</span>
                    <span className="notification-item-title">{item.title}</span>
                    {item.body && <span className="notification-item-body">{item.body}</span>}
                    <span className="notification-item-time">{new Date(item.at).toLocaleString()}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}

          <div className="notification-panel-foot">
            <Link href="/account" onClick={() => setOpen(false)}>
              Account settings
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

const badgeStyle = {
  background: 'var(--danger)',
  color: '#fff',
  borderRadius: 999,
  fontSize: '0.68rem',
  fontWeight: 700,
  minWidth: 17,
  height: 17,
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '0 4px',
  marginLeft: 2,
} as const;

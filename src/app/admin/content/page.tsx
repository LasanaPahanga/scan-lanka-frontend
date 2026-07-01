'use client';

import { FormEvent, useEffect, useState } from 'react';
import Link from 'next/link';
import { ContentPage, listContentPages, saveContentPage } from '@/lib/content';
import { adminMain } from '@/components/formStyles';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';
import { AdminSection } from '@/components/admin/AdminSection';

const SLUGS = ['about', 'delivery', 'clientele', 'contact', 'returns', 'privacy', 'terms'];

export default function AdminContentPage() {
  const [pages, setPages] = useState<ContentPage[]>([]);
  const [slug, setSlug] = useState('privacy');
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');

  useEffect(() => {
    listContentPages().then((list: ContentPage[]) => {
      setPages(list);
      const current = list.find((p) => p.slug === 'privacy') ?? list[0];
      if (current) {
        setSlug(current.slug);
        setTitle(current.title);
        setBody(current.bodyHtml);
      }
    });
  }, []);

  function select(next: string) {
    setSlug(next);
    const p = pages.find((x) => x.slug === next);
    if (p) {
      setTitle(p.title);
      setBody(p.bodyHtml);
    }
  }

  async function onSave(e: FormEvent) {
    e.preventDefault();
    await saveContentPage(slug, title, body);
    const list = await listContentPages();
    setPages(list);
  }

  return (
    <main style={adminMain}>
      <AdminPageHeader
        title="Content pages"
        description="HTML is sanitized on save. Preview public pages from the links below."
      />

      <div className="admin-filter-bar">
        {SLUGS.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => select(s)}
            className={`admin-filter-chip${slug === s ? ' admin-filter-chip--active' : ''}`}
          >
            {s}
          </button>
        ))}
      </div>

      <p style={{ marginBottom: '1rem', fontSize: '0.88rem' }}>
        {SLUGS.map((s) => (
          <Link key={s} href={`/${s}`} style={{ marginRight: '0.75rem' }}>
            /{s}
          </Link>
        ))}
      </p>

      <AdminSection title={`Editing: ${slug}`}>
        <form onSubmit={onSave}>
          <div className="admin-field">
            <label htmlFor="content-title">Page title</label>
            <input id="content-title" value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>
          <div className="admin-field">
            <label htmlFor="content-body">HTML body</label>
            <textarea id="content-body" value={body} onChange={(e) => setBody(e.target.value)} style={{ minHeight: 280 }} />
          </div>
          <div className="admin-toolbar">
            <button type="submit" className="admin-btn admin-btn--primary">
              Save {slug}
            </button>
          </div>
        </form>
      </AdminSection>
    </main>
  );
}

/* eslint-disable react/no-danger */
import { fetchContent } from '@/lib/content';
import { notFound } from 'next/navigation';

export async function CmsArticle({ slug, children }: { slug: string; children?: React.ReactNode }) {
  const page = await fetchContent(slug);
  if (!page) notFound();
  return (
    <main className="page page-narrow">
      <h1 className="page-title">{page.title}</h1>
      <article className="prose" dangerouslySetInnerHTML={{ __html: page.bodyHtml }} />
      {children}
    </main>
  );
}

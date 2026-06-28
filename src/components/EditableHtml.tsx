/* eslint-disable react/no-danger */
import { fetchContent } from '@/lib/content';

/**
 * Hybrid CMS region: renders admin-editable HTML for {@code slug} when a content page exists,
 * otherwise falls back to the page's built-in markup. This lets the bespoke page layouts stay
 * intact while the prose inside specific regions becomes editable from the admin Content editor.
 *
 * Server component (async) - safe to drop into any server-rendered page.
 */
export async function EditableHtml({
  slug,
  className,
  children,
}: {
  slug: string;
  className?: string;
  children: React.ReactNode;
}) {
  const page = await fetchContent(slug);
  if (page?.bodyHtml) {
    return <div className={className} dangerouslySetInnerHTML={{ __html: page.bodyHtml }} />;
  }
  return <>{children}</>;
}

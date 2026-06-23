/** schema.org JSON-LD for SEO (13 FR-GEO-6). */
/* eslint-disable react/no-danger */
export function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      // JSON-LD requires a raw script tag; data is server-built from catalog fields only.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

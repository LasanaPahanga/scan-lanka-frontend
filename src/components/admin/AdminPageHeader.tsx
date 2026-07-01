import Link from 'next/link';
import { ReactNode } from 'react';

export function AdminPageHeader({
  title,
  description,
  actions,
  back,
}: {
  title: string;
  description?: string;
  actions?: ReactNode;
  back?: { href: string; label: string };
}) {
  return (
    <header className="admin-page-header">
      {back && (
        <Link href={back.href} className="admin-back">
          ← {back.label}
        </Link>
      )}
      <div className="admin-page-header-row">
        <div>
          <h1>{title}</h1>
          {description && <p>{description}</p>}
        </div>
        {actions}
      </div>
    </header>
  );
}

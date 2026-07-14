import { CmsArticle } from '@/components/CmsArticle';
import { ContactReturnsCta } from '@/components/ContactReturnsCta';

export const revalidate = 300;

export const metadata = {
  title: 'Help Center - Scan Lanka',
};

export default function ReturnsPage() {
  return (
    <>
      {/* Leads with contact routing (15 FR-CONTENT-2 / 16 FR-RETURN-1) before the policy text. */}
      <div className="page page-narrow" style={{ paddingBottom: 0 }}>
        <ContactReturnsCta />
      </div>
      <CmsArticle slug="returns" />
    </>
  );
}

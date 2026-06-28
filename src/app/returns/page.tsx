import { CmsArticle } from '@/components/CmsArticle';
import { ContactReturnsCta } from '@/components/ContactReturnsCta';

export const revalidate = 300;

export const metadata = {
  title: 'Returns & refunds - Scan Lanka',
};

export default function ReturnsPage() {
  return (
    <CmsArticle slug="returns">
      <ContactReturnsCta />
    </CmsArticle>
  );
}

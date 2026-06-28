import { CmsArticle } from '@/components/CmsArticle';

export const revalidate = 300;

export const metadata = {
  title: 'Terms & conditions - Scan Lanka',
};

export default function TermsPage() {
  return <CmsArticle slug="terms" />;
}

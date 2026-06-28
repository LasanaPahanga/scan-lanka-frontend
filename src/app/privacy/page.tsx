import { CmsArticle } from '@/components/CmsArticle';

export const revalidate = 300;

export const metadata = {
  title: 'Privacy policy - Scan Lanka',
  description: 'How Scan Lanka handles your personal data under PDPA.',
};

export default function PrivacyPage() {
  return <CmsArticle slug="privacy" />;
}

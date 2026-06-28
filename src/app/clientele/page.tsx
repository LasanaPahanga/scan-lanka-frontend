import { ClientLogos } from '@/components/ClientLogos';
import { EditableHtml } from '@/components/EditableHtml';

export const revalidate = 300;

export const metadata = {
  title: 'Clientele - Scan Lanka',
  description: 'Schools, universities and leading businesses across Sri Lanka trust Scan Lanka.',
};

export default function ClientelePage() {
  return (
    <main className="page">
      <h1 className="page-title">Clientele</h1>
      <EditableHtml slug="clientele" className="page-intro">
        <p className="page-intro">
          Schools, universities, ministries and leading businesses across Sri Lanka rely on Scan Lanka
          for their boards and teaching equipment.
        </p>
      </EditableHtml>
      <ClientLogos />
    </main>
  );
}

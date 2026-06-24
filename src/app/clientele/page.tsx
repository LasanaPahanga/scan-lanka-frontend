import { ClientLogos } from '@/components/ClientLogos';

export const metadata = {
  title: 'Clientele — Scan Lanka',
  description: 'Schools, universities and leading businesses across Sri Lanka trust Scan Lanka.',
};

export default function ClientelePage() {
  return (
    <main className="page">
      <h1 className="page-title">Clientele</h1>
      <p className="page-intro">
        Schools, universities, ministries and leading businesses across Sri Lanka rely on Scan Lanka
        for their boards and teaching equipment.
      </p>
      <ClientLogos />
    </main>
  );
}

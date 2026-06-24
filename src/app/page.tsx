import { fetchHome } from '@/lib/home';
import { getFacets, listProducts } from '@/lib/catalog';
import { HomePageView } from '@/components/HomePageView';

export const revalidate = 120;

export const metadata = {
  title: 'Scan Lanka — Boards & Teaching Equipment',
  description: 'Manufacturer & supplier of boards and teaching equipment in Sri Lanka since 1998.',
};

export default async function Home() {
  const [home, facets] = await Promise.all([fetchHome(), getFacets()]);

  // Per-category product rows (like scanlanka.com): first few categories, up to 4 products each.
  const rows = (
    await Promise.all(
      facets.categories.slice(0, 6).map(async (category) => ({
        category,
        products: (await listProducts({ category, size: 4 })).content,
      })),
    )
  ).filter((r) => r.products.length > 0);

  return <HomePageView home={home} categoryRows={rows} />;
}

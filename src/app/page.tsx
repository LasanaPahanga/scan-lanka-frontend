import { fetchHome } from '@/lib/home';
import { getFacets, listProducts } from '@/lib/catalog';
import { HomePageView } from '@/components/HomePageView';

export const revalidate = 120;

const PINNED_CATEGORY = 'White Board';

export const metadata = {
  title: 'Scan Lanka - Boards & Teaching Equipment',
  description: 'Manufacturer & supplier of boards and teaching equipment in Sri Lanka since 1998.',
};

export default async function Home() {
  let home: Awaited<ReturnType<typeof fetchHome>> = { featured: [], banners: [] };
  let rows: { category: string; products: Awaited<ReturnType<typeof listProducts>>['content'] }[] = [];

  try {
    const [homeData, facets] = await Promise.all([fetchHome(), getFacets()]);
    home = homeData;
    // Pin "White Board" first on the homepage (owner 2026-07-14, 14 FR-MERCH-5);
    // everything else keeps the API order — the owner's sheet order (product display_order, V46/V47).
    const orderedCategories = [...facets.categories].sort((a, b) => {
      if (a === PINNED_CATEGORY) return -1;
      if (b === PINNED_CATEGORY) return 1;
      return 0;
    });
    rows = (
      await Promise.all(
        orderedCategories.slice(0, 6).map(async (category) => ({
          category,
          products: (await listProducts({ category, size: 4 })).content,
        })),
      )
    ).filter((r) => r.products.length > 0);
  } catch {
    /* API offline - hero video + category tiles still render */
  }

  return <HomePageView home={home} categoryRows={rows} />;
}

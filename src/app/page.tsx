import { fetchHome } from '@/lib/home';
import { getFacets, listProducts, type ProductChip } from '@/lib/catalog';
import { HomePageView } from '@/components/HomePageView';

export const revalidate = 120;

const PINNED_CATEGORY = 'White Board';

// How many products each homepage category row shows.
const HOME_ROW_SIZE = 4;

// Owner (2026-07-22): on the homepage, lead the game-board rows with the flagship boards
// instead of the accessories (men sets, discs, stands) that otherwise sort first by the
// sheet display_order. This only reorders the homepage rows — the /products listing keeps
// the owner's sheet order untouched. Slugs not listed here keep their display_order, after
// the pinned ones. Order per owner: teak, satin wood, tournament, champion, practice…
const HOME_ROW_ORDER: Record<string, string[]> = {
  'Carrom Board': [
    'special-teak-carrom-board',
    'special-satin-wood-carrom-board',
    'tournament-carrom-board',
    'champion-carrom-board',
    'practice-carrom-board',
    'sri-lankan-iron-wood-carrom-board',
    'medium-carrom-board',
    'baby-carrom-board',
  ],
  'Dam / Chess Board': [
    'dam-board',
    'dam-board-teak-wood',
    'chess-board',
    'chess-board-teak-wood',
  ],
};

function orderHomeRow(category: string, products: ProductChip[]): ProductChip[] {
  const preferred = HOME_ROW_ORDER[category];
  if (!preferred) return products;
  const rank = (slug: string) => {
    const i = preferred.indexOf(slug);
    return i === -1 ? preferred.length : i; // unlisted products keep their (display_order) place, after the pinned ones
  };
  return [...products].sort((a, b) => rank(a.slug) - rank(b.slug));
}

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
        orderedCategories.map(async (category) => {
          // For rows with a custom lead order, pull a wider page so the pinned boards are
          // actually present to promote, then reorder and trim to the row size.
          const custom = HOME_ROW_ORDER[category] !== undefined;
          const content = (await listProducts({ category, size: custom ? 24 : HOME_ROW_SIZE })).content;
          return { category, products: orderHomeRow(category, content).slice(0, HOME_ROW_SIZE) };
        }),
      )
    ).filter((r) => r.products.length > 0);
  } catch {
    /* API offline - hero video + category tiles still render */
  }

  return <HomePageView home={home} categoryRows={rows} />;
}

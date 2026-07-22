import type { APIRoute } from 'astro';
import { renderOgImage, type OgCard } from '../../lib/og';

// Single-page site: the homepage card is the only one referenced.
const staticCards: Record<string, OgCard> = {
  home: { title: "Do it twice? I'll automate it" },
};

export async function getStaticPaths() {
  return Object.entries(staticCards).map(([slug, card]) => ({ params: { slug }, props: card }));
}

export const GET: APIRoute = async ({ props }) => {
  const png = await renderOgImage(props as OgCard);
  return new Response(new Uint8Array(png), {
    headers: { 'Content-Type': 'image/png' },
  });
};

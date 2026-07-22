import { getCollection } from 'astro:content';
import type { APIRoute } from 'astro';
import { renderOgImage, type OgCard } from '../../lib/og';

const staticCards: Record<string, OgCard> = {
  home: { title: "Do it twice? I'll automate it" },
  cv: { title: 'CV — Ronald Lokers', tags: ['open to platform / devops roles'] },
};

export async function getStaticPaths() {
  const posts = await getCollection('writing', ({ data }) => !data.draft);
  const projects = await getCollection('projects', ({ data }) => !data.draft);

  return [
    ...Object.entries(staticCards).map(([slug, card]) => ({ params: { slug }, props: card })),
    ...posts.map((post) => ({
      params: { slug: `writing/${post.id}` },
      props: { title: post.data.title, tags: post.data.tags } satisfies OgCard,
    })),
    ...projects.map((project) => ({
      params: { slug: `projects/${project.id}` },
      props: { title: project.data.title.toLowerCase(), tags: project.data.tech } satisfies OgCard,
    })),
  ];
}

export const GET: APIRoute = async ({ props }) => {
  const png = await renderOgImage(props as OgCard);
  return new Response(new Uint8Array(png), {
    headers: { 'Content-Type': 'image/png' },
  });
};

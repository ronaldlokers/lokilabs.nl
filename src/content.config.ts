import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const writing = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/writing' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    tags: z.array(z.string()).default([]),
    draft: z.boolean().default(false),
  }),
});

const projects = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/projects' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    tech: z.array(z.string()).default([]),
    repo: z.string().url().optional(),
    link: z.string().url().optional(),
    // Sort key for the grid AND the detail-page older/newer nav — ascending,
    // lower is "newer"/more prominent (0 = shown first, most recent chapter).
    // Not a date; it's a manual ranking, so new projects need a value lower
    // than whatever's currently first to slot in ahead of it.
    order: z.number().default(0),
    // Show on the homepage's "selected work" section (in addition to the
    // full grid on /projects/).
    featured: z.boolean().default(false),
    // Free-text status pill (e.g. "beta", "production", "live", "daily
    // use") shown next to the title. Styling is keyed off the exact string
    // via [data-badge="..."] in home.css — production/live get a green
    // treatment and "daily use" violet; anything else (including typos)
    // silently falls back to the default orange.
    badge: z.string().optional(),
    // Path under /public, e.g. "/assets/projects/foo.png" — shown on the
    // detail page and (if featured) the homepage card.
    screenshot: z.string().optional(),
    draft: z.boolean().default(false),
  }),
});

export const collections = { writing, projects };

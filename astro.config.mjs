// @ts-check
import { defineConfig } from 'astro/config';

import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  site: 'https://lokilabs.nl',
  integrations: [sitemap()],
  build: {
    // one small stylesheet — inlining removes the only render-blocking request
    inlineStylesheets: 'always'
  }
});
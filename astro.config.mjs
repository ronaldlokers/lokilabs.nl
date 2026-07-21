// @ts-check
import { defineConfig } from 'astro/config';
import expressiveCode from 'astro-expressive-code';

import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  site: 'https://lokilabs.nl',
  integrations: [
    expressiveCode({
      themes: ['github-dark'],
      styleOverrides: {
        borderRadius: '10px',
        borderColor: '#3A322B',
        codeBackground: '#14100D',
        codeFontFamily: "'Fira Code', ui-monospace, monospace",
        frames: {
          terminalBackground: '#14100D',
          terminalTitlebarBackground: '#1E1915',
          terminalTitlebarBorderBottomColor: '#2A241E',
          terminalTitlebarForeground: '#8E867E',
          editorTabBarBackground: '#1E1915',
          editorActiveTabBackground: '#14100D',
          editorActiveTabForeground: '#EFEBE4',
          editorActiveTabIndicatorTopColor: '#F67D51',
          editorTabBarBorderBottomColor: '#2A241E',
          inlineButtonBackground: '#3A322B',
          inlineButtonForeground: '#EFEBE4',
        },
      },
    }),
    sitemap(),
  ],
  build: {
    // one small stylesheet — inlining removes the only render-blocking request
    inlineStylesheets: 'always'
  }
});
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import satori from 'satori';
import { Resvg } from '@resvg/resvg-js';

// resolve from project root — import.meta.url paths break in the prerender bundle
const asset = (p: string) => readFileSync(resolve(process.cwd(), p));
const fontRegular = asset('src/assets/fonts/FiraCode-Regular.ttf');
const fontBold = asset('src/assets/fonts/FiraCode-Bold.ttf');
const portraitTile = asset('src/assets/og/portrait-tile.png');
const portraitSrc = `data:image/png;base64,${portraitTile.toString('base64')}`;

export type OgCard = {
  title: string;
  tags?: string[];
};

// satori element helper — satori takes React-shaped objects, no JSX needed
const el = (type: string, props: Record<string, unknown>, ...children: unknown[]) => ({
  type,
  props: { ...props, children: children.length === 1 ? children[0] : children },
});

export async function renderOgImage({ title, tags = [] }: OgCard): Promise<Buffer> {
  const svg = await satori(
    el(
      'div',
      {
        style: {
          width: '1200px',
          height: '630px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          backgroundColor: '#562C8B',
          padding: '64px',
          fontFamily: 'Fira Code',
        },
      },
      el(
        'div',
        { style: { display: 'flex', alignItems: 'center', gap: '56px', flex: 1 } },
        el('img', { src: portraitSrc, width: 300, height: 300, style: { borderRadius: '68px' } }),
        el(
          'div',
          { style: { display: 'flex', flexDirection: 'column', gap: '28px', flex: 1 } },
          el('div', {
            style: {
              fontSize: title.length > 60 ? '52px' : '64px',
              fontWeight: 700,
              color: '#FBF8F4',
              lineHeight: 1.15,
              letterSpacing: '-2px',
            },
          }, title),
          tags.length > 0
            ? el(
                'div',
                { style: { display: 'flex', gap: '14px', flexWrap: 'wrap' } },
                ...tags.map((t) =>
                  el('div', {
                    style: {
                      fontSize: '24px',
                      color: '#E7DCF5',
                      backgroundColor: '#6B44A0',
                      padding: '6px 22px',
                      borderRadius: '12px',
                    },
                  }, t),
                ),
              )
            : el('div', { style: { display: 'flex' } }),
        ),
      ),
      el(
        'div',
        { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' } },
        el(
          'div',
          { style: { display: 'flex', fontSize: '36px', fontWeight: 700, color: '#FBF8F4' } },
          el('span', {}, '/lokilabs'),
          el('span', { style: { color: '#F67D51', marginLeft: '14px' } }, '$'),
        ),
        el('div', { style: { fontSize: '26px', color: '#C9B8E8' } }, 'lokilabs.nl'),
      ),
    ),
    {
      width: 1200,
      height: 630,
      fonts: [
        { name: 'Fira Code', data: fontRegular, weight: 400, style: 'normal' },
        { name: 'Fira Code', data: fontBold, weight: 700, style: 'normal' },
      ],
    },
  );

  return new Resvg(svg, { fitTo: { mode: 'width', value: 1200 } }).render().asPng();
}

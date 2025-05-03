import type { StarlightUserConfig } from '@astrojs/starlight/types';
import { group } from './config/sidebar';

export const sidebar = [
  // “Start” tab with two pages
  group('start', {
    items: [
      'getting-started',
      'basics/project-structure',
    ],
  }),

  // “Guides” tab with two pages
  group('guides', {
    items: [
      'guides/routing',
      'guides/styling',
    ],
  }),
] satisfies StarlightUserConfig['sidebar'];
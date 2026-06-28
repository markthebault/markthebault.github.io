import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';

// Custom domain (see public/CNAME). Update if the domain ever changes.
const SITE = 'https://www.mark-thebault.pro';

export default defineConfig({
  site: SITE,
  integrations: [mdx(), sitemap()],
  markdown: {
    shikiConfig: {
      // Light editorial code blocks to match the drafting-sheet aesthetic.
      theme: 'github-light',
      wrap: true,
    },
  },
});

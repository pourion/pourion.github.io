// @ts-check
import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://pouriamistani.com',
  trailingSlash: 'ignore',
  build: {
    format: 'directory',
  },
});

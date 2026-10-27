import { defineConfig } from 'astro/config';

export default defineConfig({
    site: 'https://distortedlogic.co.uk',
    // Emit about.html rather than about/index.html, so nginx serves /about without a trailing-slash redirect.
    build: { format: 'file' },
    trailingSlash: 'never',
});

import adapter from '@sveltejs/adapter-static';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

const basePath = process.env.BASE_PATH ?? '';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	// Consult https://svelte.dev/docs/kit/integrations
	// for more information about preprocessors
        preprocess: vitePreprocess(),

        kit: {
                // Use static adapter for frontend-only deployment
                adapter: adapter({
			pages: 'build',
			assets: 'build',
			fallback: 'index.html',
                        precompress: false,
                        strict: true
                }),

                // Use relative paths so asset requests work when the site is served
                // from a sub-directory (e.g. GitHub Pages or static hosting buckets).
                paths: {
                        base: basePath,
                        relative: true
                }
        }
};

export default config;

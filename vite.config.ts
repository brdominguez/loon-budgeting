import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
        plugins: [sveltekit()],
        test: {
                coverage: {
                        reportsDirectory: 'coverage',
                        reporter: ['text', 'lcov']
                },
                environment: 'jsdom',
                globals: true
        }
});

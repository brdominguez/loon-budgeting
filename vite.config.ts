import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vitest/config';

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

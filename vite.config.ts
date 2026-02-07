import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [sveltekit()],
	server: {
		proxy: {
			'/crxblob': {
				target: 'https://clients2.googleusercontent.com',
				changeOrigin: true,
				rewrite: (path) => path.replace(/^\/crxblob/, '')
			}
		}
	}
});

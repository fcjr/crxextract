import { parseHTML } from 'linkedom';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ url }) => {
	try {
		const rawUrl = url.searchParams.get('storeUrl');
		if (!rawUrl) {
			throw new Error('invalid url');
		}
		const storeUrl = new URL(decodeURIComponent(rawUrl));
		if (storeUrl.host !== 'addons.mozilla.org') {
			throw new Error('invalid url');
		}

		const storePage = await fetch(storeUrl.href);
		const { document } = parseHTML(await storePage.text());
		const link = document.querySelector('.InstallButtonWrapper-download-link');
		if (!link) {
			throw new Error('download link not found');
		}

		return new Response(link.getAttribute('href'), { status: 200 });
	} catch (error) {
		return new Response(String(error), { status: 500 });
	}
};

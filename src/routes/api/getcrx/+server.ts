import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ url }) => {
	try {
		const extensionId = url.searchParams.get('id');
		if (!extensionId || !/^[a-z]{32}$/.test(extensionId)) {
			throw new Error('invalid extension id');
		}

		const crxUrl = `https://clients2.google.com/service/update2/crx?response=redirect&prodversion=130.0&acceptformat=crx3&x=id%3D${extensionId}%26installsource%3Dondemand%26uc`;
		const response = await fetch(crxUrl, { redirect: 'manual' });

		if (response.status !== 302) {
			throw new Error(`unexpected response: ${response.status}`);
		}

		const downloadUrl = response.headers.get('location');
		if (!downloadUrl) {
			throw new Error('no redirect location');
		}

		const proxyPath = downloadUrl.replace('https://clients2.googleusercontent.com/', '/crxblob/');

		return new Response(proxyPath, { status: 200 });
	} catch (error) {
		return new Response(String(error), { status: 500 });
	}
};

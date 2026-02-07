exports.handler = async (event, context) => {
	try {
		const extensionId = event.queryStringParameters.id
		if (!extensionId || !/^[a-z]{32}$/.test(extensionId)) {
			throw new Error('invalid extension id')
		}

		const crxUrl = `https://clients2.google.com/service/update2/crx?response=redirect&prodversion=130.0&acceptformat=crx3&x=id%3D${extensionId}%26installsource%3Dondemand%26uc`
		const response = await fetch(crxUrl, { redirect: 'manual' })

		if (response.status !== 302) {
			throw new Error(`unexpected response: ${response.status}`)
		}

		const downloadUrl = response.headers.get('location')
		if (!downloadUrl) {
			throw new Error('no redirect location')
		}

		// Transform to same-origin proxy path so the browser can fetch it without CORS issues
		const proxyPath = downloadUrl.replace('https://clients2.googleusercontent.com/', '/crxblob/')

		return { statusCode: 200, body: proxyPath }
	} catch (error) {
		return { statusCode: 500, body: String(error) }
	}
}

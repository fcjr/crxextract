const MAX_SIZE = 5 * 1024 * 1024 // 5MB (Netlify function response limit is 6MB, base64 adds ~33%)

exports.handler = async (event, context) => {
	try {
		const extensionId = event.queryStringParameters.id
		if (!extensionId || !/^[a-z]{32}$/.test(extensionId)) {
			throw new Error('invalid extension id')
		}

		const crxUrl = `https://clients2.google.com/service/update2/crx?response=redirect&prodversion=130.0&acceptformat=crx3&x=id%3D${extensionId}%26installsource%3Dondemand%26uc`
		const response = await fetch(crxUrl, { redirect: 'follow' })

		if (!response.ok) {
			throw new Error(`failed to fetch crx: ${response.status}`)
		}

		const contentLength = parseInt(response.headers.get('content-length') || '0', 10)
		if (contentLength > MAX_SIZE) {
			return {
				statusCode: 413,
				body: 'Extension is too large to download via proxy. Please download the .crx file manually and use the drag-and-drop feature.',
			}
		}

		const buffer = Buffer.from(await response.arrayBuffer())

		if (buffer.length > MAX_SIZE) {
			return {
				statusCode: 413,
				body: 'Extension is too large to download via proxy. Please download the .crx file manually and use the drag-and-drop feature.',
			}
		}

		return {
			statusCode: 200,
			headers: {
				'Content-Type': 'application/octet-stream',
				'Content-Disposition': `attachment; filename="${extensionId}.crx"`,
			},
			body: buffer.toString('base64'),
			isBase64Encoded: true,
		}
	} catch (error) {
		return { statusCode: 500, body: String(error) }
	}
}

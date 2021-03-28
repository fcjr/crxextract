const fetch = require('node-fetch')

function buildChromeDownloadLink(extensionId) {
	const baseUrl = 'https://clients2.google.com/service/update2/crx?response=redirect&prodversion=49.0&acceptformat=crx3&x=id%3D__EXTENSION_ID__%26installsource%3Dondemand%26uc'
	return baseUrl.replace('__EXTENSION_ID__', extensionId)
}

exports.handler = async (event, context) => {
	try {
		const id = event.queryStringParameters.id
		if (id === '') {
			throw new Error('id required')
		}
		const url = buildChromeDownloadLink(id)
		const response = await fetch(url)
		if (!response.ok) {
			throw new Error('failed to fetch crx')
		}
		const buf = await response.buffer()
		return {
			statusCode: 200,
			headers: {
				'Content-Type': 'application/octet-stream'
			},
			isBase64Encoded: true,
			body: buf.toString('base64')
		}
	} catch(error) {
		return { statusCode: 500, body: String(error) }
	}
}

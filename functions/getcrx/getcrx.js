const fetch = require('node-fetch')

function buildChromeDownloadLink(extensionId) {
	const baseUrl = 'https://clients2.google.com/service/update2/crx?response=redirect&prodversion=49.0&acceptformat=crx3&x=id%3D__EXTENSION_ID__%26installsource%3Dondemand%26uc'
	return baseUrl.replace('__EXTENSION_ID__', extensionId)
}

exports.handler = async (event, context) => {
	const id = event.queryStringParameters.id
	if (id === '') {
		return { statusCode: 500 }
	}
	const url = buildChromeDownloadLink(id)
	console.log(url)
	return fetch(url)
	.then(res => res.buffer())
	.then((body) => {
		return {
		statusCode: 200,
		headers: {
			'Content-Type': 'application/octet-stream'
		},
		isBase64Encoded: true,
		body: body.toString('base64')
	}})
	.catch((error) => ({ statusCode: 500, body: String(error) }))
}

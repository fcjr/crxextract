const fetch = require('node-fetch')
const { JSDOM } = require('jsdom')

function buildMozillaDownloadLink(addonAccountId, addonName) {
	var url = 'https://addons.mozilla.org/firefox/downloads/latest/__ADDON_NAME__/addon-__ADDON_ACCOUNT_ID__-latest.xpi'
	url =  url.replace('__ADDON_ACCOUNT_ID__', addonAccountId)
	return url.replace('__ADDON_NAME__', addonName)
}

exports.handler = async (event, context) => {
	const rawUrl = decodeURIComponent(event.queryStringParameters.url)
	if (rawUrl === '') {
		return { statusCode: 500 }
	}
	var storeUrl
	try {
		storeUrl = new URL(rawUrl)
	} catch (e) {
		return { statusCode: 500 }
	}
	if (storeUrl.host !== 'addons.mozilla.org') {
		return { statusCode: 500 }
	}

	// get id
	var path = storeUrl.pathname
	if (path.slice(-1) == '/') {
		path = path.slice(0, -1)
	}
	const pathParts = path.split('/')
	const id = pathParts.pop()

	// get account id
	const storePage = await fetch(rawUrl)
	const storeDom = new JSDOM(await storePage.text())
	const accountId = storeDom.window.document.querySelector('.AddonTitle-author a').textContent

	const url = buildMozillaDownloadLink(accountId, id)
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

const fetch = require('node-fetch')
const { JSDOM } = require('jsdom')

function buildMozillaDownloadLink(addonAccountId, addonName) {
	var url = 'https://addons.mozilla.org/firefox/downloads/latest/__ADDON_NAME__/addon-__ADDON_ACCOUNT_ID__-latest.xpi'
	url =  url.replace('__ADDON_ACCOUNT_ID__', addonAccountId)
	return url.replace('__ADDON_NAME__', addonName)
}

exports.handler = async (event, context) => {
	try {
		const rawUrl = decodeURIComponent(event.queryStringParameters.url)
		if (rawUrl === '') {
			throw new Error('invalid url')
		}
		const storeUrl = new URL(rawUrl)
		if (storeUrl.host !== 'addons.mozilla.org') {
			throw new Error('invalid url')
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
		const response = await fetch(url)
		if (!response.ok) {
			throw new Error('failed to fetch xpi')
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

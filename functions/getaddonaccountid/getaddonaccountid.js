const fetch = require('node-fetch')
const { JSDOM } = require('jsdom')

exports.handler = async (event, context) => {
	try {
		const rawUrl = decodeURIComponent(event.queryStringParameters.storeUrl)
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

		return { statusCode: 200, body: accountId }
	} catch(error) {
		return { statusCode: 500, body: String(error) }
	}
}

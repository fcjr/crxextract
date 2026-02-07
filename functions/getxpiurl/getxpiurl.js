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

		// get account id
		const storePage = await fetch(rawUrl)
		const storeDom = new JSDOM(await storePage.text())
		const downloadUrl = storeDom.window.document.querySelector('.InstallButtonWrapper-download-link').href

		return { statusCode: 200, body: downloadUrl }
	} catch(error) {
		return { statusCode: 500, body: String(error) }
	}
}

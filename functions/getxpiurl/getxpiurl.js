const { parseHTML } = require('linkedom')

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

		const storePage = await fetch(rawUrl)
		const { document } = parseHTML(await storePage.text())
		const link = document.querySelector('.InstallButtonWrapper-download-link')
		if (!link) {
			throw new Error('download link not found')
		}

		return { statusCode: 200, body: link.getAttribute('href') }
	} catch(error) {
		return { statusCode: 500, body: String(error) }
	}
}

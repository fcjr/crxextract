function buildMozillaDownloadLink(addonAccountId: string, addonName: string) {
	var url = 'https://addons.mozilla.org/firefox/downloads/latest/__ADDON_NAME__/addon-__ADDON_ACCOUNT_ID__-latest.xpi'
	url =  url.replace('__ADDON_ACCOUNT_ID__', addonAccountId)
	return url.replace('__ADDON_NAME__', addonName)
}

export default async function getXpiUrl(storeUrl: string, id: string) {
	// get account id
	const response = await fetch(`/api/getaddonaccountid?storeUrl=${encodeURIComponent(storeUrl)}`)
	if (!response.ok) {
		throw new Error('failed to fetch account id')
	}
	const accountId = await response.text()
	return buildMozillaDownloadLink(accountId, id)
}

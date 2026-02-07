export default function getCrxUrl(extensionId: string) {
	const baseUrl = 'https://clients2.google.com/service/update2/crx?response=redirect&prodversion=130.0&acceptformat=crx3&x=id%3D__EXTENSION_ID__%26installsource%3Dondemand%26uc'
	return baseUrl.replace('__EXTENSION_ID__', extensionId)
}

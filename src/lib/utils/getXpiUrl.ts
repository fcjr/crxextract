export default async function getXpiUrl(storeUrl: string, id: string) {
	// get download id
	const response = await fetch(`/api/getxpiurl?storeUrl=${encodeURIComponent(storeUrl)}`)
	if (!response.ok) {
		throw new Error('failed to fetch download url')
	}
	return await response.text()
}

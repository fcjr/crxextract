export default async function getCrxUrl(extensionId: string) {
	const response = await fetch(`/api/getcrx?id=${extensionId}`)
	if (!response.ok) {
		throw new Error('failed to fetch download url')
	}
	return await response.text()
}

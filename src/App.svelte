<script lang="ts">
	import Dropzone from 'svelte-file-dropzone'
	import FileSaver from 'file-saver'

	import getCrxUrl from './utils/getCrxUrl'
	import getXpiUrl from './utils/getXpiUrl'

	import GithubBanner from './components/GithubBanner.svelte'

	function uint32FromUint8Array(data: Uint8Array) {
		let dataview = new DataView(data.buffer)
		return dataview.getInt32(0, true)
	}

	function getCrxHeader(data: Uint8Array) {
		const decoder = new TextDecoder()
		const magic = decoder.decode(data.slice(0, 4))
		const version = uint32FromUint8Array(data.slice(4, 8))
		const length = uint32FromUint8Array(data.slice(8, 12))
		return { magic, version, length }
	}

	function processCrx(name: string, data: Uint8Array) {
		const header = getCrxHeader(data)
		if (header.version !== 3) {
			alert(`Only crx version 3 is supported, found a crx version ${header.version}.`)
			return
		}
		const blob = new Blob([data.slice(header.length + 12)], {type: 'text/plain;charset=utf-8'})
		FileSaver.saveAs(blob, name + '.zip')
	}

	function processXpi(name: string, data: ArrayBuffer) {
		const blob = new Blob([data], {type: 'text/plain;charset=utf-8'})
		FileSaver.saveAs(blob, name + '.zip')
	}

	function handleFilesSelect(e: any) {
		const files = e.detail.acceptedFiles
		for (const file of files) {
			const name = file.name.slice(0, -4)
			const type = file.name.slice(-3)
			const reader = new FileReader()
			reader.onload = () => {
				const buf = reader.result as ArrayBuffer
				if (type === 'xpi') {
					processXpi(name, buf)
				} else {
					processCrx(name, new Uint8Array(buf))
				}
			}
			reader.readAsArrayBuffer(file)
		}
	}

	async function getExtensionInfoFromUrl(rawUrl: string) {
		var url
		try {
			url = new URL(rawUrl);
		} catch(e) {
			throw new Error('not a valid url')
		}

		var path = url.pathname;
		if (path.slice(-1) == '/') {
			path = path.slice(0, -1)
		}
		const pathParts = path.split('/')

		if (url.hostname === 'chrome.google.com' || url.hostname === 'chromewebstore.google.com') {
			return { type: 'chrome', id: pathParts.pop() }
		} else if (url.hostname === 'addons.mozilla.org') {
			return { type: 'mozilla', id: pathParts.pop() }
		}
		throw new Error('not a valid chrome or mozilla store link')
	}

	async function processUrl(rawUrl: string) {
		const eInfo = await getExtensionInfoFromUrl(rawUrl)
		if (eInfo.type === 'chrome') {
			const proxyPath = await getCrxUrl(eInfo.id)
			const response = await fetch(proxyPath)
			if (!response.ok) {
				throw new Error('failed to download extension')
			}
			const data = new Uint8Array(await response.arrayBuffer())
			processCrx(eInfo.id, data)
			return ''
		} else if (eInfo.type === 'mozilla') {
			return await getXpiUrl(rawUrl, eInfo.id)
		}
		return ''
	}

	var urlInputError = ''
	var dlUrl = ''
	var downloading = false
	async function handleUrlInput(e: Event & { currentTarget: EventTarget & HTMLInputElement }) {
		const input = e.currentTarget.value;
		urlInputError = ''
		dlUrl = ''
		if (input === '') {
			return
		}
		downloading = true
		try {
			dlUrl = await processUrl(input)
		} catch(e) {
			urlInputError = e.message
		}
		downloading = false
	}

</script>

<main>
	<GithubBanner url='https://github.com/fcjr/crxextract' />
	<h1>Drop a .crx or .xpi below to extract</h1>
	<Dropzone
		on:drop={handleFilesSelect}
		multiple={false}
		accept='.crx,.xpi'
		containerStyles='height: 100%; width: 100%; justify-content: center;'
	>
		<p>Drop a .crx or .xpi here to extract</p>
	</Dropzone>
	<p>... or paste a <a aria-label='Google Chrome Extension Store' href='https://chromewebstore.google.com/'>Chrome Store</a> / <a aria-label='Mozilla Addon Store' href='https://addons.mozilla.org/firefox/'>Mozilla Addon Store</a> address below to download one:</p>
	<div class='urlInputContainer'>
		<input
			class={ urlInputError ? 'urlInput error' : 'urlInput'}
			placeholder='Paste a store url here to download a .crx or .xpi'
			on:input={handleUrlInput}
			on:change={() => {}}
		/>
		{#if downloading}
			<span class='downloadButton downloading'>Downloading...</span>
		{:else if dlUrl}
			<a class='downloadButton' href={dlUrl} download>Download</a>
		{/if}
	</div>
	<p class='urlInputError'>{urlInputError}</p>
	<div class='footer'>
		<a href='https://frankchiarulli.com/'>
			Made with 💖 by <b>fcjr</b>
		</a>
	</div>
</main>

<style>
	main {
		height: 95%;
		margin: 0 10% 0 10%;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		text-align: center;
	}

	a,
	a:visited {
		color: inherit;
	}

	h1 {
		color: #ff3e00;
		text-transform: uppercase;
		font-size: 2em;
		font-weight: 100;
	}

	.urlInputContainer {
		display: flex;
		width: 80%;
	}

	.urlInput {
		flex: 1;
		padding: .8em;
		border: solid;
		border-width: .2em;
		border-radius: 1em;
		border-color: #8d8d8d;
	}
	.urlInput.error:focus {
		border-color: #ff3e00;
	}

	.urlInput:focus {
		outline: none;
		border-color: #2196f3;
	}
	.urlInputError {
		margin: 0;
		margin-top: .8em;
		font-size: .8em;
		color: #ff3e00;
		text-align: center;
	}
	.urlInputError:before,
	.urlInputError:after {
		content: '.';
		visibility: hidden;
	}

	.downloadButton {
		padding: 1em;
		border-radius: 1em;
		margin-left: .5em;
		background-color: #2196f3;
		color: #fff;
		font-size: .8em;
		text-align: center;
		text-decoration: none;
	}
	.downloadButton:visited {
		color: #fff;
	}
	.downloadButton.downloading {
		opacity: 0.7;
		cursor: wait;
	}

	.footer {
		display: flex;
		flex-direction: column;
		align-items: center;
	}

	.footer a {
		top: 0;
		position: relative;
		padding-top: 1em;
		color: #3b3b3b;
		text-decoration: none;
		transition: top ease 0.5s;
	}

	.footer a:hover,
	.footer a:focus,
	.footer a:active {
		top: -5px;
		text-decoration: underline;
	}
</style>

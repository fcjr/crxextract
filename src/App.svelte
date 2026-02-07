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

	var urlInputError = ''
	var dlUrl = ''
	var crxProxyPath = ''
	var crxId = ''
	var downloading = false

	async function handleUrlInput(e: Event & { currentTarget: EventTarget & HTMLInputElement }) {
		const input = e.currentTarget.value;
		urlInputError = ''
		dlUrl = ''
		crxProxyPath = ''
		crxId = ''
		if (input === '') {
			return
		}
		try {
			const eInfo = await getExtensionInfoFromUrl(input)
			if (eInfo.type === 'chrome') {
				crxProxyPath = await getCrxUrl(eInfo.id)
				crxId = eInfo.id
			} else if (eInfo.type === 'mozilla') {
				dlUrl = await getXpiUrl(input, eInfo.id)
			}
		} catch(e) {
			urlInputError = e.message
		}
	}

	async function handleCrxDownload() {
		downloading = true
		urlInputError = ''
		try {
			const response = await fetch(crxProxyPath)
			if (!response.ok) {
				throw new Error('failed to download extension')
			}
			const data = new Uint8Array(await response.arrayBuffer())
			processCrx(crxId, data)
		} catch(e) {
			urlInputError = e.message
		}
		downloading = false
	}

</script>

<main>
	<GithubBanner url='https://github.com/fcjr/crxextract' />

	<div class="hero">
		<h1>crxextract</h1>
		<p class="subtitle">Extract Chrome and Firefox extensions in seconds.</p>
	</div>

	<div class="card">
		<Dropzone
			on:drop={handleFilesSelect}
			multiple={false}
			accept='.crx,.xpi'
			disableDefaultStyles={true}
			containerStyles='width: 100%; display: flex; align-items: center; justify-content: center; border: 1px dashed rgba(255,255,255,0.1); border-radius: 12px; background: rgba(255,255,255,0.02); cursor: pointer; transition: background 0.15s, border-color 0.15s; padding: 2.5rem 1rem;'
		>
			<p class="dropLabel">Drop a <code>.crx</code> or <code>.xpi</code> file here</p>
		</Dropzone>
	</div>

	<div class="divider">
		<span class="dividerLine"></span>
		<span class="dividerText">or</span>
		<span class="dividerLine"></span>
	</div>

	<div class="card">
		<p class="inputLabel">Paste a <a href='https://chromewebstore.google.com/'>Chrome Web Store</a> or <a href='https://addons.mozilla.org/firefox/'>Mozilla Add-on</a> URL</p>
		<div class='urlInputContainer'>
			<input
				class={ urlInputError ? 'urlInput error' : 'urlInput'}
				placeholder='https://chromewebstore.google.com/detail/...'
				on:input={handleUrlInput}
				on:change={() => {}}
			/>
			{#if downloading}
				<button class='downloadButton' disabled>Downloading...</button>
			{:else if crxProxyPath}
				<button class='downloadButton' on:click={handleCrxDownload}>Download</button>
			{:else if dlUrl}
				<button class='downloadButton' on:click={() => window.open(dlUrl, '_blank')}>Download</button>
			{/if}
		</div>
		<p class='urlInputError'>{urlInputError}</p>
	</div>

	<div class='footer'>
		<a href='https://frankchiarulli.com/'>
			Made with 💖 by <b>fcjr</b>
		</a>
	</div>
</main>

<style>
	main {
		min-height: 100vh;
		max-width: 560px;
		margin: 0 auto;
		padding: 3rem 1.5rem;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
	}

	.hero {
		text-align: center;
		margin-bottom: 2.5rem;
	}

	h1 {
		font-size: 2rem;
		font-weight: 600;
		letter-spacing: -0.03em;
		color: #ededed;
		margin: 0 0 0.5rem 0;
	}

	.subtitle {
		color: #888;
		font-size: 1rem;
		margin: 0;
	}

	.card {
		width: 100%;
		background: #141415;
		border: 1px solid rgba(255, 255, 255, 0.06);
		border-radius: 12px;
		padding: 1.25rem;
	}

	.dropLabel {
		color: #666;
		margin: 0;
		font-size: 0.9rem;
	}

	.dropLabel :global(code) {
		background: rgba(255, 255, 255, 0.06);
		padding: 0.15em 0.4em;
		border-radius: 4px;
		font-size: 0.85em;
		color: #999;
	}

	.divider {
		display: flex;
		align-items: center;
		width: 100%;
		gap: 1rem;
		margin: 1.25rem 0;
	}

	.dividerLine {
		flex: 1;
		height: 1px;
		background: rgba(255, 255, 255, 0.06);
	}

	.dividerText {
		color: #555;
		font-size: 0.8rem;
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}

	.inputLabel {
		color: #888;
		font-size: 0.85rem;
		margin: 0 0 0.75rem 0;
	}

	a,
	a:visited {
		color: #ededed;
		text-decoration-color: rgba(255, 255, 255, 0.2);
		text-underline-offset: 2px;
		transition: text-decoration-color 0.15s;
	}

	a:hover {
		text-decoration-color: rgba(255, 255, 255, 0.6);
	}

	.urlInputContainer {
		display: flex;
		width: 100%;
		gap: 0.5rem;
	}

	.urlInput {
		flex: 1;
		padding: 0.6rem 0.75rem;
		border: 1px solid rgba(255, 255, 255, 0.1);
		border-radius: 8px;
		background: rgba(255, 255, 255, 0.03);
		color: #ededed;
		font-family: inherit;
		font-size: 0.875rem;
		transition: border-color 0.15s;
	}

	.urlInput::placeholder {
		color: #555;
	}

	.urlInput:focus {
		outline: none;
		border-color: #6366f1;
	}

	.urlInput.error:focus {
		border-color: #ef4444;
	}

	.urlInputError {
		margin: 0;
		margin-top: 0.5rem;
		font-size: 0.8rem;
		color: #ef4444;
	}

	.urlInputError:before,
	.urlInputError:after {
		content: '.';
		visibility: hidden;
	}

	.downloadButton {
		padding: 0.6rem 1rem;
		border-radius: 8px;
		background: #ededed;
		color: #0a0a0b;
		font-size: 0.875rem;
		font-weight: 500;
		font-family: inherit;
		border: none;
		cursor: pointer;
		white-space: nowrap;
		transition: background 0.15s;
	}

	.downloadButton:hover {
		background: #fff;
	}

	.downloadButton:active {
		background: #d4d4d4;
	}

	.downloadButton:disabled {
		opacity: 0.4;
		cursor: wait;
	}

	.footer {
		margin-top: 3rem;
	}

	.footer a,
	.footer a:visited {
		color: #555;
		text-decoration: none;
		font-size: 0.8rem;
		transition: color 0.15s;
	}

	.footer a:hover {
		color: #888;
	}
</style>

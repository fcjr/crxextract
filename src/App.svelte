<script type='ts'>
	import Dropzone from "svelte-file-dropzone"
	import FileSaver from "file-saver"
	import GithubBanner from "./components/GithubBanner.svelte"

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
		const blob = new Blob([data.slice(header.length + 12)], {type: "text/plain;charset=utf-8"})
		FileSaver.saveAs(blob, name + '.zip')
	}

	function processXpi(name: string, data: ArrayBuffer) {
		const blob = new Blob([data], {type: "text/plain;charset=utf-8"})
		FileSaver.saveAs(blob, name + '.zip')
	}

	function handleFilesSelect(e: any) {
		const files = e.detail.acceptedFiles
		for (let i = 0; i < files.length; i++) {
			const name = files[i].name.slice(0, -4)
			const type = files[i].name.slice(-3)
			const reader = new FileReader()
			reader.onload = () => {
				const buf = reader.result as ArrayBuffer
				if (type === 'xpi') {
					processXpi(name, buf)
				} else {
					processCrx(name, new Uint8Array(buf))
				}
			}
			reader.readAsArrayBuffer(files[i])
		}
	}
</script>

<main>
	<GithubBanner url="https://github.com/fcjr/crxextract" />
	<h1>Drop a .crx or .xpi below to extract</h1>
	<Dropzone
		on:drop={handleFilesSelect}
		multiple={false}
		accept=".crx,.xpi"
		containerStyles='height: 100%; width: 100%; justify-content: center;'
	>
		<p>Drop a .crx or .xpi here to extract</p>
	</Dropzone>
	<div class="footer">
		<a href="https://frankchiarulli.com/" target="_blank">
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

	h1 {
		color: #ff3e00;
		text-transform: uppercase;
		font-size: 2em;
		font-weight: 100;
	}

	.footer {
		display: flex;
		flex-direction: column;
		align-items: center;
	}

	.footer a {
		position: relative;
		padding-top: 2em;
		color: #3b3b3b;
		text-decoration: none;
		top: 0;
		transition: top ease 0.5s;
	}

	.footer a:hover,
	.footer a:focus,
	.footer a:active {
		top: -5px;
		text-decoration: underline;
	}
</style>

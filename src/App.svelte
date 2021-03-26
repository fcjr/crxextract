<script type='ts'>
	import Dropzone from "svelte-file-dropzone";
	import FileSaver from "file-saver";

	function uint32FromUint8Array(data: Uint8Array) {
		let dataview = new DataView(data.buffer);
		return dataview.getInt32(0, true);
	}

	function getCrxHeader(data: Uint8Array) {
		const decoder = new TextDecoder();
		const magic = decoder.decode(data.slice(0, 4))
		const version = uint32FromUint8Array(data.slice(4, 8))
		const length = uint32FromUint8Array(data.slice(8, 12))
		const header = { magic, version, length }
		return header 
	}

	function processCrx(name: string, data: Uint8Array) {
		const header = getCrxHeader(data);
		const blob = new Blob([data.slice(header.length + 12)], {type: "text/plain;charset=utf-8"});
		FileSaver.saveAs(blob, name + '.zip');
  	}

	function processXpi(name: string, data: ArrayBuffer) {
		const blob = new Blob([data], {type: "text/plain;charset=utf-8"});
		FileSaver.saveAs(blob, name + '.zip');
  	}

	function handleFilesSelect(e: any) {
    	const files = e.detail.acceptedFiles;
    	for (let i = 0; i < files.length; i++) {
			const name = files[i].name.slice(0, -4);
			const type = files[i].name.slice(-3);
      		const reader = new FileReader();
      		reader.onload = () => {
        		const buf = reader.result as ArrayBuffer;
				if (type === 'xpi') {
					processXpi(name, buf);
				} else {
					processCrx(name, new Uint8Array(buf));
				}
			};
			reader.readAsArrayBuffer(files[i])
    	}
  	}
</script>

<main>
	<h1>Drop a .crx or .xpi below to extract</h1>
	<Dropzone 
		on:drop={handleFilesSelect}
		multiple={false}
		accept=".crx,.xpi"
	>
	<p>Drop a .crx or .xpi here to extract</p>
	</Dropzone>
	<p>You're welcome Teresa =)</p>
</main>

<style>
	main {
		text-align: center;
		padding: 1em;
		margin: 0 auto;
		width: 80%;
	}

	h1 {
		color: #ff3e00;
		text-transform: uppercase;
		font-size: 2em;
		font-weight: 100;
	}
</style>
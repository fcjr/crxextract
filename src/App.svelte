<script>
	import Dropzone from "svelte-file-dropzone";
	import FileSaver from "file-saver";

	function uint32FromUint8Array(data) {
		let dataview = new DataView(data.buffer);
		return dataview.getInt32(0, true);
	}

	function getCrxHeader(data) {
		const decoder = new TextDecoder();
		const magic = decoder.decode(data.slice(0, 4))
		const version = uint32FromUint8Array(data.slice(4, 8))
		const length = uint32FromUint8Array(data.slice(8, 12))
		const header = { magic, version, length }
		return header
	}

	let files = [];
	let fileData = [];
	function processCrx(name, data) {
		const header = getCrxHeader(data);
		var blob = new Blob([data.slice(header.length + 12)], {type: "text/plain;charset=utf-8"});
		FileSaver.saveAs(blob, name + '.zip');
  	}

	function handleFilesSelect(e) {
    	files = e.detail.acceptedFiles;
    	for (let i = 0; i < files.length; i++) {
      		const reader = new FileReader();
      		reader.onload = () => {
        		const buf = reader.result;
        		fileData = processCrx(files[i].name.slice(0, -4), new Uint8Array(buf));
			};
			console.log(reader.readAsArrayBuffer(files[i]));
    	}
  	}
</script>

<main>
	<h1>Drop a .crx below to extract</h1>
	<Dropzone 
		on:drop={handleFilesSelect}
		multiple={false}
		accept=".crx"
	>
	<p>Drop a .crx here to extract</p>
	</Dropzone>
	<p>You're welcome Teresa =)</p>
</main>

<style>
	main {
		text-align: center;
		padding: 1em;
		max-width: 240px;
		margin: 0 auto;
	}

	h1 {
		color: #ff3e00;
		text-transform: uppercase;
		font-size: 4em;
		font-weight: 100;
	}

	@media (min-width: 640px) {
		main {
			max-width: none;
		}
	}
</style>
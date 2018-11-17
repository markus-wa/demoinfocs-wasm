document.addEventListener('DOMContentLoaded', function(){ 
	document.getElementById('file').addEventListener('change', readDemo, false);
}, false);

const demoBufferSize = 1024 * 2048; // 2 MB

function readDemo (evt) {
	const reader = new FileReader();
	reader.onload = function() {
		console.log("Reading")
		const data = reader.result;
		for (offset = 0; offset < data.byteLength; offset += demoBufferSize) {
			const arr = readDataIntoBuffer(data, offset)
			if (offset + demoBufferSize <= data.byteLength) {
				arr = new Uint8Array(data, offset, demoBufferSize);
			} else {
				arr = new Uint8Array(data, offset, data.byteLength-offset);
			}
			let base64 = btoa(arr.reduce((data, byte) => (data.push(String.fromCharCode(byte)), data), []).join(''))
			writeDataAsString(base64);
		}

		console.log("Parsing")
		parseDemo()
	}
	reader.readAsArrayBuffer(evt.target.files[0])
	//reader.readAsDataURL(file)
}

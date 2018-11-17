request = new XMLHttpRequest();
request.open('GET', 'demoinfocs.wasm');
request.responseType = 'arraybuffer';
request.send();

request.onload = function() {
	var bytes = request.response;
	const go = new Go();
	WebAssembly.instantiate(bytes, go.importObject).then(result => {
		go.run(result.instance);
	});
};

const demoBufferSize = 1024 * 2048; // 2 MB

function parse() {
	const reader = new FileReader();
	reader.onload = function() {
		console.log("Reading")
		const data = reader.result;
		for (offset = 0; offset < data.byteLength; offset += demoBufferSize) {
			const arr = readDataIntoBuffer(data, offset)
			let base64 = btoa(arr.reduce((data, byte) => (data.push(String.fromCharCode(byte)), data), []).join(''))
			writeDataAsString(base64);
		}

		console.log("Parsing")
		parseDemo()
	}
	reader.readAsArrayBuffer(document.getElementById('demofile').files[0])
}

function readDataIntoBuffer(data, offset) {
	if (offset + demoBufferSize <= data.byteLength) {
		return new Uint8Array(data, offset, demoBufferSize);
	}
	return new Uint8Array(data, offset, data.byteLength-offset);
}
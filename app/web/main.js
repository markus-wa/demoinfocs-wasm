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
	console.log("Creating parser")
	newParser((parser) => {
		console.log("Parser created")
		parser.parse((kills) => {
			console.log(kills);
		});

		const reader = new FileReader();
		reader.onload = function() {
			const data = reader.result;
			for (offset = 0; offset < data.byteLength; offset += demoBufferSize) {
				const arr = readDataIntoBuffer(data, offset)
				let base64 = btoa(arr.reduce((data, byte) => (data.push(String.fromCharCode(byte)), data), []).join(''))
				parser.write(base64);
			}
			parser.close()
		}
		reader.readAsArrayBuffer(document.getElementById('demofile').files[0])
	})
}

function readDataIntoBuffer(data, offset) {
	if (offset + demoBufferSize <= data.byteLength) {
		return new Uint8Array(data, offset, demoBufferSize);
	}
	return new Uint8Array(data, offset, data.byteLength-offset);
}
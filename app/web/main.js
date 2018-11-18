const go = new Go();
WebAssembly.instantiateStreaming(fetch("demoinfocs.wasm"), go.importObject).then((result) => {
	go.run(result.instance);
});

const demoBufferSize = 1024 * 2048; // 2 MB

function parse() {
	state("Creating parser")
	newParser((parser) => {
		state("Parsing")
		parser.parse((stats) => {
			state("Done")
			displayStats(JSON.parse(stats));
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

function state(state) {
	document.getElementById('state').innerText = state;
}

function displayStats(stats) {
	const table = document.getElementById('stats');
	stats.forEach(p => {
		const row = document.createElement('tr');
		row.appendChild(td(p.name));
		row.appendChild(td(p.kills));
		row.appendChild(td(p.deaths));
		row.appendChild(td(p.assists));
		table.appendChild(row);
	});
}

function td(val) {
	const td = document.createElement('td');
	td.innerText = val;
	return td;
}
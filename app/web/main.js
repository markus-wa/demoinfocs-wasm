document.addEventListener('DOMContentLoaded', function(){
	state('init')

	const go = new Go();
	WebAssembly.instantiateStreaming(fetch("demoinfocs.wasm"), go.importObject).then((result) => {
		go.run(result.instance);
		state('ready')
	});
}, false);

const demoBufferSize = 1024 * 2048; // 2 MB

function parse() {
	state("creating parser")
	newParser((parser) => {
		state("parsing")
		console.log('parse');
		parser.parse((stats) => {
			console.log('done');
			state("done")
			displayStats(JSON.parse(stats));
		});

		const reader = new FileReader();
		reader.onload = function() {
			const data = reader.result;
			console.log('writing data');
			for (offset = 0; offset < data.byteLength; offset += demoBufferSize) {
				const arr = readDataIntoBuffer(data, offset)
				let base64 = btoa(arr.reduce((data, byte) => (data.push(String.fromCharCode(byte)), data), []).join(''))
				parser.write(base64);
			}
			console.log('closing pipe');
			parser.close();
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
	stats = stats.sort((a, b) => a.name.localeCompare(b.name)).sort((a, b) => b.kills - a.kills);
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
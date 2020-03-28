document.addEventListener('DOMContentLoaded', function () {
	state('init');

	const go = new Go();
	WebAssembly.instantiateStreaming(fetch("demoinfocs.wasm"), go.importObject).then((result) => {
		go.run(result.instance);
		state('ready')
	});
}, false);

function parseFile() {
	console.log('reading demo');
	state("reading demo");

	const reader = new FileReader();
	reader.onload = function () {
		const data = reader.result;
		const bytes = new Uint8Array(data);
		console.log('parsing');
		state("parsing");
		parse(bytes, (stats) => statsCallback(stats));
	};
	reader.readAsArrayBuffer(document.getElementById('demofile').files[0])
}

function state(state) {
	document.getElementById('state').innerText = state;
}

function statsCallback(stats) {
	console.log('displaying stats');
	displayStats(JSON.parse(stats));
	console.log('done');
	state("done");
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
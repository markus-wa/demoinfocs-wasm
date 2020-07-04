# demoinfocs-wasm example

This repo demonstrates how [demoinfocs-golang](https://github.com/markus-wa/demoinfocs-golang) can be used from JavaScript with [WebAssembly](https://webassembly.org/) (WASM).

## Interesting files

- [`app/web/index.html`](app/web/index.html) - HTML page for the UI, calls `app/web/main.js`
- [`app/web/main.js`](app/web/main.js) - JS code that calls into `app/main.go` to parse selected files and displays results
- [`app/main.go`](app/main.go) - demoinfocs-golang wrapper for WASM, exposes functions called from JS
- [`app/Dockerfile`](app/Dockerfile) - Dockerized Go runner that builds the WASM binary
- [`app/Makefile`](app/Makefile) - Makefile for building and running the demo app
- [`app/web/wasm_exec.js`](app/web/wasm_exec.js) - this file is included in your Go installation (e.g. `/usr/share/go-1.13/misc/wasm/wasm_exec.js`)

## Prerequisites

To run the example you need [`docker`](https://www.docker.com/get-started), [`docker-compose`](https://docs.docker.com/compose/install/) and [`make`](https://www.gnu.org/software/make/).

## Running the example

1. Execute `make run`<br>
   This builds and starts an [NGINX](https://nginx.org/en/) docker container with a webapp that can parse player stats from a CS:GO demo.

2. Go to `http://localhost:8080` to see the demo app.

![Demo app screenshot](https://gitlab.com/markus-wa/demoinfocs-wasm/raw/master/e2e/golden/stats.png)

## Running tests for development

To run tests the test-demo `default.dem` needs to be downloaded using [Git LFS](https://git-lfs.github.com/) first.
This can be done with `git lfs pull -I '*'`.

After this the you can run `make` for a full build including unit and end-to-end tests.

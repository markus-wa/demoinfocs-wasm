# demoinfocs-wasm example

This repo demonstrates how [demoinfocs-golang](https://github.com/markus-wa/demoinfocs-golang) can be used with [WebAssembly](https://webassembly.org/) (WASM).

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

export GO111MODULE=on
export GOARCH=wasm
export GOOS=js
export MSYS_NO_PATHCONV=1
GO=docker run -it --rm -v "$(shell pwd)/../default.dem":/usr/src/default.dem -v "$(shell pwd)":/usr/src/app -w /usr/src/app demoinfocs-wasm-go go
BINARY_NAME=demoinfocs.wasm
DOCKER_IMAGE?=demoinfocs-wasm

all: test build
test: runner
	$(GO) test -v ./...
build: runner
	$(GO) build -v -o web/$(BINARY_NAME)
runner:
	docker build . -t demoinfocs-wasm-go
nginx: build
	docker build web -t $(DOCKER_IMAGE)
run: nginx
	docker run -it --rm -p 8080:80 $(DOCKER_IMAGE)
export GO111MODULE=on
export GOARCH=wasm
export GOOS=js
BINARY_NAME=demoinfocs.wasm
DOCKER_IMAGE?=demoinfocs-wasm

all: test build
test:
	go test -v ./...
build:
	go build -o $(BINARY_NAME)
docker: build
	docker build . -t $(DOCKER_IMAGE)
run: docker
	docker run -it --rm -p 8080:80 $(DOCKER_IMAGE)
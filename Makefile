GO111MODULE=on
GOARCH=wasm
GOOS=js
BINARY_NAME=demoinfocs.wasm

all: test build docker e2e
test:
	go test -v ./...
build:
	go build -o $(BINARY_NAME)
docker:
	docker build . -t demoinfocs-wasm
e2e:
	cd e2e
	npm run test
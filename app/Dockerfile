FROM golang:1.14-alpine

ENV GOARCH wasm
ENV GOOS js
ENV PATH "$PATH:/usr/local/go/misc/wasm"

RUN apk update && apk upgrade && \
    apk add --no-cache \
      bash \
      git \
      nodejs \
      nodejs-npm

WORKDIR /usr/src/app

COPY go.* ./

RUN go mod download

COPY . .

RUN go build
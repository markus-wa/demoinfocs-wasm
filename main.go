package main

import (
	"bytes"
	"encoding/base64"
	"fmt"
	"log"
	"syscall/js"

	dem "github.com/markus-wa/demoinfocs-golang"
	events "github.com/markus-wa/demoinfocs-golang/events"
)

const (
	// WASM doesn't enjoy the big buffer sizes allocated by default
	msgQueueBufferSize = 128 * 1024
)

func main() {
	c := make(chan struct{}, 0)

	registerCallbacks()

	fmt.Println("WASM Go Initialized")

	<-c
}

func registerCallbacks() {
	js.Global().Set("writeDataAsString", js.NewCallback(writeDataAsString))
	js.Global().Set("parseDemo", js.NewCallback(parseDemo))
}

var data []byte

func writeDataAsString(str []js.Value) {
	b, err := base64.StdEncoding.DecodeString(str[0].String())
	checkError(err)
	data = append(data, b...)
}

func parseDemo(args []js.Value) {
	r := bytes.NewReader(data)
	cfg := dem.ParserConfig{
		MsgQueueBufferSize: msgQueueBufferSize,
	}
	p := dem.NewParserWithConfig(r, cfg)

	p.RegisterEventHandler(func(e events.Kill) {
		var hs string
		if e.IsHeadshot {
			hs = " (HS)"
		}
		var wallBang string
		if e.PenetratedObjects > 0 {
			wallBang = " (WB)"
		}
		fmt.Printf("%s <%s%s%s> %s\n", e.Killer.Name, e.Weapon.Weapon, hs, wallBang, e.Victim.Name)
	})

	header, err := p.ParseHeader()
	checkError(err)
	fmt.Println("Header:", header)

	err = p.ParseToEnd()
	checkError(err)
}

func checkError(err error) {
	if err != nil {
		log.Panic(err)
	}
}

package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	"log"
	"syscall/js"

	dem "github.com/markus-wa/demoinfocs-golang/v2/pkg/demoinfocs"
	common "github.com/markus-wa/demoinfocs-golang/v2/pkg/demoinfocs/common"
)

const (
	// WASM doesn't enjoy the big buffer sizes allocated by default
	msgQueueBufferSize = 128 * 1024
)

func main() {
	c := make(chan struct{}, 0)

	dem.DefaultParserConfig = dem.ParserConfig{
		MsgQueueBufferSize: msgQueueBufferSize,
	}

	registerCallbacks()

	fmt.Println("WASM Go Initialized")

	<-c
}

func registerCallbacks() {
	js.Global().Set("parse", js.FuncOf(parse))
}

func uint8ArrayToBytes(value js.Value) []byte {
	s := make([]byte, value.Get("byteLength").Int())
	js.CopyBytesToGo(s, value)
	return s
}

func parse(this js.Value, args []js.Value) interface{} {
	parseInternal(args[0], args[1])
	return nil
}

func parseInternal(data js.Value, callback js.Value) {
	b := bytes.NewBuffer(uint8ArrayToBytes(data))
	parser := dem.NewParser(b)

	header, err := parser.ParseHeader()
	checkError(err)
	// TODO: report headerpointer error
	//fmt.Println("Header:", header)
	fmt.Println("map: " + header.MapName)

	err = parser.ParseToEnd()
	checkError(err)

	fmt.Println("parsed")

	players := parser.GameState().Participants().Playing()
	var stats []playerStats
	for _, p := range players {
		stats = append(stats, statsFor(p))
	}

	bStats, err := json.Marshal(stats)
	checkError(err)

	// Return result to JS
	callback.Invoke(string(bStats))
}

type playerStats struct {
	Name    string `json:"name"`
	Kills   int    `json:"kills"`
	Deaths  int    `json:"deaths"`
	Assists int    `json:"assists"`
}

func statsFor(p *common.Player) playerStats {
	return playerStats{
		Name:    p.Name,
		Kills:   p.Kills(),
		Deaths:  p.Deaths(),
		Assists: p.Assists(),
	}
}

func checkError(err error) {
	if err != nil {
		log.Panic(err)
	}
}

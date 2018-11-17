package main

import (
	"crypto/md5"
	"encoding/base64"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"io"
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

	dem.DefaultParserConfig = dem.ParserConfig{
		MsgQueueBufferSize: msgQueueBufferSize,
	}

	registerCallbacks()

	fmt.Println("WASM Go Initialized")

	<-c
}

func registerCallbacks() {
	js.Global().Set("newParser", js.NewCallback(newParser))
}

// TODO: buffer reader/writer?

type parser struct {
	reader io.ReadCloser
	writer io.WriteCloser
}

func md5hex(b []byte) string {
	x := md5.Sum(b)
	return hex.EncodeToString(x[:])
}

func (p *parser) write(b64 string) {
	b, err := base64.StdEncoding.DecodeString(b64)
	checkError(err)

	n, err := p.writer.Write(b)
	// It's fine if there's no reader and we can't write
	if n < len(b) && err != io.ErrClosedPipe {
		checkError(err)
	}
}

func (p *parser) parse(callback js.Value) {
	defer p.reader.Close()
	parser := dem.NewParser(p.reader)

	var kills []map[string]string
	parser.RegisterEventHandler(func(e events.Kill) {
		kills = append(kills, map[string]string{
			"killer": e.Killer.Name,
			"weapon": e.Weapon.Weapon.String(),
			"victim": e.Victim.Name,
		})

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

	header, err := parser.ParseHeader()
	checkError(err)
	// TODO: report headerpointer error
	//fmt.Println("Header:", header)
	fmt.Println("Map: " + header.MapName)

	err = parser.ParseToEnd()
	checkError(err)

	fmt.Println("Parsed")

	b, err := json.Marshal(kills)
	checkError(err)

	// Return result to JS
	callback.Invoke(string(b))
}

func newParser(args []js.Value) {
	r, w := io.Pipe()
	p := &parser{
		reader: r,
		writer: w, //bufio.NewWriterSize(w, 1024*2048),
	}

	m := map[string]interface{}{
		"write": js.NewCallback(func(args []js.Value) {
			p.write(args[0].String())
		}),
		"close": js.NewCallback(func(args []js.Value) {
			w.Close()
		}),
		"parse": js.NewCallback(func(args []js.Value) {
			go p.parse(args[0])
		}),
	}

	// Callback to signal that creation finished, ready to receive data
	args[0].Invoke(m)
}

func checkError(err error) {
	if err != nil {
		log.Panic(err)
	}
}

package main

import (
	"encoding/base64"
	"fmt"
	"os"
	"sync"
	"syscall/js"
	"testing"

	require "github.com/stretchr/testify/require"
)

const demoBufferSize = 1024 * 2048 // 2 MB

func TestNewParser(t *testing.T) {
	wg := new(sync.WaitGroup)

	callback := func(args []js.Value) {
		handleResult := func(result []js.Value) {
			fmt.Println(result[0])
			fmt.Println("Finished")
			wg.Done()
		}

		parser := args[0]
		parser.Call("parse", js.ValueOf(js.NewCallback(handleResult)))

		f, err := os.Open("../default.dem")
		require.Nil(t, err)

		b := make([]byte, demoBufferSize)
		n := demoBufferSize
		for n == demoBufferSize {
			n, err = f.Read(b)
			require.Nil(t, err)
			parser.Call("write", js.ValueOf(base64.StdEncoding.EncodeToString(b)))
		}

		parser.Call("close")
	}

	wg.Add(1)

	newParser([]js.Value{js.ValueOf(js.NewCallback(callback))})

	wg.Wait()
}

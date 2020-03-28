package main

import (
	"fmt"
	"io/ioutil"
	"os"
	"sync"
	"syscall/js"
	"testing"

	"github.com/stretchr/testify/require"
)

func TestParse(t *testing.T) {
	wg := new(sync.WaitGroup)

	handleResult := func(this js.Value, result []js.Value) interface{} {
		// println is a blocking call, so it can't be directly used in a callback
		// using it in a separate goroutine works https://github.com/golang/go/issues/38129
		go func() {
			fmt.Println("finished")
			fmt.Println("stats:", result[0])
			wg.Done()
		}()

		return nil
	}
	handleResultJS := js.ValueOf(js.FuncOf(handleResult))

	f, err := os.Open("../default.dem")
	require.Nil(t, err)

	b, err := ioutil.ReadAll(f)
	require.Nil(t, err)

	bJS := js.Global().Get("Uint8Array").New(len(b))
	js.CopyBytesToJS(bJS, b)

	wg.Add(1)

	parse(js.Null(), []js.Value{bJS, handleResultJS})

	wg.Wait()
}

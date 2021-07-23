package main

import (
	"io/ioutil"
	"log"
	"os"

	"github.com/samuelventura/athasha/abe/pkg/art"
)

//use https://github.com/spf13/cobra
func main() {
	log.SetFlags(log.Ldate | log.Lmicroseconds)
	// pwd, err := os.Getwd()
	// panicIfError(err)
	// log.Println("pwd:", pwd)
	path := os.Args[1]
	src, err := ioutil.ReadFile(path)
	panicIfError(err)
	babel := art.NewBabel()
	res, err := babel.Transform(path, string(src))
	panicIfError(err)
	//fmt.Println(res.Code, res.Smap)
	rt := art.NewRuntime()
	rt.ConsoleToStdout()
	err = rt.RunString(res.Code)
	panicIfError(err)
}

func panicIfError(err error) {
	if err != nil {
		panic(err)
	}
}

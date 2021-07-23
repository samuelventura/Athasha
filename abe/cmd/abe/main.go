package main

import (
	"log"
	"os"
	"os/signal"
	"path/filepath"

	"github.com/samuelventura/athasha/abe/pkg/abe"
)

func main() {
	ctrlc := make(chan os.Signal, 1)
	signal.Notify(ctrlc, os.Interrupt)
	log.SetFlags(log.Ldate | log.Lmicroseconds)
	var db = relative("db3")
	var dao = abe.NewDao(db)
	var state = abe.NewState(dao)
	var hub = abe.NewHub(state)
	var core = abe.NewCore(hub)
	defer core.Close()
	var entry = abe.NewEntry(core, 5001)
	defer entry.Close()
	log.Println("Port", entry.Port())
	log.Println("Pid", os.Getpid())
	log.Println("Exe", executable())
	log.Println("Db", db)
	log.Println("Press Ctrl+C to quit")
	<-ctrlc
}

func executable() string {
	exe, err := os.Executable()
	panicIfError(err)
	return exe
}

func relative(ext string) string {
	exe := executable()
	dir := filepath.Dir(exe)
	base := filepath.Base(exe)
	file := base + "." + ext
	return filepath.Join(dir, file)
}

func panicIfError(err error) {
	if err != nil {
		panic(err)
	}
}

package main

import (
	"fmt"
	"log"
	"os"
	"path/filepath"

	"github.com/samuelventura/athasha/nbe/pkg/aenbe"
)

func main() {
	log.SetFlags(log.Ldate | log.Lmicroseconds)
	var db = relative("db3")
	var dao = aenbe.NewDao(db)
	var state = aenbe.NewState(dao)
	var hub = aenbe.NewHub(state)
	var core = aenbe.NewCore(hub)
	defer core.Close()
	var entry = aenbe.NewEntry(core, 5001)
	defer entry.Close()
	log.Println("Port", entry.Port())
	log.Println("Pid", os.Getpid())
	log.Println("Exe", executable())
	log.Println("Db", db)
	log.Println("Press Enter to quit")
	fmt.Scanln()
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

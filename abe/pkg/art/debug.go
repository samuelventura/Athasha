package art

import (
	"log"
	"runtime/debug"
)

var traceEnabled = true

func EnableTrace(enable bool) {
	traceEnabled = enable
}

func trace(args ...interface{}) {
	if traceEnabled {
		log.Println(args...)
	}
}

func recoverAndLogPanic() {
	if r := recover(); r != nil {
		trace(r, string(debug.Stack()))
	}
}

func panicIfError(err error) {
	if err != nil {
		panic(err)
	}
}

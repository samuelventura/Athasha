package art

import (
	_ "embed"
	"log"

	"github.com/dop251/goja"
)

type runtimeDso struct {
	vm *goja.Runtime
}

type Runtime interface {
	SetConsole(log func(string, goja.FunctionCall) goja.Value)
	RunString(src string) (err error)
	ConsoleToStdout()
}

func NewRuntime() Runtime {
	rt := &runtimeDso{}
	rt.vm = goja.New()
	return rt
}

func (rt *runtimeDso) SetConsole(log func(string, goja.FunctionCall) goja.Value) {
	rt.vm.Set("console", map[string]func(goja.FunctionCall) goja.Value{
		"log":   func(fcall goja.FunctionCall) goja.Value { return log("log", fcall) },
		"error": func(fcall goja.FunctionCall) goja.Value { return log("error", fcall) },
		"warn":  func(fcall goja.FunctionCall) goja.Value { return log("warn", fcall) },
	})
}

func (rt *runtimeDso) RunString(src string) (err error) {
	_, err = rt.vm.RunString(src)
	return
}

func (rt *runtimeDso) ConsoleToStdout() {
	rt.SetConsole(func(level string, fcall goja.FunctionCall) goja.Value {
		args := make([]interface{}, 0, len(fcall.Arguments)+1)
		args = append(args, level)
		for _, arg := range fcall.Arguments {
			args = append(args, arg)
		}
		log.Fatalln(args...)
		return nil
	})
}

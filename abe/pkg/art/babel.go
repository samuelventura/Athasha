package art

import (
	_ "embed"

	"github.com/dop251/goja"
)

//go:embed babel.js
var babeljs string

type babelDso struct {
	prog      *goja.Program
	vm        *goja.Runtime
	transform func(src string, opts map[string]interface{}) (goja.Value, error)
}

type Babel interface {
	Clone() Babel
	Transform(src string, opts map[string]interface{}) (string, error)
}

func NewBabel() Babel {
	babel := &babelDso{}
	babel.prog = CompileBabel()
	babel.vm = goja.New()
	babel.transform = LoadBabel(babel.vm, babel.prog)
	return babel
}

func (babel *babelDso) Clone() Babel {
	clone := &babelDso{}
	clone.prog = babel.prog
	clone.vm = goja.New()
	clone.transform = LoadBabel(clone.vm, clone.prog)
	return clone
}

func (babel *babelDso) Transform(src string, opts map[string]interface{}) (code string, err error) {
	value, err := babel.transform(src, opts)
	if err != nil {
		return
	}
	// babel.transform("code();", options, function(err, result) {
	// 	result.code;
	// 	result.map;
	// 	result.ast;
	// });
	code = value.ToObject(babel.vm).Get("code").String()
	return
}

func CompileBabel() (prog *goja.Program) {
	prog, err := goja.Compile("babel.js", babeljs, false)
	panicIfError(err)
	return
}

func LoadBabel(vm *goja.Runtime, prog *goja.Program) func(string, map[string]interface{}) (goja.Value, error) {
	log := func(goja.FunctionCall) goja.Value { return nil }
	vm.Set("console", map[string]func(goja.FunctionCall) goja.Value{
		"log":   log,
		"error": log,
		"warn":  log,
	})
	_, err := vm.RunProgram(prog)
	panicIfError(err)
	var transform goja.Callable
	babel := vm.Get("Babel")
	err = vm.ExportTo(babel.ToObject(vm).Get("transform"), &transform)
	panicIfError(err)
	return func(src string, opts map[string]interface{}) (goja.Value, error) {
		return transform(babel, vm.ToValue(src), vm.ToValue(opts))
	}
}

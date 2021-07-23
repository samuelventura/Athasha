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
	opts      map[string]interface{}
	transform func(src string, opts map[string]interface{}) (goja.Value, error)
}

type BabelResult struct {
	Code string
	Smap map[string]interface{}
}

type Babel interface {
	Clone() Babel
	Transform(file string, src string) (BabelResult, error)
	GetOptions() map[string]interface{}
	SetOptions(map[string]interface{})
}

func NewBabel() Babel {
	babel := &babelDso{}
	babel.prog = CompileBabel()
	babel.vm = goja.New()
	babel.transform = LoadBabel(babel.vm, babel.prog)
	babel.opts = map[string]interface{}{
		"presets": []string{
			"env",
		},
		"sourceMaps": "both",
	}
	return babel
}

func (babel *babelDso) GetOptions() map[string]interface{} {
	return babel.opts
}

func (babel *babelDso) SetOptions(opts map[string]interface{}) {
	babel.opts = opts
}

func (babel *babelDso) Clone() Babel {
	clone := &babelDso{}
	clone.prog = babel.prog
	clone.vm = goja.New()
	clone.transform = LoadBabel(clone.vm, clone.prog)
	clone.opts = babel.opts
	return clone
}

func (babel *babelDso) Transform(file string, src string) (res BabelResult, err error) {
	opts := babel.opts
	opts["sourceFileName"] = file
	value, err := babel.transform(src, opts)
	if err != nil {
		return
	}
	// babel.transform("code();", options, function(err, result) {
	// 	result.code;
	// 	result.map;
	// 	result.ast;
	// });
	vo := value.ToObject(babel.vm)
	res = BabelResult{}
	res.Code = vo.Get("code").String()
	res.Smap = vo.Get("map").Export().(map[string]interface{})
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

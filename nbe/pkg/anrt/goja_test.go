package anrt

import (
	"io/ioutil"
	"log"
	"math"
	"reflect"
	"strings"
	"testing"

	"github.com/dop251/goja"
	babel "github.com/jvatic/goja-babel"
	"github.com/stretchr/testify/assert"
)

//https://babeljs.io
//https://github.com/jvatic/goja-babel
func TestGojaBabel(t *testing.T) {
	plugins := map[string]interface{}{
		"plugins": []string{
			"transform-react-jsx",
			"transform-block-scoping",
		},
	}
	res, err := babel.Transform(strings.NewReader(`
	let a = 0
	`), plugins)
	panicIfError(err)
	log.Println(res, reflect.TypeOf(res))
	bytes, err := ioutil.ReadAll(res)
	panicIfError(err)
	log.Println(string(bytes))
}

//https://pkg.go.dev/github.com/dop251/goja
//https://github.com/dop251/goja
func TestGojaDataTypes(t *testing.T) {
	vm := goja.New()
	v, err := vm.RunString(`v = {
		id:0, 
		name:'name', 
		amount:0.1, 
		enabled: true, 
		k_undef: undefined, 
		k_null: null, 
		nan: NaN, 
		inf_p: Infinity,
		inf_n: -Infinity,
		array: [0],
		fn: function() {},
	}`)
	panicIfError(err)
	e := v.Export()
	log.Println(v, e, reflect.TypeOf(e))
	m := e.(map[string]interface{})
	for mk, mv := range m {
		log.Println(mk, reflect.TypeOf(mv), mv)
	}
	assert.Equal(t, int64(0), m["id"])
	assert.Equal(t, "name", m["name"])
	assert.Equal(t, float64(0.1), m["amount"])
	assert.Equal(t, true, m["enabled"])
	assert.Equal(t, nil, m["k_undef"])
	assert.Equal(t, nil, m["k_null"])
	assert.Equal(t, true, math.IsNaN(m["nan"].(float64)))
	assert.Equal(t, true, math.IsInf(m["inf_p"].(float64), 1))
	assert.Equal(t, true, math.IsInf(m["inf_n"].(float64), -1))
	assert.Equal(t, []interface{}{int64(0)}, m["array"])
	fn := func(goja.FunctionCall) goja.Value { return vm.ToValue(0) }
	assert.Equal(t, reflect.TypeOf(fn), reflect.TypeOf(m["fn"]))
	assert.Equal(t, math.Inf(1), math.Inf(1))
	assert.Equal(t, math.Inf(-1), math.Inf(-1))
	//always different
	assert.NotEqual(t, math.NaN(), math.NaN())
}

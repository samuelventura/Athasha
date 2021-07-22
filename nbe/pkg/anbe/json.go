package anbe

import (
	"encoding/json"
	"fmt"
	"math/bits"
	"strconv"
)

func decodeMutation(bytes []byte) (mut *Mutation, err error) {
	mut = &Mutation{}
	var mmi interface{}
	err = json.Unmarshal(bytes, &mmi)
	if err != nil {
		return
	}
	mm := mmi.(map[string]interface{})
	mut.Name = mm["name"].(string)
	switch mut.Name {
	case "all":
		argm := mm["args"].(map[string]interface{})
		args := &AllArgs{}
		files := argm["files"].([]interface{})
		args.Files = make([]*OneArgs, 0, len(files))
		for _, fmi := range files {
			fm := fmi.(map[string]interface{})
			carg := &OneArgs{}
			carg.Id = parseUint(fm["id"])
			carg.Name = fm["name"].(string)
			carg.Enabled = fm["enabled"].(bool)
			args.Files = append(args.Files, carg)
		}
		mut.Args = args
	case "one":
		argm := mm["args"].(map[string]interface{})
		args := &OneArgs{}
		args.Id = parseUint(argm["id"])
		args.Name = argm["name"].(string)
		args.Data = argm["data"].(string)
		args.Enabled = argm["enabled"].(bool)
		mut.Args = args
	case "create":
		argm := mm["args"].(map[string]interface{})
		args := &CreateArgs{}
		args.Id = maybeUint(argm["id"])
		args.Name = argm["name"].(string)
		args.Data = argm["data"].(string)
		mut.Args = args
	case "delete":
		argm := mm["args"].(map[string]interface{})
		args := &DeleteArgs{}
		args.Id = parseUint(argm["id"])
		mut.Args = args
		mut.Fid = args.Id
	case "rename":
		argm := mm["args"].(map[string]interface{})
		args := &RenameArgs{}
		args.Id = parseUint(argm["id"])
		args.Name = argm["name"].(string)
		mut.Args = args
		mut.Fid = args.Id
	case "update":
		argm := mm["args"].(map[string]interface{})
		args := &UpdateArgs{}
		args.Id = parseUint(argm["id"])
		args.Data = argm["data"].(string)
		mut.Args = args
		mut.Fid = args.Id
	case "enable":
		argm := mm["args"].(map[string]interface{})
		args := &EnableArgs{}
		args.Id = parseUint(argm["id"])
		args.Enabled = argm["enabled"].(bool)
		mut.Args = args
		mut.Fid = args.Id
	default:
		err = fmt.Errorf("unkown mutation %s", mut.Name)
	}
	return
}

func maybeUint(id interface{}) uint {
	switch v := id.(type) {
	case float64:
		return uint(v)
	default:
		return 0
	}
}

func parseUint(id interface{}) uint {
	switch v := id.(type) {
	case float64:
		return uint(v)
	case string:
		id, err := strconv.ParseUint(v, 10, bits.UintSize)
		panicIfError(err)
		return uint(id)
	default:
		return 0
	}
}

func encodeMutation(mutation *Mutation) []byte {
	mm := make(map[string]interface{})
	mm["name"] = mutation.Name
	mm["session"] = mutation.Session
	args, err := encodeArgs(mutation.Name, mutation.Args)
	panicIfError(err)
	mm["args"] = args
	bytes, err := json.Marshal(mm)
	panicIfError(err)
	return bytes
}

func encodeArgs(name string, argi interface{}) (argm map[string]interface{}, err error) {
	switch name {
	case "all":
		args := argi.(*AllArgs)
		argm = make(map[string]interface{})
		files := make([]map[string]interface{}, 0, len(args.Files))
		for _, file := range args.Files {
			fm := make(map[string]interface{})
			fm["id"] = file.Id
			fm["name"] = file.Name
			fm["enabled"] = file.Enabled
			files = append(files, fm)
		}
		argm["files"] = files
	case "one":
		args := argi.(*OneArgs)
		argm = make(map[string]interface{})
		argm["id"] = args.Id
		argm["name"] = args.Name
		argm["data"] = args.Data
		argm["enabled"] = args.Enabled
	case "create":
		args := argi.(*CreateArgs)
		argm = make(map[string]interface{})
		argm["id"] = args.Id
		argm["name"] = args.Name
		argm["data"] = args.Data
	case "delete":
		args := argi.(*DeleteArgs)
		argm = make(map[string]interface{})
		argm["id"] = args.Id
	case "rename":
		args := argi.(*RenameArgs)
		argm = make(map[string]interface{})
		argm["id"] = args.Id
		argm["name"] = args.Name
	case "update":
		args := argi.(*UpdateArgs)
		argm = make(map[string]interface{})
		argm["id"] = args.Id
		argm["data"] = args.Data
	case "enable":
		args := argi.(*EnableArgs)
		argm = make(map[string]interface{})
		argm["id"] = args.Id
		argm["enabled"] = args.Enabled
	default:
		err = fmt.Errorf("unkown mutation %s", name)
	}
	return
}

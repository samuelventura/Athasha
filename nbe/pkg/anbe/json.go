package anbe

import (
	"encoding/json"
	"fmt"
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
	case "init":
		argm := mm["args"].(map[string]interface{})
		args := &InitArgs{}
		files := argm["files"].([]interface{})
		args.Files = make([]*CreateArgs, 0, len(files))
		for _, fmi := range files {
			fm := fmi.(map[string]interface{})
			carg := &CreateArgs{}
			carg.Id = uint(fm["id"].(float64))
			carg.Name = fm["name"].(string)
			carg.Mime = fm["mime"].(string)
			args.Files = append(args.Files, carg)
		}
		mut.Args = args
	case "create":
		argm := mm["args"].(map[string]interface{})
		args := &CreateArgs{}
		args.Id = decodeId(argm["id"])
		args.Name = argm["name"].(string)
		args.Mime = argm["mime"].(string)
		mut.Args = args
	case "delete":
		argm := mm["args"].(map[string]interface{})
		args := &DeleteArgs{}
		args.Id = uint(argm["id"].(float64))
		mut.Args = args
	case "rename":
		argm := mm["args"].(map[string]interface{})
		args := &RenameArgs{}
		args.Id = uint(argm["id"].(float64))
		args.Name = argm["name"].(string)
		mut.Args = args
	default:
		err = fmt.Errorf("unkown mutation %s", mut.Name)
	}
	return
}

func decodeId(id interface{}) uint {
	switch v := id.(type) {
	case float64:
		return uint(v)
	default:
		return 0
	}
}

func encodeMutation(mutation *Mutation) []byte {
	mm := make(map[string]interface{})
	mm["name"] = mutation.Name
	mm["origin"] = mutation.Origin
	args, err := encodeArgs(mutation.Name, mutation.Args)
	panicIfError(err)
	mm["args"] = args
	bytes, err := json.Marshal(mm)
	panicIfError(err)
	return bytes
}

func encodeArgs(name string, argi interface{}) (argm map[string]interface{}, err error) {
	switch name {
	case "init":
		args := argi.(*InitArgs)
		argm = make(map[string]interface{})
		files := make([]map[string]interface{}, 0, len(args.Files))
		for _, file := range args.Files {
			fm := make(map[string]interface{})
			fm["id"] = file.Id
			fm["name"] = file.Name
			fm["mime"] = file.Mime
			files = append(files, fm)
		}
		argm["files"] = files
	case "create":
		args := argi.(*CreateArgs)
		argm = make(map[string]interface{})
		argm["id"] = args.Id
		argm["name"] = args.Name
		argm["mime"] = args.Mime
	case "delete":
		args := argi.(*DeleteArgs)
		argm = make(map[string]interface{})
		argm["id"] = args.Id
	case "rename":
		args := argi.(*RenameArgs)
		argm = make(map[string]interface{})
		argm["id"] = args.Id
		argm["name"] = args.Name
	default:
		err = fmt.Errorf("unkown mutation %s", name)
	}
	return
}

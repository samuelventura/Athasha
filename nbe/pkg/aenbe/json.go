package aenbe

import (
	"encoding/json"
	"fmt"
)

func decodeMutation(bytes []byte) (mut *Mutation, err error) {
	mut = &Mutation{}
	var raw interface{}
	err = json.Unmarshal(bytes, &raw)
	if err != nil {
		return
	}
	dict := raw.(map[string]interface{})
	mut.Name = dict["name"].(string)
	switch mut.Name {
	case "init":
		argm := dict["args"].(map[string]interface{})
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
		argm := dict["args"].(map[string]interface{})
		args := &CreateArgs{}
		args.Id = uint(argm["id"].(float64))
		args.Name = argm["name"].(string)
		args.Mime = argm["mime"].(string)
		mut.Args = args
	case "delete":
		argm := dict["args"].(map[string]interface{})
		args := &DeleteArgs{}
		args.Id = uint(argm["id"].(float64))
		mut.Args = args
	case "rename":
		argm := dict["args"].(map[string]interface{})
		args := &RenameArgs{}
		args.Id = uint(argm["id"].(float64))
		args.Name = argm["name"].(string)
		mut.Args = args
	default:
		err = fmt.Errorf("unkown mutation %s", mut.Name)
	}
	return
}

func encodeMutation(mutation *Mutation) []byte {
	mut := make(map[string]interface{})
	mut["name"] = mutation.Name
	mut["origin"] = mutation.Origin
	args, err := encodeArgs(mutation.Name, mutation.Args)
	panicIfError(err)
	mut["args"] = args
	bytes, err := json.Marshal(mut)
	panicIfError(err)
	return bytes
}

func encodeArgs(name string, args interface{}) (argm map[string]interface{}, err error) {
	switch name {
	case "init":
		dto := args.(*InitArgs)
		argm = make(map[string]interface{})
		files := make([]map[string]interface{}, 0, len(dto.Files))
		for _, file := range dto.Files {
			fm := make(map[string]interface{})
			fm["id"] = file.Id
			fm["name"] = file.Name
			fm["mime"] = file.Mime
			files = append(files, fm)
		}
		argm["files"] = files
	case "create":
		dto := args.(*CreateArgs)
		argm = make(map[string]interface{})
		argm["id"] = dto.Id
		argm["name"] = dto.Name
		argm["mime"] = dto.Mime
	case "delete":
		dto := args.(*DeleteArgs)
		argm = make(map[string]interface{})
		argm["id"] = dto.Id
	case "rename":
		dto := args.(*RenameArgs)
		argm = make(map[string]interface{})
		argm["id"] = dto.Id
		argm["name"] = dto.Name
	default:
		err = fmt.Errorf("unkown mutation %s", name)
	}
	return
}

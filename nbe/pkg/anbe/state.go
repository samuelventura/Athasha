package anbe

import (
	"fmt"
)

type State interface {
	All() *AllArgs
	One(id uint) *OneArgs
	Apply(mutation *Mutation) error
	Close()
}

type stateDso struct {
	dao   Dao
	files map[uint]*FileDro
}

func NewState(dao Dao) State {
	state := &stateDso{}
	state.dao = dao
	state.files = make(map[uint]*FileDro)
	for _, file := range state.dao.All() {
		clone := file
		state.files[file.ID] = &clone
	}
	return state
}

func (state *stateDso) Close() {
	state.dao.Close()
}

func (state *stateDso) Apply(mutation *Mutation) error {
	switch mutation.Name {
	case "rename":
		return state.applyRename(mutation.Args.(*RenameArgs))
	case "create":
		return state.applyCreate(mutation.Args.(*CreateArgs))
	case "delete":
		return state.applyDelete(mutation.Args.(*DeleteArgs))
	case "update":
		return state.applyUpdate(mutation.Args.(*UpdateArgs))
	}
	return fmt.Errorf("unknown mutation %v", mutation.Name)
}

func (state *stateDso) All() *AllArgs {
	all := &AllArgs{}
	all.Files = make([]*CreateArgs, 0, len(state.files))
	for _, file := range state.files {
		mut := &CreateArgs{}
		mut.Id = file.ID
		mut.Name = file.Name
		mut.Mime = file.Mime
		all.Files = append(all.Files, mut)
	}
	return all
}

func (state *stateDso) One(id uint) *OneArgs {
	file, ok := state.files[id]
	mut := &OneArgs{}
	if ok {
		mut.Id = file.ID
		mut.Name = file.Name
		mut.Mime = file.Mime
		mut.Data = file.Data
	}
	return mut
}

func (state *stateDso) applyCreate(args *CreateArgs) error {
	file := state.dao.Create(args.Name, args.Mime)
	state.files[file.ID] = file
	args.Id = file.ID
	return nil
}

func (state *stateDso) applyRename(args *RenameArgs) error {
	if _, ok := state.files[args.Id]; !ok {
		return fmt.Errorf("unknown file %v", args.Id)
	}
	file := state.dao.Rename(args.Id, args.Name)
	state.files[file.ID] = file
	return nil
}

func (state *stateDso) applyDelete(args *DeleteArgs) error {
	if _, ok := state.files[args.Id]; !ok {
		return fmt.Errorf("unknown file %v", args.Id)
	}
	state.dao.Delete(args.Id)
	delete(state.files, args.Id)
	return nil
}

func (state *stateDso) applyUpdate(args *UpdateArgs) error {
	if _, ok := state.files[args.Id]; !ok {
		return fmt.Errorf("unknown file %v", args.Id)
	}
	file := state.dao.Update(args.Id, args.Data)
	state.files[file.ID] = file
	return nil
}

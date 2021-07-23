package abe

type Mutation struct {
	Sid     uint
	Session string
	Fid     uint
	Name    string
	Args    interface{}
	Pin     []byte
	Pout    []byte
}

type AllArgs struct {
	Files []*OneArgs
}

type OneArgs struct {
	Id      uint
	Name    string
	Data    string
	Enabled bool
}

type CreateArgs struct {
	Id   uint
	Name string
	Data string
}

type DeleteArgs struct {
	Id uint
}

type RenameArgs struct {
	Id   uint
	Name string
}

type UpdateArgs struct {
	Id   uint
	Data string
}

type EnableArgs struct {
	Id      uint
	Enabled bool
}

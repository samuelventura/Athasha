package anbe

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
	Mime    string
	Data    string
	Version uint
	Enabled bool
}

type CreateArgs struct {
	Id   uint
	Name string
	Mime string
}

type DeleteArgs struct {
	Id uint
}

type RenameArgs struct {
	Id   uint
	Name string
}

type UpdateArgs struct {
	Id      uint
	Data    string
	Version uint
}

type EnableArgs struct {
	Id      uint
	Enabled bool
}

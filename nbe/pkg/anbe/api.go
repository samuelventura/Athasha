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
	Files []*CreateArgs
}

type OneArgs struct {
	Id   uint
	Name string
	Mime string
	Data string
}

type UpdateArgs struct {
	Id   uint
	Data string
}

type CreateArgs struct {
	Id   uint
	Name string
	Mime string
}

type RenameArgs struct {
	Id   uint
	Name string
}

type DeleteArgs struct {
	Id uint
}

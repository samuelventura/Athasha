package anbe

type Mutation struct {
	Origin string
	Name   string
	Args   interface{}
}

type InitArgs struct {
	Files []*CreateArgs
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

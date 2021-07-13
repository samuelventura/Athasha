package anbe

import (
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestStateCrud(t *testing.T) {
	var dao = NewDao(":memory:")
	var state = NewState(dao)
	assert.Equal(t, 0, len(state.All().Files))
	f1 := &CreateArgs{Name: "name1", Mime: "mime1"}
	err := state.Apply(&Mutation{Name: "create", Args: f1})
	panicIfError(err)
	assert.Less(t, uint(0), f1.Id)
	assert.Equal(t, 1, len(state.All().Files))
	f2 := &CreateArgs{Name: "name2", Mime: "mime2"}
	err = state.Apply(&Mutation{Name: "create", Args: f2})
	panicIfError(err)
	assert.Less(t, uint(0), f2.Id)
	assert.Equal(t, 2, len(state.All().Files))
	err = state.Apply(&Mutation{Name: "delete", Args: &DeleteArgs{f2.Id}})
	panicIfError(err)
	assert.Equal(t, 1, len(state.All().Files))
	err = state.Apply(&Mutation{Name: "rename", Args: &RenameArgs{Id: f1.Id, Name: "name"}})
	panicIfError(err)
	assert.Equal(t, "name", state.All().Files[0].Name)
}

func TestStateDeleteError(t *testing.T) {
	var dao = NewDao(":memory:")
	var state = NewState(dao)
	err := state.Apply(&Mutation{Name: "delete", Args: &DeleteArgs{0}})
	assert.NotNil(t, err)
}

func TestStateRenameError(t *testing.T) {
	var dao = NewDao(":memory:")
	var state = NewState(dao)
	err := state.Apply(&Mutation{Name: "rename", Args: &RenameArgs{Id: 0}})
	assert.NotNil(t, err)
}

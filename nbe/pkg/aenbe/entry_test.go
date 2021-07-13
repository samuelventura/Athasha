package aenbe

import (
	"fmt"
	"testing"
	"time"

	"github.com/stretchr/testify/assert"
	"golang.org/x/net/websocket"
)

func TestEntry(t *testing.T) {
	var dao = NewDao(":memory:")
	var state = NewState(dao)
	var hub = NewHub(state)
	var core = NewCore(hub)
	var entry = NewEntry(core, 0)
	defer entry.Close()
	trace("Entry port", entry.Port())
	conn := connect(entry.Port())
	trace("Client", conn.LocalAddr())
	init := readMutation(conn)
	assert.Equal(t, "init", init.Name)
	assert.Equal(t, 0, len(init.Args.(*InitArgs).Files))
	postCreate(conn, "name1", "mime1")
	create1 := readMutation(conn)
	trace("create1", create1)
	assert.Equal(t, "create", create1.Name)
	assert.Equal(t, "name1", create1.Args.(*CreateArgs).Name)
	assert.Equal(t, "mime1", create1.Args.(*CreateArgs).Mime)
	postCreate(conn, "name2", "mime2")
	create2 := readMutation(conn)
	trace("create2", create2)
	assert.Equal(t, "create", create2.Name)
	assert.Equal(t, "name2", create2.Args.(*CreateArgs).Name)
	assert.Equal(t, "mime2", create2.Args.(*CreateArgs).Mime)
	postDelete(conn, create2.Args.(*CreateArgs).Id)
	delete := readMutation(conn)
	trace("delete", delete)
	assert.Equal(t, "delete", delete.Name)
	assert.Equal(t, create2.Args.(*CreateArgs).Id, delete.Args.(*DeleteArgs).Id)
	postRename(conn, create1.Args.(*CreateArgs).Id, "name")
	rename := readMutation(conn)
	trace("rename", rename)
	assert.Equal(t, "rename", rename.Name)
	assert.Equal(t, create1.Args.(*CreateArgs).Id, rename.Args.(*RenameArgs).Id)
	assert.Equal(t, "name", rename.Args.(*RenameArgs).Name)
}

func connect(port int) *websocket.Conn {
	origin := "http://localhost/"
	url := fmt.Sprintf("ws://localhost:%v/ws/index", port)
	conn, err := websocket.Dial(url, "", origin)
	panicIfError(err)
	return conn
}

func readMutation(conn *websocket.Conn) *Mutation {
	bytes := make([]byte, 1024)
	conn.SetReadDeadline(time.Now().Add(time.Millisecond * 400))
	n, err := conn.Read(bytes)
	panicIfError(err)
	mut, err := decodeMutation(bytes[:n])
	panicIfError(err)
	trace("readMutation", mut)
	return mut
}

func postCreate(conn *websocket.Conn, name string, mime string) {
	args := &CreateArgs{}
	args.Name = name
	args.Mime = mime
	mut := &Mutation{Name: "create", Args: args}
	bytes := encodeMutation(mut)
	_, err := conn.Write(bytes)
	panicIfError(err)
}

func postDelete(conn *websocket.Conn, id uint) {
	args := &DeleteArgs{}
	args.Id = id
	mut := &Mutation{Name: "delete", Args: args}
	bytes := encodeMutation(mut)
	_, err := conn.Write(bytes)
	panicIfError(err)
}

func postRename(conn *websocket.Conn, id uint, name string) {
	args := &RenameArgs{}
	args.Id = id
	args.Name = name
	mut := &Mutation{Name: "rename", Args: args}
	bytes := encodeMutation(mut)
	_, err := conn.Write(bytes)
	panicIfError(err)
}

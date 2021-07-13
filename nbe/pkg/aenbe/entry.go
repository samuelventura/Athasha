package aenbe

import (
	"fmt"
	"net"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/websocket/v2"
)

type Entry interface {
	Port() int
	Close()
}

type entryDso struct {
	port     int
	hub      Hub
	listener net.Listener
	app      *fiber.App
}

type clientDso struct {
	hub    Hub
	conn   *websocket.Conn
	origin string
}

func NewEntry(hub Hub, port int) Entry {
	listener, err := net.Listen("tcp", fmt.Sprintf(":%d", port))
	panicIfError(err)
	entry := &entryDso{}
	entry.hub = hub
	entry.listener = listener
	entry.port = listener.Addr().(*net.TCPAddr).Port
	entry.app = fiber.New()
	entry.app.Get("/ws/index", websocket.New(entry.loop))
	go entry.listen()
	return entry
}

func (entry *entryDso) Port() int {
	return entry.port
}

func (entry *entryDso) Close() {
	//hub may have multiple entries
	defer entry.listener.Close()
	err := entry.app.Shutdown()
	panicIfError(err)
}

func (entry *entryDso) listen() {
	defer recoverAndLogPanic()
	defer entry.listener.Close()
	err := entry.app.Listener(entry.listener)
	panicIfError(err)
}

func (entry *entryDso) loop(conn *websocket.Conn) {
	client := &clientDso{}
	client.hub = entry.hub
	client.conn = conn
	client.origin = conn.RemoteAddr().String()
	client.loop()
}

func (client *clientDso) loop() {
	id := client.hub.NextId()
	output := make(chan *Mutation)
	defer recoverAndLogPanic()
	defer client.conn.Close()
	defer client.hub.Unsubscribe(id)
	client.hub.Subscribe(id, func(mutation *Mutation) {
		switch mutation.Name {
		case "init", "create", "delete", "rename":
			output <- mutation
		default:
			close(output)
		}
	})
	go client.reader(id)
	for mutation := range output {
		trace("encodeMutation", mutation)
		bytes := encodeMutation(mutation)
		err := client.conn.WriteMessage(websocket.TextMessage, bytes)
		panicIfError(err)
	}
}

func (client *clientDso) reader(id string) {
	defer recoverAndLogPanic()
	defer client.conn.Close()
	defer client.hub.Unsubscribe(id)
	for {
		mt, msg, err := client.conn.ReadMessage()
		if err != nil {
			trace("conn.ReadMessage", err)
			return
		}
		if websocket.TextMessage != mt {
			trace("websocket.TextMessage !=", mt)
			return
		}
		//may throw on invalid json format
		mutation, err := decodeMutation(msg)
		if err != nil {
			trace("decodeMutation", err)
			return
		}
		mutation.Origin = client.origin
		client.hub.Apply(mutation)
	}
}

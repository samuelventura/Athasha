package anbe

import (
	"fmt"
	"math/bits"
	"net"
	"strconv"

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
	fid    uint
	sid    string
	hub    Hub
	conn   *websocket.Conn
	output chan *Mutation
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
	entry.app.Get("/ws/edit/:id", websocket.New(entry.loop))
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
	defer recoverAndLogPanic()
	defer conn.Close()
	id := entry.hub.NextId()
	ipp := conn.RemoteAddr().String()
	fids := conn.Params("id", "0")
	fid, err := strconv.ParseUint(fids, 10, bits.UintSize)
	panicIfError(err)
	client := &clientDso{}
	client.hub = entry.hub
	client.conn = conn
	client.sid = fmt.Sprintf("%v_%v", id, ipp)
	client.fid = uint(fid)
	client.output = make(chan *Mutation)
	defer client.wait()
	client.loop()
}

func (client *clientDso) loop() {
	defer client.hub.Unsubscribe(client.sid)
	client.hub.Subscribe(client.sid, client.fid, client.writer)
	go client.reader()
	for mutation := range client.output {
		bytes := encodeMutation(mutation)
		err := client.conn.WriteMessage(websocket.TextMessage, bytes)
		panicIfError(err)
	}
}

func (client *clientDso) wait() {
	for range client.output {
	}
}

func (client *clientDso) writer(mutation *Mutation) {
	switch mutation.Name {
	case "all", "create", "delete", "rename":
		client.output <- mutation
	case "one", "update":
		client.output <- mutation
	case "unsub", "close":
		close(client.output)
	default:
		close(client.output)
	}
}

func (client *clientDso) reader() {
	defer recoverAndLogPanic()
	defer client.conn.Close()
	defer client.hub.Unsubscribe(client.sid)
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
		mutation.Session = client.sid
		mutation.Sid = client.fid
		client.hub.Apply(mutation)
	}
}

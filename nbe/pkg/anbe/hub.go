package anbe

import (
	"fmt"
	"sync"
	"time"
)

type Hub interface {
	Subscribe(id string, client func(mutation *Mutation))
	Unsubscribe(id string)
	Apply(mutation *Mutation)
	NextId() string
	Close()
}

type hubDso struct {
	count   uint64
	state   State
	mutex   sync.Mutex
	clients map[string]func(mutation *Mutation)
}

func NewHub(state State) Hub {
	hub := &hubDso{}
	hub.state = state
	hub.clients = make(map[string]func(mutation *Mutation))
	return hub
}

func (hub *hubDso) NextId() string {
	hub.mutex.Lock()
	hub.count++
	count := hub.count
	hub.mutex.Unlock()
	now := time.Now().UnixNano()
	return fmt.Sprintf("%d_%d", count, now)
}

func (hub *hubDso) Subscribe(id string, client func(mutation *Mutation)) {
	hub.clients[id] = client
	client(&Mutation{Name: "init", Args: hub.state.All()})
}

func (hub *hubDso) Unsubscribe(id string) {
	client := hub.clients[id]
	if client != nil {
		delete(hub.clients, id)
		client(&Mutation{Name: "unsub"})
	}
}

func (hub *hubDso) Apply(mutation *Mutation) {
	err := hub.state.Apply(mutation)
	if err != nil {
		trace("state.Apply", mutation, err)
		return
	}
	for _, client := range hub.clients {
		client(mutation)
	}
}

func (hub *hubDso) Close() {
	hub.state.Close()
	mutation := &Mutation{Name: "close"}
	for _, client := range hub.clients {
		client(mutation)
	}
	hub.clients = make(map[string]func(mutation *Mutation))
}

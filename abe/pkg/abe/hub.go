package abe

import (
	"fmt"
	"sync"
	"time"
)

type Hub interface {
	Subscribe(sid string, fid uint, client func(mutation *Mutation))
	Unsubscribe(id string)
	Apply(mutation *Mutation)
	NextId() string
	Close()
}

type hubDso struct {
	count    uint64
	state    State
	mutex    sync.Mutex
	sessions map[string]*sessionDso
}

type sessionDso struct {
	fid    uint
	output func(mutation *Mutation)
}

func NewHub(state State) Hub {
	hub := &hubDso{}
	hub.state = state
	hub.sessions = make(map[string]*sessionDso)
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

func (hub *hubDso) Subscribe(sid string, fid uint, output func(mutation *Mutation)) {
	session := &sessionDso{}
	session.output = output
	session.fid = fid
	hub.sessions[sid] = session
	mutation := &Mutation{}
	mutation.Session = sid
	if fid == 0 {
		mutation.Name = "all"
		mutation.Args = hub.state.All()
	} else {
		mutation.Name = "one"
		mutation.Args = hub.state.One(fid)
	}
	output(mutation)
}

func (hub *hubDso) Unsubscribe(sid string) {
	session := hub.sessions[sid]
	if session != nil {
		delete(hub.sessions, sid)
		session.output(&Mutation{Name: "unsub"})
	}
}

func (hub *hubDso) Apply(mutation *Mutation) {
	err := hub.state.Apply(mutation)
	if err != nil {
		trace("state.Apply", mutation, err)
		return
	}
	for _, session := range hub.sessions {
		switch {
		case session.fid == 0:
			switch {
			case mutation.Sid == 0:
				session.output(mutation)
			case mutation.Name == "rename":
				session.output(mutation)
			case mutation.Name == "enable":
				session.output(mutation)
			}
		case session.fid == mutation.Fid:
			session.output(mutation)
		}
	}
}

func (hub *hubDso) Close() {
	hub.state.Close()
	mutation := &Mutation{Name: "close"}
	for _, session := range hub.sessions {
		session.output(mutation)
	}
	hub.sessions = nil
}

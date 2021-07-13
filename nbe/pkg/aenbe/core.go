package aenbe

type coreDso struct {
	hub   Hub
	queue chan func()
}

func NewCore(hub Hub) *coreDso {
	core := &coreDso{}
	core.hub = hub
	core.queue = make(chan func())
	go core.loop()
	return core
}

func (core *coreDso) NextId() string {
	return core.hub.NextId()
}

func (core *coreDso) Subscribe(id string, client func(mutation *Mutation)) {
	core.queue <- func() {
		core.hub.Subscribe(id, client)
	}
}

func (core *coreDso) Unsubscribe(id string) {
	core.queue <- func() {
		core.hub.Unsubscribe(id)
	}
}

func (core *coreDso) Apply(mutation *Mutation) {
	core.queue <- func() {
		core.hub.Apply(mutation)
	}
}

func (core *coreDso) Close() {
	//chained close to avoid race condition
	//core -> hub -> state -> dao
	core.queue <- func() {
		core.hub.Close()
		close(core.queue)
	}
}

func (core *coreDso) loop() {
	for fn := range core.queue {
		fn()
	}
}

import React, { useState, useEffect, useReducer } from 'react';

import "./Editor.css";

import env from "./environ"

function Editor(props) {
  
  function reducer(state, {name, args, session}) {
    // called twice on purpose by reactjs 
    // to detect side effects on strict mode
    // reducer must be pure
    switch(name){
      case "one": {
        const next = Object.assign({}, state);
        next.session = session;
        next.name = args.name;
        next.mime = args.mime;
        next.data = args.data;
        return next;
      }
      case "rename": {
        const next = Object.assign({}, state);
        next.name = args.name;
        return next;
      }
      case "update": {
        const next = Object.assign({}, state);
        next.data = args.data;
        return next;
      }
      case "close": {
        //flickers on navigating back (reconnect)
        const next = Object.assign({}, state);
        next.id = 0;
        next.name = null;
        next.mime = null;
        next.data = null;
        return next;
      }
      default:
        env.log("Unknown mutation", name, args, session)
        return state;
    }
  }

  const initial = {id:0, name:null, mime:null, data:null};
  const [state, dispatch] = useReducer(reducer, initial);
  const [socket, setSocket] = useState(null);
  const [name, setName] = useState(null);
  const [data, setData] = useState(null);

  function handleDispatch({name, args}) {
    if (!socket) {
      env.log("Null socket dispatch", name, args)
      return;
    }
    switch(name) {
      case "update":
      case "rename":
        env.log("ws.send", {name, args});
        socket.send(JSON.stringify({name, args}));
        break;
      default:
        env.log("Unknown mutation", name, args)
    }
  }

  function handleUpdate() {
    handleDispatch({name: "update", args: {id: props.id, data}})
  }

  function handleRename() {
    handleDispatch({name: "rename", args: {id: props.id, name}})
  }

  useEffect(() => {
    let toms = 0;
    let to = null;
    let ws = null;
    function disconnect() {
      env.log("disconnect", to, ws)
      if (to) clearTimeout(to);
      if (ws) ws.close();
    }
    function connect() {
      env.log("connect", to, ws)
      //immediate error when navigating back
      //toms is workaround for trottled reconnection
      //safari only, chrome and firefox work ok
      ws = new WebSocket(env.wsURL + `/edit/${props.id}`);
      env.log("connected", to, ws)
      ws.onclose = (event) => {  
        env.log("ws.close", event);
        setSocket(null);
        dispatch({name: "close"});
        to = setTimeout(connect, toms);
        toms += 1000; toms %= 4000;
      }
      ws.onmessage = (event) => {
        env.log("ws.message", event);
        dispatch(JSON.parse(event.data));
      }
      ws.onerror = (event) => {
        env.log("ws.error", event);
      }
      ws.onopen = (event) => {
        env.log("ws.open", event);
        setSocket(ws);
        toms = 0;
      }
    }
    to = setTimeout(connect, 0);
    return disconnect;
  }, [props.id]);

  return (
    <div className="Editor">
      <h3>{props.id}</h3>
      <h3>Name: {state.name}</h3>
      <input type="text" state={name} onChange={e => setName(e.target.value)}/>
      <button onClick={handleRename}>Rename</button>
      <h3>Data: {state.data}</h3>
      <input type="text" state={data} onChange={e => setData(e.target.value)}/>
      <button onClick={handleUpdate}>Update</button>
    </div>
  );
}

export default Editor;

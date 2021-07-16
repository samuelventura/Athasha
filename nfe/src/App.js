import React, { useState, useEffect, useReducer } from 'react';

import "./App.css";

import FileBrowser from "./app/FileBrowser";

import env from "./environ"

function App() {
  
  function reducer(state, {name, args, session}) {
    // called twice on purpose by reactjs 
    // to detect side effects on strict mode
    // reducer must be pure
    switch(name){
      case "all": {
        const next = Object.assign({}, state);
        next.session = session;
        next.files = {};
        args.files.forEach(f => next.files[f.id] = f);
        return next;
      }
      case "create": {
        const next = Object.assign({}, state);
        next.files[args.id] = args;
        if (next.session === session) {
          next.selected = args;
        }
        return next;
      }
      case "delete": {
        const next = Object.assign({}, state);
        delete next.files[args.id]
        return next;
      }
      case "rename": {
        const next = Object.assign({}, state);
        next.files[args.id].name = args.name;
        return next;
      }
      case "select": {
        const next = Object.assign({}, state);
        next.selected = args;
        return next;
      }
      case "close": {
        //flickers on navigating back (reconnect)
        const next = Object.assign({}, state);
        next.files = {};
        next.selected = {};
        next.session = null;
        return next;
      }
      default:
        env.log("Unknown mutation", name, args, session)
        return state;
    }
  }

  const initial = {files:{}, selected:{}, session:null};
  const [state, dispatch] = useReducer(reducer, initial);
  const [socket, setSocket] = useState(null);

  function handleDispatch({name, args}) {
    if (!socket) {
      env.log("Null socket dispatch", name, args)
      return;
    }
    switch(name) {
      case "select":
        dispatch({name, args});
        break;
      case "create":
      case "delete":
      case "rename":
        env.log("ws.send", {name, args});
        socket.send(JSON.stringify({name, args}));
        break;
      default:
        env.log("Unknown mutation", name, args)
    }
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
      ws = new WebSocket(env.wsURL + "/index");
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
  }, []);

  return (
    <div className="App">
      <FileBrowser 
        state={state} 
        dispatch={handleDispatch} />
    </div>
  );
}

export default App;

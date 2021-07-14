import React, { useState, useEffect, useReducer } from 'react';

import "./App.css";

import FileBrowser from "./components/FileBrowser";

function App() {
  
  function reducer(state, {name, args, origin}) {
    // called twice on purpose by reactjs 
    // to detect side effects on strict mode
    // reducer must be pure
    switch(name){
      case "init": {
        const next = Object.assign({}, state);
        next.session = origin
        next.files = {};
        args.files.forEach(f => next.files[f.id] = f);
        return next;
      }
      case "create": {
        const next = Object.assign({}, state);
        next.files[args.id] = args;
        if (next.session === origin) {
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
        const next = Object.assign({}, state);
        next.files = {};
        next.selected = {};
        next.session = null;
        return next;
      }
      default:
        console.log("Unknown mutation", name, args, origin)
        return state;
    }
  }

  const initial = {files:{}, selected:{}, session:null};
  const [state, dispatch] = useReducer(reducer, initial);
  const [socket, setSocket] = useState(null);

  function handleDispatch({name, args}) {
    if (!socket) {
      console.log("Null socket dispatch", name, args)
      return;
    }
    switch(name) {
      case "select":
        dispatch({name, args});
        break;
      case "create":
      case "delete":
      case "rename":
        console.log("ws.send", {name, args});
        socket.send(JSON.stringify({name, args}));
        break;
      default:
        console.log("Unknown mutation", name, args)
    }
  }

  useEffect(() => {
    function connect() {
      const url = "ws://localhost:5001/ws/index";
      const ws = new WebSocket(url);
      ws.onclose = (event) => {  
        console.log("ws.close", event);
        setSocket(null);
        dispatch({name: "close"});
        setTimeout(connect, 4000);
      }
      ws.onmessage = (event) => {
        console.log("ws.message", event);
        dispatch(JSON.parse(event.data));
      }
      ws.onerror = (event) => {
        console.log("ws.error", event);
      }
      ws.onopen = (event) => {
        console.log("ws.open", event);
        setSocket(ws);
      }
    }
    setTimeout(connect, 0);
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

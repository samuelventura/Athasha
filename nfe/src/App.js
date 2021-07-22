import React, { useEffect, useReducer } from 'react';

import "./App.css";

import FileBrowser from "./app/FileBrowser";

import socket from "./socket"
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
      case "enable": {
        const next = Object.assign({}, state);
        next.files[args.id].enabled = args.enabled;
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
      case "send": {
        const next = Object.assign({}, state);
        next.send = args;
        return next;
      }
      default:
        env.log("Unknown mutation", name, args, session)
        return state;
    }
  }

  const initial = {
    files: {}, 
    selected: {}, 
    session: null,
    send: socket.send
  };
  const [state, dispatch] = useReducer(reducer, initial);

  function handleDispatch({name, args}) {
    switch(name) {
      case "select":
        dispatch({name, args});
        break;
      case "create":
      case "delete":
      case "rename":
      case "enable":
        state.send({name, args});
        break;
      default:
        env.log("Unknown mutation", name, args)
    }
  }

  useEffect(() => {
    return socket.create(dispatch, "/index");
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

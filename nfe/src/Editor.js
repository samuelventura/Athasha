import React, { useEffect, useReducer } from 'react';

import "./Editor.css";

import socket from "./socket"
import env from "./environ";

import Default from "./editor/Default";
import Script from "./editor/Script";

function Editor(props) {
  
  function reducer(state, {session, name, args}) {
    // called twice on purpose by reactjs 
    // to detect side effects on strict mode
    // reducer must be pure
    switch(name){
      case "one": {
        const next = Object.assign({}, state);
        //synced when equal
        next.session.one = session;
        next.session.update = session;
        next.id = args.id;
        next.name = args.name;
        next.mime = args.mime;
        next.data = args.data;
        next.version = args.version;
        next.enabled = args.enabled;
        next.connected = true;
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
        next.version = args.version;
        next.session.update = session;
        return next;
      }
      case "enable": {
        const next = Object.assign({}, state);
        next.enabled = args.enabled;
        return next;
      }
      case "send": {
        const next = Object.assign({}, state);
        next.send = args;
        return next;
      }
      case "close": {
        const next = Object.assign({}, state);
        //keep state to avoid default editor showing
        next.connected = false;
        return next;
      }
      default:
        env.log("Unknown mutation", session, name, args)
        return state;
    }
  }

  //null make form inputs complain
  const initial = {
    id: 0, 
    name: "", 
    mime: "", 
    data: "",
    version: 0,
    enabled: false,
    session: {},
    connected: false,
    send: socket.send,
  };
  const [state, dispatch] = useReducer(reducer, initial);

  function handleDispatch({name, args}) {
    switch(name) {
      case "enable":
      case "update":
      case "rename":
        env.log("ws.send", {name, args});
        state.send(JSON.stringify({name, args}));
        break;
      default:
        env.log("Unknown mutation", name, args)
    }
  }

  useEffect(() => {
    return socket.create(dispatch, `/edit/${props.id}`);
  }, [props.id]);

  function router() {
    switch(state.mime) {
      case "Script":
        return <Script id={props.id} state={state} dispatch={handleDispatch}/>
      default:
        return <Default id={props.id} state={state} dispatch={handleDispatch}/>
    }
  }

  return (
    <div className="Editor">
      {router()}
    </div>
  );
}

export default Editor;

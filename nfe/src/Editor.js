import React, { useEffect, useReducer } from 'react';

import socket from "./socket"
import env from "./environ";

import ScriptEditor from "./editor/ScriptEditor";
//after code editor to override styles
import "./Editor.css";

function Editor(props) {
  
  function reducer(state, {session, name, args}) {
    //called twice on purpose by reactjs 
    //to detect side effects on strict mode
    //reducer must be pure
    switch(name){
      case "one": {
        const next = Object.assign({}, state);
        next.session.one = session;
        next.session.update = null;
        next.id = args.id;
        next.name = args.name;
        next.data = args.data;
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
        next.send = socket.send;
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
    data: "",
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
        state.send({name, args});
        break;
      default:
        env.log("Unknown mutation", name, args)
    }
  }

  useEffect(() => {
    return socket.create(dispatch, `/edit/${props.id}`);
  }, [props.id]);

  return (
    <div className="Editor">
       <ScriptEditor id={props.id} state={state} dispatch={handleDispatch}/>
    </div>
  );
}

export default Editor;

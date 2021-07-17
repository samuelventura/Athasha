import React, { useState, useEffect, useReducer } from 'react';

import "./Editor.css";

import env from "./environ";

import Default from "./editor/Default";

function Editor(props) {
  
  function reducer(state, {name, args, session}) {
    // called twice on purpose by reactjs 
    // to detect side effects on strict mode
    // reducer must be pure
    switch(name){
      case "one": {
        const next = Object.assign({}, state);
        next.session = session;
        next.id = args.id;
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

  function router() {
    switch(state.mime){
      default:
        return <Default state={state} dispatch={handleDispatch}/>
    }
  }

  return (
    <div className="Editor">
      {router()}
    </div>
  );
}

export default Editor;

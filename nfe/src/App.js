import React, { useState, useEffect, useReducer } from 'react';

import "./App.css";

import FileBrowser from "./components/FileBrowser";

function App() {
  
  const [session, setSession] = useState(null);
  const [selected, setSelected] = useState({});

  function reducer(files, {name, args}) {
    switch(name){
      case "init": {
        const list = {};
        args.files.forEach(f => list[f.id] = f);
        setSession(args.origin);
        return list;
      }
      case "create": {
        const list = Object.assign({}, files);
        list[args.id] = args;
        if (session === args.origin) {
          setSelected(args)
        }
        return list;
      }
      case "delete": {
        const list = Object.assign({}, files);
        delete list[args.id]
        return list;
      }
      case "rename": {
        const list = Object.assign({}, files);
        list[args.id].name = args.name;
        return list;
      }
      default:
        console.log(`Unknown mutation ${name}`, args)
        return files;
    }
  }

  const [files, dispatch] = useReducer(reducer, {});
  const [socket, setSocket] = useState(null);

  function post(name, args) {
    if (!socket) {
      console.log(`Post with null socket ${name}`, args)
      return;
    }
    switch(name) {
      case "select":
        setSelected(args);
        break;
      default:
        socket.send(JSON.stringify({ name, args }));
    }
  }

  useEffect(() => {
    function connect() {
      const url = "ws://localhost:5001/ws/index";
      const ws = new WebSocket(url);
      ws.onclose = () => {  
        setSocket(null);
        setSession(null);
        setTimeout(connect, 4000);
      }
      ws.onmessage = (event) => {
        setSocket(ws);
        dispatch(JSON.parse(event.data));
      }
      ws.onerror = (event) => {
        console.log("ws.error", event);
      }
    }
    setTimeout(connect, 0);
  }, []);

  return (
    <div className="App">
      <FileBrowser 
        files={files} 
        post={post} 
        selected={selected}/>
    </div>
  );
}

export default App;

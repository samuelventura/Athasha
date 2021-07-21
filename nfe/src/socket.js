import env from "./environ"

function create(dispatch, path) {
  let toms = 0;
  let to = null;
  let ws = null;
  let closed = true;
  let disposed = false;

  function dispose() {
    env.log("dispose", disposed, closed, to, ws)
    disposed = true;
    if (to) clearTimeout(to);
    if (ws) ws.close();
  }

  function send(data) {
    //env.log("send", disposed, closed, data)
    if (disposed) return;
    if (closed) return;
    ws.send(data)
  }

  function connect() {
    //immediate error when navigating back
    //toms is workaround for trottled reconnection
    //safari only, chrome and firefox work ok
    let url = env.wsURL + path
    ws = new WebSocket(url);
    env.log("connect", to, url, ws)
    ws.onclose = (event) => {  
      env.log("ws.close", event);
      closed = true;
      dispatch({name: "close"});
      if (disposed) return;
      to = setTimeout(connect, toms);
      toms += 1000; toms %= 4000;
    }
    ws.onmessage = (event) => {
      //env.log("ws.message", event, event.data);
      const msg = JSON.parse(event.data)
      env.log("ws.message", event, msg);
      dispatch(msg);
    }
    ws.onerror = (event) => {
      env.log("ws.error", event);
    }
    ws.onopen = (event) => {
      env.log("ws.open", event);
      dispatch({name: "send", args: send});
      closed = false;
      toms = 0;
    }
  }
  to = setTimeout(connect, 0);
  return dispose;
}

function send(data) {
  env.log("send.nop", data)
}

var socket = {create, send}

export default socket;

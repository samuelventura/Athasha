import React, { useState, useEffect } from 'react';

function Default(props) {
  
  //useState called only once and not on avery prop change
  const [name, setName] = useState("");
  const [data, setData] = useState("");

  function handleUpdate() {
    props.dispatch({name: "update", args: {id: props.state.id, data}})
  }

  function handleRename() {
    props.dispatch({name: "rename", args: {id: props.state.id, name}})
  }

  function handleEnable(enabled) {
    props.dispatch({name: "enable", args: {id: props.state.id, enabled}})
  }

  useEffect(()=>{
    setName(props.state.name)
    setData(props.state.data)
  }, [props])

  return (
    <div className="Default">
      <h1>ID: {props.state.id}</h1>
      <h3>Enabled: {props.state.enabled ? "true" : "false"}</h3>
      <h3>Mime: {props.state.mime}</h3>
      <h3>Name: {props.state.name}</h3>
      <input type="text" value={name} onChange={e => setName(e.target.value)}/>
      <br/>
      <button onClick={handleRename}>Rename</button>
      <button onClick={() => handleEnable(true)}>Enable</button>
      <button onClick={() => handleEnable(false)}>Disable</button>
      <h3>Data: {props.state.data}</h3>
      <textarea value={data} onChange={e => setData(e.target.value)}/>
      <br/><button onClick={handleUpdate}>Update</button>
    </div>
  );
}

export default Default;

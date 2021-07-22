import React, { useState, useEffect } from 'react';

import "./ScriptEditor.css";

import CodeEditor from './CodeEditor';

import env from "../environ"

//FIXME On save ES6 linter
//FIXME On save callback
function ScriptEditor(props) {
  
  const [id, setId] = useState(0);
  const [data, setData] = useState("");

  useEffect(()=>{
    if (id === 0 && props.state.id > 0) {
      setId(props.state.id);
      setData(props.state.data);
    }
  }, [props, id])

  function handleRename() {
    const file = props.state;
    const name = window.prompt(`Rename file '${file.name}'`, file.name);
    if (name === null) return;
    if (name.trim().length === 0) return;
    props.dispatch({name: "rename", args: {id: file.id, name}});
  }

  function handleEnable(enabled) {
    props.dispatch({name: "enable", args: {id: props.state.id, enabled}})
  }
  
  function handleSave() {
    env.log("handleSave")
    const id = props.id;
    props.dispatch({name: "update", args: {id, data}})
  }
 
  function handleRun() {
    env.log("handleRun")
  }

  function handleChange(data) {
    setData(data)
    localStorage.setItem(localId(), data);
  }

  function localId() {
    return `file/${props.id}`;
  }

  function inSync() {
    const one = props.state.session.one;
    const update = props.state.session.update;
    return one === update;
  }

  function isDirty() {
    const last = props.state.data;
    return last !== data;
  }

  return (
    <div className="ScriptEditor">
      <div className="FileName">
        <span>
          <h3 onClick={handleRename} 
            title="Click to rename">{props.state.name}</h3>
          <span className="NameChip">{props.state.enabled ? "Enabled" : "Disabled"}</span>
          <span className="NameChip">{props.state.connected ? "Online" : "Offline"}</span>
          <span className="NameChip">{inSync() ? "InSync" : "OutOfSync"}</span>
          <span className="NameChip">{isDirty() ? "Dirty" : "Clean"}</span>
        </span>
        <span className="FileActions">
          <button onClick={handleSave}>Save</button>
          <button onClick={handleRun}>Run</button>
          <button onClick={() => handleEnable(true)}>Enable</button>
          <button onClick={() => handleEnable(false)}>Disable</button>
        </span>
      </div>
      <CodeEditor 
        mode="javascript"
        value={data}
        onChange={handleChange}
      />
    </div>
  );
}

export default ScriptEditor;

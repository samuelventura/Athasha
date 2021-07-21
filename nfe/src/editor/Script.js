import React, { useState, useEffect, useRef } from 'react';
import {Controlled as CodeMirror} from 'react-codemirror2-react-17';

import "./Script.css";

import 'codemirror/lib/codemirror.css';
import 'codemirror/mode/javascript/javascript';

import env from "../environ"

function Script(props) {
  
  //useState called only once and not on avery prop change
  const [id, setId] = useState(0);
  const [data, setData] = useState("");
  const editor = useRef(null);

  useEffect(()=>{
    if (id === 0 && props.state.id > 0) {
      setId(props.state.id);
      setData(props.state.data);
    }
  }, [props, id])

  useEffect(()=>{
    //env.log("useEffect", editor.current, editor.current.editor.on);
    // const cm = editor.current.editor;
    // cm.on("save", () => {
    //   env.log("on.save");
    // });
  }, []) 

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
    const version = props.state.version;
    props.dispatch({name: "update", args: {id, data, version}})
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

  //FIXME rename on name click
  //FIXME ES6 linter
  //FIXME run button
  //FIXME save button and key shortcut
  //FIXME local storage until save confirmed
  //FIXME disabled style or chip
  //CodeMittor doc.markClean, save(Cmd+S)
  return (
    <div className="Default">
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
      <CodeMirror
        ref={editor}
        value={data}
        options={{
          //explicit mode needed when multiple 
          //mode.js files are loaded
          mode: "javascript",
          lineNumbers: true,
        }}
        //author says onChange used only in uncontrolled
        onBeforeChange={(_editor, _data, value) => {
          //throttle?
          env.log("onBeforeChange", value);
          handleChange(value);
          // setData(value);
          // const id = props.state.id;
          // const data = value;
          // props.dispatch({name: "update", args: {id, data, version}})
          // setVersion(version + 1);
        }}
      />
    </div>
  );
}

export default Script;

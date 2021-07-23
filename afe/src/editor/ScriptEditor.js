import React, { useState, useEffect } from 'react'

import CodeEditor from './CodeEditor'

import keyboardJS from "keyboardjs"
import env from "../environ"

//[ ] On save ES6 linter
//[ ] Diff confirm out-of-sync save https://diff2html.xyz
//[ ] Single mime with multiple templates
//[x] Save/run/enable/disable keyboard shortcuts
//[x] Preserve out-of-sync state across reconnections
function ScriptEditor(props) {
  
  const [id, setId] = useState(0)
  const [data, setData] = useState("")
  const [initial, setInitial] = useState("")

  useEffect(()=>{
    //first connection detection
    if (id === 0 && props.state.id > 0) {
      setId(props.state.id)
      setData(props.state.data)
      setInitial(props.state.data)
    }
    //self save detection
    const one = props.state.session.one
    const update = props.state.session.update
    if (one === update) {
      setInitial(props.state.data)
    }
  }, [props, id])

  useEffect(()=>{
    const save = () => handleSave()
    const run = () => handleRun()
    const enable = () => handleEnable(true)
    const disable = () => handleEnable(false)
    //cmd+s is page save already
    //cmd+r is page refresh already
    keyboardJS.bind("f2", save)
    keyboardJS.bind("f5", run)
    keyboardJS.bind("f6", enable)
    keyboardJS.bind("f7", disable)
    return () => {
      keyboardJS.unbind("f2", save)
      keyboardJS.unbind("f5", run)
      keyboardJS.unbind("f6", enable)
      keyboardJS.unbind("f7", disable)
      }
  })

  function handleRename() {
    const file = props.state
    const name = window.prompt(`Rename file '${file.name}'`, file.name)
    if (name === null) return
    if (name.trim().length === 0) return
    props.dispatch({name: "rename", args: {id: file.id, name}})
  }

  function handleEnable(enabled) {
    props.dispatch({name: "enable", args: {id: props.state.id, enabled}})
  }
  
  function handleSave() {
    const id = props.id
    props.dispatch({name: "update", args: {id, data}})
  }
 
  function handleRun() {
    env.log("handleRun")
  }

  function handleChange(data) {
    setData(data)
    localStorage.setItem(localId(), data)
  }

  function localId() {
    return `file/${props.id}`
  }

  function inSync() {
    const current = props.state.data
    return current === initial
  }

  function isDirty() {
    return data !== initial
  }

  return (
    <div className="ScriptEditor">
      <div className="ScriptTop">
        <h3 className="FileName" onClick={handleRename}
          title="Click to rename">{props.state.name}</h3>
        <span className="FileActions">
          <button onClick={handleSave}>F2 Save</button>
          <button onClick={handleRun}>F5 Run</button>
          <button onClick={() => handleEnable(true)}>F6 Enable</button>
          <button onClick={() => handleEnable(false)}>F7 Disable</button>
        </span>
      </div>
      <CodeEditor 
        mode="javascript"
        value={data}
        onChange={handleChange}
      />
      <div className="ScriptBottom">
        <span className="FileChip">{props.state.enabled ? "Enabled" : "Disabled"}</span>
        <span className="FileChip">{props.state.connected ? "Online" : "Offline"}</span>
        <span className="FileChip">{inSync() ? "InSync" : "OutOfSync"}</span>
        <span className="FileChip">{isDirty() ? "Dirty" : "Clean"}</span>
      </div>
    </div>
  )
}

export default ScriptEditor

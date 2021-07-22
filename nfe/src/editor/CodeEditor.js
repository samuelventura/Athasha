import React, { useState, useEffect, useRef } from 'react'

import 'codemirror/lib/codemirror.css'
import CodeMirror from 'codemirror/lib/codemirror.js'
import 'codemirror/mode/javascript/javascript.js'

//FIXME ES6 syntax highlight
//FIXME On save ES6 linter
//FIXME On save callback
//FIXME 2-spaces tab indent
//FIXME Autocomplete with RT API
//FIXME Line numbers and autofocus
function CodeEditor(props) {

  //onChange is a new function on each render
  const {value, onChange, mode} = props
  const tae = useRef(null)
  const [cm, setCm] = useState(null)

  useEffect(()=> {
    const cm = CodeMirror.fromTextArea(tae.current, {
      lineNumbers: true,
      smartIndent: true,
      autofocus: true,
      mode: mode,
      tabSize: 2,
    })
    //cm.setSize("100%", "100%")
    setCm(cm)
    return () => { cm.toTextArea() }
  }, [mode])

  useEffect(() => {
    if (cm == null) return;
    function handleChange() {
      const value = cm.getValue()
      if (onChange) {
        onChange(value)
      }
    }
    cm.on("change", handleChange)
    return () => { cm.off("change", handleChange) }
  }, [cm, onChange])
  
  useEffect(() => {
    if (cm == null) return;
    if (value !== cm.getValue()) {
      cm.setValue(value)
    }
  }, [cm, value])

  return (
    <div className="CodeEditor">
      <textarea ref={tae}></textarea>
    </div>
  )
}

export default CodeEditor

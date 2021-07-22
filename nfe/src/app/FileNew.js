import React, { useState } from 'react'

function FileNew(props) {

  const [state, setState] = useState("")

  const templates = {
    "Empty Script": "",
    "Serial Port to Socket": "listen(3000)",
  }
  
  function handleChange(e) {
    setState("") //trigger rendering
    const template = e.target.value
    const name = window.prompt(`Name for New ${template}`, `New ${template}`)
    if (name === null) return
    const data = templates[template]
    props.dispatch({name: "create", args: {name, data}})
  }

  return (
    <div className="FileNew">
      <select 
        data-testid="select" 
        value={state}
        onChange={handleChange}>
          <option value="" disabled>New...</option>
          {Object.keys(templates).map((t, i) => <option key={i}>{t}</option>)}
        </select>
    </div>
  )
}

export default FileNew

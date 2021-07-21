import React, { useState } from 'react';

function FileNew(props) {

  const [state, setState] = useState("");
  
  function handleChange(e) {
    setState(""); //trigger rendering
    const mime = e.target.value;
    const name = window.prompt(`Name for New ${mime}`, `New ${mime}`);
    if (name === null) return;
    props.dispatch({name: "create", args: {name, mime}});
  }

  return (
    <div className="FileNew">
      <select 
        data-testid="select" 
        value={state}
        onChange={handleChange}>
          <option value="" disabled>New...</option>
          <option>Script</option>
          <option>Default1</option>
          <option>Default2</option>
          <option>Default3</option>
          <option>Default4</option>
        </select>
    </div>
  );
}

export default FileNew;

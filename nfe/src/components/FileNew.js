import React, { useState } from 'react';

function FileNew(props) {

  const [state, setState] = useState("");
  
  function handleChange(e) {
    setState(""); //trigger rendering
    const mime = e.target.value;
    const name = window.prompt(`Name for New ${mime}`, `New ${mime}`);
    if (name === null) return;
    props.post("create", {name, mime});
  }

  return (
    <div className="FileNew">
      <select 
        data-testid="select" 
        value={state}
        onChange={handleChange}>
          <option value="" disabled>New...</option>
          <option>Serial</option>
          <option>FileType2</option>
          <option>FileType3</option>
          <option>FileType4</option>
          <option>FileType5</option>
        </select>
    </div>
  );
}

export default FileNew;

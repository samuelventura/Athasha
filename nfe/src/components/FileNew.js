import React, { useState } from 'react';

function FileNew(props) {

  const [state, setState] = useState("");
  
  function handleChange(e) {
    props.onNew(e.target.value)
    setState(""); //trigger rendering
  }

  return (
    <div className="FileNew">
      <select 
        data-testid="select" 
        value={state}
        onChange={handleChange}>
          <option value="" disabled>New...</option>
          <option>Serial</option>
          <option>Socket</option>
        </select>
    </div>
  );
}

export default FileNew;

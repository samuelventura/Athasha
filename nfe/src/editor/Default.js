import React, { useState, } from 'react';

function Default(props) {
  
  const [name, setName] = useState(null);
  const [data, setData] = useState(null);

  function handleUpdate() {
    props.dispatch({name: "update", args: {id: props.state.id, data}})
  }

  function handleRename() {
    props.dispatch({name: "rename", args: {id: props.state.id, name}})
  }

  return (
    <div className="Default">
      <h1>ID: {props.state.id}</h1>
      <h3>Name: {props.state.name}</h3>
      <input type="text" state={props.state.name} onChange={e => setName(e.target.value)}/>
      <br/><button onClick={handleRename}>Rename</button>
      <h3>Data: {props.state.data}</h3>
      <textarea state={props.state.data} onChange={e => setData(e.target.value)}/>
      <br/><button onClick={handleUpdate}>Update</button>
    </div>
  );
}

export default Default;

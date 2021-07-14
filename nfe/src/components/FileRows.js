function FileRows(props) {
  
  function handleDelete(file) {
    const accept = window.confirm(`Delete file '${file.name}'?`);
    if (!accept) return;
    props.dispatch({name: "delete", args: {id: file.id}});
  }

  function handleEdit(file) {
  }

  function handleRename(file) {
    const name = window.prompt(`Rename file '${file.name}'`, file.name)
    if (name === null) return;
    if (name.trim().length === 0) return;
    props.dispatch({name: "rename", args: {id: file.id, name}});
  }

  function handleSelect(file) {
    props.dispatch({name: "select", args: file});
  }

  function selectedClass(file) {
    return file.id === props.selected.id ? 
      "FileSelected" : "";
  }

  const rows = props.files.map(file => 
    <tr key={file.id} 
      onClick={() => handleSelect(file)} 
      className={`FileRow ${selectedClass(file)}`}>
      <td>
        <div className="FileName">{file.name} ({file.mime})</div>
        <div className={`FileActions ${selectedClass(file)}`}>
        <button onClick={() => handleEdit(file)}>Edit</button>
          <button onClick={() => handleDelete(file)}>Delete</button>
          <button onClick={() => handleRename(file)}>Rename</button>
        </div>
      </td>
    </tr>
  );
  
  return (
    <tbody className="FileRows">
      {rows}
    </tbody>
  );
}

export default FileRows;

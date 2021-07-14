function FileRows(props) {
  
  function handleDelete(id) {
    const accept = window.confirm('Delete this file?')
    if (!accept) return;
    props.post("delete", {id});
  }

  function handleRename(id, cname) {
    const name = window.prompt('Rename', cname)
    if (name === null) return;
    if (name.trim().length === 0) return;
    props.post("rename", {id, name});
  }

  function handleSelect(file) {
    props.post("select", file);
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
        <div className="FileName">{file.name}</div>
        <div className={`FileActions ${selectedClass(file)}`}>
          <button onClick={() => handleDelete(file.id)}>Delete</button>
          <button onClick={() => handleRename(file.id, file.name)}>Rename</button>
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

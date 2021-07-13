function FileRows(props) {
  
  function handleDelete(id) {
    props.onAction(id, "delete")
  }

  const rows = props.files.map(file => 
    <tr key={file.id}>
      <td>{file.name}</td>
      <td>
        <button onClick={() => handleDelete(file.id)}>Delete</button>
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

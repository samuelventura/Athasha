
function FileRows(props) {
  
  const rows = props.files.map(file => 
    <tr key={file.id}>
      <td>{file.name}</td>
      <td></td>
    </tr>
  );
  
  return (
    <tbody className="FileRows">
      {rows}
    </tbody>
  );
}

export default FileRows;

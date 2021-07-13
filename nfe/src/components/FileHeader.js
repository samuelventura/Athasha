

function FileHeader(props) {
  
  function handleAscClick() {
    props.onSortChange("asc");
  }
  
  function handleDescClick() {
    props.onSortChange("desc");
  }

  const ascSelected = props.sort === "asc" ? "*" : "";
  const descSelected = props.sort === "desc" ? "*" : "";

  return (
    <thead className="FileHeader">
      <tr>
        <th>Name 
          <button onClick={handleAscClick}>Asc{ascSelected}</button> 
          <button onClick={handleDescClick}>Desc{descSelected}</button>
        </th>
        <th>Actions</th>
      </tr>
    </thead>
  );
}

export default FileHeader;

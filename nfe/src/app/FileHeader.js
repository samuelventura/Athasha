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
        <th>
          <span className="FileName">Name</span> 
          <span className="FileSort">
            <button onClick={handleAscClick}>Asc{ascSelected}</button> 
            <button onClick={handleDescClick}>Desc{descSelected}</button>
          </span>
        </th>
      </tr>
    </thead>
  );
}

export default FileHeader;

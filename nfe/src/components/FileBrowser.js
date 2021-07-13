
import React, { useState } from 'react';

import SearchBar from "./SearchBar";
import FileHeader from "./FileHeader";
import FileRows from "./FileRows";

function FileBrowser(props) {
  
  //full file list downloaded on connected and updated async
  //local filtering and sorting
  const [filter, setFilter] = useState("");
  const [sort, setSort] = useState("asc");

  function handleFilterChange(value) {
    setFilter(value);
  }

  function handleSortChange(value) {
    setSort(value);
  }

  function viewFiles() {
    const f = filter.toLowerCase();
    const filtered = props.files.filter(file => 
      file.name.toLowerCase().includes(f));
    switch(sort) {
      case "asc":
        return filtered.sort((f1,f2) => 
          f1.name.localeCompare(f2.name));    
      case "desc":
        return filtered.sort((f1,f2) => 
          f2.name.localeCompare(f1.name));    
      default:
        return filtered; 
    }     
  }

  return (
    <div className="FileBrowser">
      <SearchBar 
        filter={filter} 
        onFilterChange={handleFilterChange}
        />
      <table className="fileTable">
        <FileHeader sort={sort}
          onSortChange={handleSortChange}/>
        <FileRows files={viewFiles()}/>
      </table>
    </div>
  );
}

export default FileBrowser;

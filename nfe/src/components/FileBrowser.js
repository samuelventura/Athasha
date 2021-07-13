import React, { useState } from 'react';

import FileSearch from "./FileSearch";
import FileHeader from "./FileHeader";
import FileRows from "./FileRows";
import FileNew from "./FileNew";

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

  function handleNew(mime) {
    props.post("create", {name: `New ${mime}`, mime});
  }

  function handleAction(id, action) {
    switch(action)
    {
      case "delete":
        props.post("delete", {id});
        break;
      default:
        console.log(`Unknown action ${action}`, id)
    }
  }

  function viewFiles() {
    const f = filter.toLowerCase();
    const list = Object.values(props.files)
    const filtered = list.filter(file => 
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
      <FileNew onNew={handleNew}/>
      <FileSearch 
        filter={filter} 
        onFilterChange={handleFilterChange}
        />
      <table className="fileTable">
        <FileHeader sort={sort}
          onSortChange={handleSortChange}/>
        <FileRows files={viewFiles()} onAction={handleAction}/>
      </table>
    </div>
  );
}

export default FileBrowser;

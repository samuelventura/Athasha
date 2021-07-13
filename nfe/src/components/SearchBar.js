import React, { useState } from 'react';

function SearchBar(props) {

  const [filter, setFilter] = useState(props.filter);
  
  function handleChange(e) {
    setFilter(e.target.value);
  }

  function handleClick() {
    props.onFilterChange(filter);
  }

  //esc exits full screen on macos 
  //use X icon to reset filter instead
  function handleKeyPress(e) {
    if(e.key === 'Enter') {
      props.onFilterChange(filter);
    }
  }

  return (
    <div className="SearchBar">
      <input 
        data-testid="textbox" 
        type="text" 
        value={filter} 
        onChange={handleChange} 
        onKeyPress={handleKeyPress}
        placeholder="Filter...">
        </input>
        <button 
          data-testid="button"
          onClick={handleClick}
          >Search</button>
    </div>
  );
}

export default SearchBar;

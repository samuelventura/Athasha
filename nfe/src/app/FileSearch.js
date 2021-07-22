import React, { useState, useEffect } from 'react'

function FileSearch(props) {

  //useState called only once and not on avery prop change
  const [filter, setFilter] = useState("")
  
  function handleChange(e) {
    setFilter(e.target.value)
  }

  function handleClick() {
    props.onFilterChange(filter)
  }

  //esc exits full screen on macos 
  //use X icon to reset filter instead
  function handleKeyPress(e) {
    if(e.key === 'Enter') {
      props.onFilterChange(filter)
    }
  }

  useEffect(()=>{
    setFilter(props.filter)
  }, [props])

  return (
    <div className="FileSearch">
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
  )
}

export default FileSearch

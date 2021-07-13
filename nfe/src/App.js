import "./App.css";

import FileBrowser from "./components/FileBrowser";

const files = [{id:0, name:"file1"}, {id:1, name:"file2"}]

function App() {
  return (
    <div className="App">
      <FileBrowser files={files}/>
    </div>
  );
}

export default App;

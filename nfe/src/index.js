import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import Editor from './Editor';
import env from "./environ"
import reportWebVitals from './reportWebVitals';
import {
  BrowserRouter as Router,
  Switch,
  Route,
  useParams
} from "react-router-dom";

ReactDOM.render(
  <React.StrictMode>
    <Router>
      <Switch>
        <Route exact={true} path="/">
          <App />
        </Route>
        <Route path="/edit/:id">
          <Edit />
        </Route>
        <Route path="*">
          <NotFound />
        </Route>
      </Switch>      
    </Router>
  </React.StrictMode>,
  document.getElementById('root')
);

function Edit() {
  let {id} = useParams();
  return <Editor id={id}/>;
}

function NotFound() {
  return (
    <div className="NotFound">
    <h3>Not Found</h3>
    <a href={env.href('/')}>Home</a>
    </div>);
}

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();

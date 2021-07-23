import React, { Suspense, lazy } from 'react'
import ReactDOM from 'react-dom'
import './index.css'
import env from "./environ"
import reportWebVitals from './reportWebVitals'
import {
  BrowserRouter as Router,
  Switch,
  Route,
  useParams
} from "react-router-dom"

const App = lazy(() => import('./App'))
const Editor = lazy(() => import('./Editor'))

ReactDOM.render(
  <React.StrictMode>
    <Router>
      <Suspense fallback={<div>Loading...</div>}>
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
      </Suspense>     
    </Router>
  </React.StrictMode>,
  document.getElementById('root')
)

function Edit() {
  let {id} = useParams()
  return <Editor id={id}/>
}

function NotFound() {
  return (
    <div className="NotFound">
    <h3>Not Found</h3>
    <a href={env.href('/')}>Home</a>
    </div>)
}

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals()

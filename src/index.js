import React from 'react'
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import {
  Router,
  Switch,
  Route,
} from "react-router-dom"
import { Provider, useSelector } from 'react-redux'
import store from './redux/store';
import OAuth from "./OAuth"
import history from "./history"
import { selectUser } from "./redux/slice/user"

const Routing = () => {
  const { token } = useSelector(selectUser)

  return (
    <Router history={history}>
      <Switch>
        <Route
          exact
          path="/"
          component={() => {
            if (token) {
              return <App/>
            }

            window.location.href = process.env.REACT_APP_FACEBOOK_LINK
            return null
          }}
        />
        <Route path={process.env.REACT_APP_FACEBOOK_CALLBACK_URL}>
          <OAuth/>
        </Route>
      </Switch>
    </Router>
  )
}

ReactDOM.render(
  <React.StrictMode>
    <Provider store={store}>
      <Routing/>
    </Provider>
  </React.StrictMode>,
  document.getElementById('root')
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();

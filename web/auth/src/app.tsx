import React from 'react';
import LoginPage from './pages/login.page';
import RegisterPage from './pages/register.page';

import './app.css';
import FannstBanner from './static/fannst-banner-light.png';
import { Link, Switch, Route } from 'react-router-dom';

function App() {
  return (
    <div className="wrapper">
        <div className="pages">
        <ul className="pages__ul">
          <li className="pages__ul__li">
            <Link to="/login">Login</Link>
          </li>
          <li className="pages__ul__li">
            <Link to="/register">Register</Link>
          </li>
        </ul>
      </div>
      <div className="header">
        <img src={FannstBanner} />
      </div>
      <Switch>
        <Route exact path="/login" component={LoginPage} />
        <Route exact path="/register" component={RegisterPage} />
      </Switch>
    </div>
  );
}

export default App;

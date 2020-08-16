import React, { useRef } from 'react';
import LoginPage from './pages/login.page';
import RegisterPage from './pages/register.page';
import { Link, Switch, Route, Redirect } from 'react-router-dom';
import Loader from './components/misc/Loader.component';

import './app.css';
import FannstBanner from './static/fannst-banner-light.png';

interface AppProps {

}

class App extends React.Component<any, any>
{
  private loader: React.RefObject<Loader> = React.createRef<Loader>();

  state: {
    loader: {
      show: boolean,
      message: string
    }
  };

  public constructor(props: AppProps)
  {
    super(props);

    this.state = {
      loader: {
        show: false,
        message: ''
      }
    };
  }

  public showLoader = (message: string): void => {
    if (this.loader && this.loader.current) this.loader.current.show(message);
  };

  public hideLoader = (): void => {
    if (this.loader && this.loader.current) this.loader.current.hide();
  };

  public render = (): any => {
    return (
      <React.Fragment>
        <Loader ref={this.loader} />
        <div className="wrapper__outer">
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
            <div className="wrapper__rt">
              <Switch>
                <Route
                  exact path="/login"
                  component={() => <LoginPage hideLoader={this.hideLoader} showLoader={this.showLoader} />}
                />
                <Route
                  exact path="/register"
                  component={(props: any) => {
                    return (
                      <RegisterPage
                        history={props.history}
                        hideLoader={this.hideLoader}
                        showLoader={this.showLoader}
                      />
                    )
                  }}
                />
                <Redirect to="/login" />
              </Switch>
            </div>
          </div>
        </div>
      </React.Fragment>
    );
  }
}

export default App;

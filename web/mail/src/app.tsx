import React from 'react';
import { Switch, Redirect, Route } from 'react-router-dom';

import { AccountService } from './services/Accounts.service';
import InboxPage from './pages/Inbox.page';
import Header from './components/nav/Header.component';
import Splashscreen from './components/misc/Splashscreen.component';
import { Toolbar, ToolbarState } from './components/nav/Toolbar.component';

import './app.scss';

interface AppProps {}

class App extends React.Component {
  state: {
    loading: boolean,
    loaderMessage: string
  };

  public constructor(props: AppProps) {
    super(props);

    this.state = {
      loading: true,
      loaderMessage: 'Loading page'
    };
  }

  /**
   * Handles the startup, this will make sure that the user
   *  gets logged in, and else redirected
   */
  public componentDidMount = (): void => {
    setTimeout(() => {
      this.setState({
        loaderMessage: 'Authenticating'
      }, () => {
        AccountService.authenticate().then(success => {
          if (!success) {
            this.setState({
              loaderMessage: 'Not logged in, redirecting'
            }, () => {
              setTimeout(() => {
                window.location.href = '/auth/login';
              }, 1600);
            });
          } else {
            setTimeout(() => {
              this.setState({
                loading: false
              });
            }, 100);
          }
        }).catch(err => {
          
        });
      });
    }, 100);
  };
  
  /**
   * Toggles the sidebar
   */
  public toggleSidebar = (): void => {
    document.getElementById('app__sidebar')?.toggleAttribute('hidden');
  }

  /**
   * Renders the page, and if loading the splashscreen
   */
  public render = (): any => {
    const { loading, loaderMessage } = this.state;

    if (loading) return <Splashscreen message={loaderMessage} />
    else return (
      <React.Fragment>
        <div className="app">
          <div className="app__sidebar" id="app__sidebar" ref="sidebar" >
            <ul>
              <li>
                {/* The folders */}
                <p>
                  <strong>Folders: </strong>
                </p>
                <ul>
                  <li></li>
                </ul>
              </li>
            </ul>
          </div>
          <div className="app__wrapper">
            <Header toggleSidebar={this.toggleSidebar} />
            <Toolbar state={ToolbarState.Default} />
            <div className="app__content">
              <Switch>
                <Route exact path="/inbox" component={InboxPage} />
                <Redirect to="/inbox" />
              </Switch>
            </div>
          </div>
        </div>
      </React.Fragment>
    );
  };
}

export default App;

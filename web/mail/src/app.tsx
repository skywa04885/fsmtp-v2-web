import React from 'react';
import { Switch, Redirect, Route, NavLink } from 'react-router-dom';
import { Howler, Howl } from 'howler';

import { AccountService } from './services/Accounts.service';
import MailboxPage from './pages/Mailbox.page';
import Header from './components/nav/Header.component';
import Splashscreen from './components/misc/Splashscreen.component';
import { Toolbar, ToolbarState } from './components/nav/Toolbar.component';
import Loader from './components/misc/Loader.component';
import { Mailbox } from './models/Mailbox.model';

import './app.scss';
import { MailboxesService } from './services/Mailboxes.service';

const StartupSound =  require('./static/startup.mp3');

interface AppProps {}

class App extends React.Component {
  state: {
    loading: boolean,
    loaderMessage: string,
    mailboxes: Mailbox[]
  };

  private loader: React.RefObject<Loader> = React.createRef<Loader>();

  public constructor(props: AppProps) {
    super(props);

    this.state = {
      loading: true,
      loaderMessage: 'Loading page',
      mailboxes: []
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
              // Plays the startup sound
              new Howl({
                src: StartupSound
              }).play();

              // Disables the loader and refreshes the page
              //  so loading the mails etcetera
              this.setState({
                loading: false
              }, () => this.refresh());
            }, 400);
          }
        }).catch(err => {
          
        });
      });
    }, 100);
  };

  private _refreshing: boolean = false;
  public refresh = (): void => {
    if (this._refreshing) return;
    else this._refreshing = true;
    this.loader?.current?.show('Loading mailboxes');

    setTimeout(() => {
      MailboxesService.gatherMailboxes().then(mailboxes => {
        this.setState({
          mailboxes
        });

        this.loader?.current?.hide();
        this._refreshing = false;
      }).catch(err => {});
    }, 200);
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
    const { loading, loaderMessage, mailboxes } = this.state;

    if (loading) return <Splashscreen message={loaderMessage} />
    else return (
      <React.Fragment>
        <div className="app">
          <div className="app__sidebar" id="app__sidebar" ref="sidebar" >
            <ul className="app__sidebar__ul">
              <li className="app__sidebar__ul__li">
                {/* The folders */}
                <p className="app__sidebar__ul__li__title">
                  <strong>Folders: </strong>
                </p>
                <ul className="app__sidebar__ul__li__folders">
                  {mailboxes.map((mailbox: Mailbox) => {
                    return (
                      <li>
                        <NavLink
                          className="app__sidebar__folder"
                          activeClassName="app__sidebar__folder-active"
                          to={"/mailbox/" + mailbox.e_MailboxPath}
                        >
                          {mailbox.getIcon()}
                          {mailbox.getName()}
                        </NavLink>
                      </li>
                    );
                  })}
                </ul>
              </li>
            </ul>
          </div>
          <div className="app__wrapper">
            <Loader ref={this.loader} />
            <Header toggleSidebar={this.toggleSidebar} />
            <Toolbar state={ToolbarState.Default} />
            <div className="app__content">
              <Switch>
                <Route path="/mailbox/:mailbox" component={MailboxPage} />
                <Redirect to="/mailbox/INBOX" />
              </Switch>
            </div>
          </div>
        </div>
      </React.Fragment>
    );
  };
}

export default App;

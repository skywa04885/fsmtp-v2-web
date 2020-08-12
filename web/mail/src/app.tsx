import React from 'react';
import { Switch, Redirect, Route, NavLink } from 'react-router-dom';
import { Howler, Howl } from 'howler';

import { AccountService } from './services/Accounts.service';
import MailboxPage from './pages/Mailbox.page';
import Header from './components/nav/Header.component';
import Splashscreen from './components/misc/Splashscreen.component';
import { Toolbar, ToolbarButton } from './components/nav/Toolbar.component';
import Loader from './components/misc/Loader.component';
import { Mailbox } from './models/Mailbox.model';
import { MailboxesService } from './services/Mailboxes.service';
import EmailPage from './pages/Email.page';
import Compose from './components/Compose.component';
import { MailboxStatus } from './models/MailboxStatus.model';

import './app.scss';
import { popup } from '.';

const StartupSound = require('./static/startup.mp3');

interface AppProps {}

class App extends React.Component {
  state: {
    loading: boolean,
    loaderMessage: string,
    mailboxes: Mailbox[],
    mailboxStats: MailboxStatus[],
    ready: boolean
  };

  private composeMenu: React.RefObject<Compose> = React.createRef<Compose>();
  private toolbar: React.RefObject<Toolbar> = React.createRef<Toolbar>();
  private loader: React.RefObject<Loader> = React.createRef<Loader>();
  private mailboxPage: React.RefObject<MailboxPage> = React.createRef<MailboxPage>();

  public constructor(props: AppProps) {
    super(props);

    this.state = {
      loading: true,
      loaderMessage: 'Loading page',
      mailboxes: [],
      mailboxStats: [],
      ready: false
    };
  }

  public componentDidMount = (): void => {
    setTimeout(() => {
      this.setState({
        loaderMessage: 'Authenticating'
      }, () => {
        // Authenticates the user, and if not throws error
        //  messge to the screen
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
          popup.current?.showText(err.toString(), 'Could not authenticate');
        });
      });
    }, 100);
  };

  public refresh = (): void => {
    this.loader?.current?.show('Loading mailboxes');

    MailboxesService.gatherMailboxes().then(mailboxes => {
      this.loader?.current?.show('Loading mailbox statistics');
      MailboxesService.gatherMailboxStats(mailboxes).then(mailboxStats => {
        this.loader?.current?.hide();

        this.setState({
          mailboxes,
          mailboxStats,
          ready: true
        });
      }).catch(err => {
        this.loader?.current?.hide();
        popup.current?.showText(err.toString(), 'Could not load statistics');
      });
    }).catch(err => {
      this.loader?.current?.hide();
      popup.current?.showText(err.toString(), 'Could not load mailboxes');
    });
  };

  public toggleSidebar = (): void => {
    document.getElementById('app__sidebar')?.toggleAttribute('hidden');
  }

  public render = (): any => {
    const { loading, loaderMessage, mailboxes, mailboxStats, ready } = this.state;

    if (loading)
      return (
        <React.Fragment>
          <Splashscreen message={loaderMessage} />
        </React.Fragment>
      );

    return (
      <React.Fragment>
        <div className="app">
          <div className="app__sidebar" id="app__sidebar" >
            <ul className="app__sidebar__ul">
              <li className="app__sidebar__ul__li">
                {/* The folders */}
                <div className="app__sidebar__ul__li__title">
                  <strong>Folders:</strong>
                  <div>
                    <button title="Add user defined folder" className="app__sidebar__ul__li__title-btn" type="button">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        height="24"
                        viewBox="0 0 24 24"
                        width="24"
                      >
                        <path d="M0 0h24v24H0z" fill="none"/>
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm5 11h-4v4h-2v-4H7v-2h4V7h2v4h4v2z"/>
                      </svg>
                    </button>
                  </div>
                </div>
                <ul className="app__sidebar__ul__li__folders">
                  {mailboxes.map((mailbox: Mailbox) => {
                    return (
                      <li key={mailbox.e_MailboxPath}>
                        <NavLink
                          title={ mailbox.e_Bucket + ':' + mailbox.e_Domain + ':' + mailbox.e_MailboxPath}
                          className="app__sidebar__folder"
                          activeClassName="app__sidebar__folder-active"
                          to={"/mailbox/" + mailbox.e_MailboxPath}
                        >
                          {mailbox.getIcon()}
                          {mailbox.getName()} ({ mailboxStats.find((stat, n) => stat.s_Path === mailbox.e_MailboxPath)?.s_Total })
                        </NavLink>
                      </li>
                    );
                  })}
                </ul>
              </li>
              <hr />
              <li className="app__sidebar__ul__li">
                {/* Settings etcetera */}
                <p className="app__sidebar__ul__li__title">
                  <strong>Other:</strong>
                </p>
                <ul className="app__sidebar__ul__li__folders">
                  <li>
                    <NavLink
                      to="/other/devinfo"
                      className="app__sidebar__folder"
                      activeClassName="app__sidebar__folder-active"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        height="24"
                        viewBox="0 0 24 24"
                        width="24"
                      >
                        <path d="M0 0h24v24H0z" fill="none"/>
                        <path d="M7 5h10v2h2V3c0-1.1-.9-1.99-2-1.99L7 1c-1.1 0-2 .9-2 2v4h2V5zm8.41 11.59L20 12l-4.59-4.59L14 8.83 17.17 12 14 15.17l1.41 1.42zM10 15.17L6.83 12 10 8.83 8.59 7.41 4 12l4.59 4.59L10 15.17zM17 19H7v-2H5v4c0 1.1.9 2 2 2h10c1.1 0 2-.9 2-2v-4h-2v2z"/>
                      </svg>
                      Developer Info
                    </NavLink>
                  </li>
                </ul>
              </li>
            </ul>
          </div>
          <div className="app__wrapper">
            <Compose
              showLoader={this.loader?.current?.show}
              hideLoader={this.loader?.current?.hide}
              ref={this.composeMenu}
            />
            <Loader ref={this.loader} />
            <Header toggleSidebar={this.toggleSidebar} />
            <Toolbar
              ref={this.toolbar}
            />
            <div className="app__content">
              {!ready ? null : (
                <Switch>
                  <Route path="/mailbox/:mailbox" component={(props: any) => {
                    return (
                      <MailboxPage
                        ref={this.mailboxPage}
                        history={props.history}
                        match={props.match}
                        setToolbar={this.toolbar?.current?.setToolbar}
                        onCompose={this.composeMenu.current?.show}
                      />
                    );
                  }} />
                  <Route path="/mail/:mailbox/:bucket/:uuid" component={(props: any) => {
                    return (
                      <EmailPage
                        match={props.match}
                        history={props.history}
                        setToolbar={this.toolbar?.current?.setToolbar}
                        showLoader={this.loader?.current?.show}
                        hideLoader={this.loader?.current?.hide}
                      />
                    );
                  }}/>
                  <Redirect to="/mailbox/INBOX" />
                </Switch>
              )}
            </div>
          </div>
        </div>
      </React.Fragment>
    );
  };
}

export default App;

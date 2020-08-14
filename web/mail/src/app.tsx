import React from 'react';
import { Switch, Redirect, Route, NavLink } from 'react-router-dom';
import { Howler, Howl } from 'howler';

import { AccountService } from './services/Accounts.service';
import MailboxPage from './pages/Mailbox.page';
import Header from './components/nav/Header.component';
import Splashscreen from './components/misc/Splashscreen.component';
import { Toolbar } from './components/nav/Toolbar.component';
import Loader from './components/misc/Loader.component';
import { Mailbox } from './models/Mailbox.model';
import EmailPage from './pages/Email.page';
import Compose from './components/Compose.component';
import { MailboxStatus } from './models/MailboxStatus.model';
import { popup } from '.';
import { Sidebar } from './components/misc/Sidebar.component';

import './app.scss';

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
  private sidebar: React.RefObject<Sidebar> = React.createRef<Sidebar>();

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

              // Disables the splashscreen
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
    this.sidebar?.current?.refresh().then(() => {
      this.setState({
        ready: true
      });
    });
  };

  public toggleSidebar = (): void => {
    document.getElementById('sidebar')?.toggleAttribute('hidden');
  }

  public render = (): any => {
    const { loading, loaderMessage, ready } = this.state;

    if (loading)
      return (
        <React.Fragment>
          <Splashscreen message={loaderMessage} />
        </React.Fragment>
      );

    return (
      <React.Fragment>
        <div className="app">
          <Loader ref={this.loader} />
          <Sidebar
            ref={this.sidebar}
          />
          <div className="app__wrapper">
            <Compose
              showLoader={this.loader?.current?.show}
              hideLoader={this.loader?.current?.hide}
              updateMailboxStat={this.sidebar?.current?.updateMailboxStat}
              ref={this.composeMenu}
            />
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
                        updateMailboxStat={this.sidebar?.current?.updateMailboxStat}
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
                        updateMailboxStat={this.sidebar?.current?.updateMailboxStat}
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

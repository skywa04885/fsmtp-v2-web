import React from 'react';
import { Switch, Redirect, Route, NavLink } from 'react-router-dom';
import { Howl } from 'howler';
import classnames from 'classnames';

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
import { Email } from './models/Email.model';
import EmailClients from './pages/EmailClients.page';
import DeveloperInfo from './pages/DeveloperInfo.page';
import Config from './Config';

const StartupSound = require('./static/startup.mp3');

interface AppProps {}

class App extends React.Component {
  state: {
    loading: boolean;
    loaderMessage: string;
    mailboxes: Mailbox[];
    mailboxStats: MailboxStatus[];
    ready: boolean;
  };

  private composeMenu: React.RefObject<Compose> = React.createRef<Compose>();
  private toolbar: React.RefObject<Toolbar> = React.createRef<Toolbar>();
  private loader: React.RefObject<Loader> = React.createRef<Loader>();
  private mailboxPage: React.RefObject<MailboxPage> = React.createRef<
    MailboxPage
  >();
  private sidebar: React.RefObject<Sidebar> = React.createRef<Sidebar>();

  public constructor(props: AppProps) {
    super(props);

    this.state = {
      loading: true,
      loaderMessage: 'Loading page',
      mailboxes: [],
      mailboxStats: [],
      ready: false,
    };
  }

  public componentDidMount = (): void => {
    this.setState({
      loaderMessage: 'Authenticating',
    }, () => {
      // Authenticates the user, and if not throws error
      //  messge to the screen
      AccountService.authenticate().then((success) => {
        if (!success) {
          this.setState({
            loaderMessage: 'Not logged in, redirecting',
          }, () => {
            setTimeout(() => {
              window.location.href = '/auth/login';
            }, 1600);
          });
        } else {
          // Plays the startup sound
          new Howl({
            src: StartupSound,
          }).play();

          // Disables the splashscreen
          this.setState({
            loading: false,
          }, () => this.refresh());
        }
      })
      .catch((err) => {
        popup.current?.showText(err.toString(), 'Could not authenticate');
      });
    });
  };

  public toggleDarmMode = (): void => {
    Config.setDarkMode(!Config.darkmode);
    this.setState({});
  };

  public refresh = (): void => {
    this.sidebar?.current?.refresh().then(() => {
      this.setState({
        ready: true,
      });
    });
  };

  public toggleSidebar = (): void => {
    document.getElementById('sidebar')?.classList.toggle('sidebar__hidden');
  };

  public render = (): any => {
    const { loading, loaderMessage, ready } = this.state;

    const classes = classnames({
      'app': true,
      'dark-mode__app': Config.darkmode,
      'light-mode__app': !Config.darkmode
    });

    if (loading)
      return (
        <div className={classes}>
          <Splashscreen message={loaderMessage} />
        </div>
      );

    return (
      <React.Fragment>
        <div className={classes}>
          <Loader ref={this.loader} />
          <Sidebar ref={this.sidebar} />
          <div className="app__wrapper">
            <Compose
              showLoader={this.loader?.current?.show}
              hideLoader={this.loader?.current?.hide}
              updateMailboxStat={this.sidebar?.current?.updateMailboxStat}
              ref={this.composeMenu}
            />
            <Header toggleDarmMode={this.toggleDarmMode} toggleSidebar={this.toggleSidebar} />
            <Toolbar ref={this.toolbar} />
            <div className="app__content">
              {!ready ? null : (
                <Switch>
                  <Route
                    path="/mailbox/:mailbox"
                    component={(props: any) => {
                      return (
                        <MailboxPage
                          ref={this.mailboxPage}
                          history={props.history}
                          updateMailboxStat={
                            this.sidebar?.current?.updateMailboxStat
                          }
                          match={props.match}
                          setToolbar={this.toolbar?.current?.setToolbar}
                          onCompose={this.composeMenu.current?.show}
                          showLoader={this.loader?.current?.show}
                          hideLoader={this.loader?.current?.hide}
                        />
                      );
                    }}
                  />
                  <Route
                    path="/mail/:mailbox/:bucket/:uuid"
                    component={(props: any) => {
                      return (
                        <EmailPage
                          match={props.match}
                          history={props.history}
                          updateMailboxStat={
                            this.sidebar?.current?.updateMailboxStat
                          }
                          setToolbar={this.toolbar?.current?.setToolbar}
                          showLoader={this.loader?.current?.show}
                          hideLoader={this.loader?.current?.hide}
                        />
                      );
                    }}
                  />
                  <Route path="/help/email-clients" component={(props: any) => {
                    return (
                      <EmailClients setToolbar={this.toolbar?.current?.setToolbar} />
                    )
                  }} />
                  <Route path="/help/developer-info" component={(props: any) => {
                    return (
                      <DeveloperInfo
                        setToolbar={this.toolbar?.current?.setToolbar}
                        showLoader={this.loader?.current?.show}
                        hideLoader={this.loader?.current?.hide}
                      />
                    )
                  }} />
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

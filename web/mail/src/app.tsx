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
import EmailPage from './pages/Email.page';

const StartupSound =  require('./static/startup.mp3');

interface AppProps {}

class App extends React.Component {
  state: {
    loading: boolean,
    loaderMessage: string,
    mailboxes: Mailbox[],
    ready: boolean
  };

  private loader: React.RefObject<Loader> = React.createRef<Loader>();
  private mailboxPage: React.RefObject<MailboxPage> = React.createRef<MailboxPage>();

  public constructor(props: AppProps) {
    super(props);

    this.state = {
      loading: true,
      loaderMessage: 'Loading page',
      mailboxes: [],
      ready: false
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

  public refresh = (): void => {
    this.loader?.current?.show('Loading mailboxes');

    setTimeout(() => {
      MailboxesService.gatherMailboxes().then(mailboxes => {
        this.setState({
          mailboxes,
          ready: true
        });

        this.loader?.current?.hide();
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
    const { loading, loaderMessage, mailboxes, ready } = this.state;

    if (loading) return <Splashscreen message={loaderMessage} />

    return (
      <React.Fragment>
        <div className="app">
          <div className="app__sidebar" id="app__sidebar" >
            <ul className="app__sidebar__ul">
              <li className="app__sidebar__ul__li">
                {/* The folders */}
                <p className="app__sidebar__ul__li__title">
                  <strong>Folders: </strong>
                </p>
                <ul className="app__sidebar__ul__li__folders">
                  {mailboxes.map((mailbox: Mailbox) => {
                    return (
                      <li key={mailbox.e_MailboxPath}>
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
            <Toolbar onRefresh={() => this.mailboxPage?.current?.refresh()} state={ToolbarState.Default} />
            <div className="app__content">
              {!ready ? null : (
                <Switch>
                  <Route path="/mailbox/:mailbox" component={(props: any) => {
                    return (
                      <MailboxPage
                        ref={this.mailboxPage}
                        history={props.history}
                        match={props.match}
                        showLoader={(message: string) => this.loader?.current?.show(message)}
                        hideLoader={() => this.loader?.current?.hide()}
                      />
                    );
                  }} />
                  <Route path="/mail/:bucket/:uuid" component={EmailPage} />
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

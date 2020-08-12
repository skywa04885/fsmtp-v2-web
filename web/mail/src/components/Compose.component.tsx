import React from 'react';
import ReactQuill from 'react-quill';
import cnames from 'classnames';

import './Compose.styles.scss';
import { AccountService } from '../services/Accounts.service';
import { MailerService } from '../services/Mailer.service';
import { popup } from '..';

enum ComposeState {
  Hidden,
  Minified,
  Visible,
  Huge
}

interface ComposeProps {
  showLoader: (message: string) => {},
  hideLoader: () => {}
}

export default class Compose extends React.Component<any, any> {
  state: {
    composeState: ComposeState,
    subject?: string,
    to?: string,
    message: string
  }
  
  public constructor(props: ComposeProps) {
    super(props);

    this.state = {
      composeState: ComposeState.Hidden,
      subject: undefined,
      to: undefined,
      message: ''
    };
  }

  public componentDidMount = () => {
    window.addEventListener('beforeunload', this.beforeUnload, true);
  };

  public componentWillUnmount = () => {
    window.removeEventListener('beforeunload', this.beforeUnload);
  }

  public beforeUnload = (e: BeforeUnloadEvent): void => {
    const { message, to, subject } = this.state;
    
    if (message.length > 0 || to || subject)
      e.preventDefault();
  };

  public onChange = (message: string) => {
    this.setState({ message });
  };

  public toggleFullscreen = (e: any) => {
    const { composeState } = this.state;
    this.setState({
      composeState: composeState === ComposeState.Huge ? ComposeState.Visible : ComposeState.Huge
    });
  };

  public show = () => {
    this.setState({
      composeState: ComposeState.Visible
    });
  };

  public hide = () => {
    this.setState({
      composeState: ComposeState.Hidden,
      subject: undefined,
      to: undefined,
      message: ''
    });
  };

  public toggleMinify = () => {
    const { composeState } = this.state;
  
    this.setState({
      composeState: composeState === ComposeState.Minified ? ComposeState.Visible : ComposeState.Minified
    });
  };

  public onSubjectChange = (e: any) => {
    this.setState({
      subject: e.target.value
    });
  };

  public onToChange = (e: any) => {
    this.setState({
      to: e.target.value
    });
  };

  public onSubmit = () => {
    const { subject, message, to } = this.state;
    const { showLoader, hideLoader } = this.props;

    if (!subject || message.length <= 0 || !to) return;

    showLoader('Sending message');
    MailerService.sendMail(subject, to, message.replace(/<[^>]*>?/gm, ''), message).then(() => {
      hideLoader();
      this.hide();
    }).catch(err => {
      popup.current?.showText(err.toString(), 'Could not send email');
      hideLoader();
    });
  };

  public render = (): any => {
    const { composeState, subject, message, to } = this.state;

    // Checks if we need to render nothing, since it was not called
    //  by the user, or if we need to show the minified verison
    if (composeState === ComposeState.Hidden) return null;
    if (composeState === ComposeState.Minified) {
      return (
        <button className="compose-minified" type="button" onClick={this.toggleMinify}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            height="24"
            viewBox="0 0 24 24"
            width="24"
          >
            <path d="M0 0h24v24H0z" fill="none"/>
            <path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"/>
          </svg>
          <p>
            <strong>{subject ? subject : "New message"}</strong>
          </p>
        </button>
      );
    }

    const classnames = cnames({
      'compose': true,
      'compose-fscreen': composeState === ComposeState.Huge,
      'compose-sscreen': composeState === ComposeState.Visible
    });

    return (
      <div className={classnames}>
        <div className="compose__head">
          <p>
            <strong>Compose MIME Message</strong>
          </p>
          <ul>
            <li>
              <button onClick={this.toggleMinify} type="button">
                <svg 
                  xmlns="http://www.w3.org/2000/svg"
                  height="24"
                  viewBox="0 0 24 24"
                  width="24"
                >
                  <path d="M0 0h24v24H0z" fill="none"/>
                  <path d="M19 13H5v-2h14v2z"/>
                </svg>
              </button>
            </li>
            <li>
              <button onClick={this.toggleFullscreen} type="button">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  height="24"
                  viewBox="0 0 24 24"
                  width="24"
                >
                  <path d="M0 0h24v24H0z" fill="none"/>
                  <path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z"/>
                </svg>
              </button>
            </li>
            <li>
              <button type="button" onClick={this.hide}>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  height="24"
                  viewBox="0 0 24 24"
                  width="24"
                >
                  <path d="M0 0h24v24H0z" fill="none"/>
                  <path d="M12 2C6.47 2 2 6.47 2 12s4.47 10 10 10 10-4.47 10-10S17.53 2 12 2zm5 13.59L15.59 17 12 13.41 8.41 17 7 15.59 10.59 12 7 8.41 8.41 7 12 10.59 15.59 7 17 8.41 13.41 12 17 15.59z"/>
                </svg>
              </button>
            </li>
          </ul>
        </div>
        <div className="compose__targets">
          <form className="compose__targets-form" onSubmit={(e) => e.preventDefault()}>
            <div>
              <label htmlFor="composeTargetsFrom">From: </label>
              <input
                id="composeTargetsFrom"
                type="text"
                placeholder="someone@example.com"
                contentEditable={false}
                value={`${AccountService.account.a_Username}@${AccountService.account.a_Domain}`}
              />
            </div>
            <div>
              <label htmlFor="composeTargetTo">To: </label>
              <input 
                id="composeTargetTo"
                placeholder="Separate addresses by ,"
                type="text"
                value={to}
                onChange={this.onToChange}
              />
            </div>
            <div>
              <label htmlFor="composeTargetSubject">Subject: </label>
              <input 
                id="composeTargetSubject"
                placeholder="What's the message about ?"
                type="text"
                value={subject}
                onChange={this.onSubjectChange}
              />
            </div>
          </form>
        </div>
        <div className="compose__editor">
          <div className="compose__editor-wrapper">
            <ReactQuill onChange={this.onChange} value={ message } style={{height: "calc(100% - 2.2rem)"}} theme="snow" />
          </div>
        </div>
        <div className="compose__buttons">
          <button type="button" className="compose__buttons__btn" onClick={this.onSubmit}>Transmit</button>
        </div>
      </div>
    );
  };
}

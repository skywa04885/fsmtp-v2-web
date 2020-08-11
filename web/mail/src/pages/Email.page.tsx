import React from 'react';

import { MailboxesService } from '../services/Mailboxes.service';
import { parse } from '../parsers/MIMEParser.parser';
import { Email, EmailAddress, EmailContentType } from '../models/Email.model';

import './Email.styles.scss';
import { time } from 'console';
import { NotImplementedError } from 'restify-errors';
import { ToolbarButton } from '../components/nav/Toolbar.component';
import { throws } from 'assert';
import Config from '../Config';

interface EmailPageProps {
  setToolbar: (buttons: ToolbarButton[]) => {}
}

export default class EmailPage extends React.Component<any, any> {
  public state: {
    error?: string,
    email?: Email
  };
  
  public constructor(props: EmailPageProps) {
    super(props);

    this.state = {
      error: undefined,
      email: undefined
    };
  }

  public componentDidMount = async () => {
    const { bucket, uuid } = this.props.match.params;
    const { setToolbar, history } = this.props;

    setToolbar([
      {
        icon: <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24"><path d="M0 0h24v24H0z" fill="none"/><path d="M12.5 8c-2.65 0-5.05.99-6.9 2.6L2 7v9h9l-3.62-3.62c1.39-1.16 3.16-1.88 5.12-1.88 3.54 0 6.55 2.31 7.6 5.5l2.37-.78C21.08 11.03 17.15 8 12.5 8z"/></svg>,
        title: 'Go back to mailbox',
        key: 'email_back_to_mailbox',
        callback: this.goBack
      },
      {
        icon: <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24"><path d="M0 0h24v24H0z" fill="none"/><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg>,
        title: 'Move to trash',
        key: 'email_mv_trash'
      },
      {
        icon: <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24"><path d="M0 0h24v24H0z" fill="none"/><path d="M20.54 5.23l-1.39-1.68C18.88 3.21 18.47 3 18 3H6c-.47 0-.88.21-1.16.55L3.46 5.23C3.17 5.57 3 6.02 3 6.5V19c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V6.5c0-.48-.17-.93-.46-1.27zM12 17.5L6.5 12H10v-2h4v2h3.5L12 17.5zM5.12 5l.81-1h12l.94 1H5.12z"/></svg>,
        title: 'Archive message',
        key: 'email_archive'
      }
    ]);

    MailboxesService.getEmail(bucket, uuid).then(data => {
      parse(data).then(email => {
        Config.updateTitle(email.e_Subject ? email.e_Subject : uuid);
        this.setState({
          email
        });
      }).catch(err => {
        this.setState({
          error: err
        });
      })
    }).catch(err => {
      console.log(`Could not load message: ${err.toString()}`);
      history.goBack();
    });
  };

  public goBack = () => {
    const { history } = this.props;
    history.goBack();
  };

  public renderAddressList = (list?: EmailAddress[]): any => {
    if (!list) return null;
    else return (
      <ul className="email__content__address-list">
        {list.map(address => {
          return (
            <li key={address.e_Address}>
              <p>
                {address.e_Name ? (
                  <React.Fragment>
                    <strong>{address.e_Name}</strong>
                    <span>&middot;</span>
                  </React.Fragment>
                ) : null}
                <small>{address.e_Address}</small>
              </p>
            </li>
          );
        })}
      </ul>
    );
  };

  public onFrameLoad = (e: any) => {
    const frame: HTMLIFrameElement = e.target as HTMLIFrameElement;
    const document = frame.contentWindow?.document;
    if (!document) return;

    const body: HTMLBodyElement = document.querySelector('body') as HTMLBodyElement;
    const head: HTMLHeadElement = document.querySelector('head') as HTMLHeadElement;

    // Sets the default styles
    body.style.fontFamily = 'sans-serif';
    body.style.color = '#323232';

    // Configures that all the links will be opened in a new window instead
    //  of in the iframe itself
    const node: HTMLBaseElement = document.createElement('base');
    node.setAttribute('target', '_blank');
    head.appendChild(node);
  };

  public render = (): any => {
    const { email, error } = this.state;

    if (error) {
      return (
        <div className="email__error">
          <p>
            <strong>Parsing error:</strong>
            <br />
            { error.toString() }
          </p>
        </div>
      );
    } else if (!email) return null;

    let contentIndex: number = -1;
    let htmlIndex: number = -1, textIndex: number = -1, i: number = 0;
    let attachmentCount: number = 0;
    for (let section of email.e_Sections) {
      if (section.e_Type === EmailContentType.TextPlain) textIndex = i;
      if (section.e_Type === EmailContentType.TextHTML) htmlIndex = i;
      if (
        section.e_Type === EmailContentType.Unknown || 
        section.e_Type === EmailContentType.ImagePng ||
        section.e_Type === EmailContentType.ImageJpg
      ) ++attachmentCount;
      
      i++;
    }

    if (htmlIndex !== -1) contentIndex = htmlIndex;
    else if (textIndex !== -1) contentIndex = textIndex;

    return (
      <React.Fragment>
        <div className="email">
          <div className="email__content">
            <div className="email__content-header">
              <div className="email__content-header__left">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  height="24"
                  viewBox="0 0 24 24"
                  width="24"
                >
                  <path d="M0 0h24v24H0z" fill="none"/>
                  <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
                </svg>
              </div>
              <div className="email__content-header__middle">
                <span>From:</span>
                { this.renderAddressList(email?.e_From) }
                <div />
                <span>To: </span>
                { this.renderAddressList(email?.e_To) }
                <div />
                <span>Date: </span>
                <p>{ email.e_Date?.toDateString() }</p>
                <div />
                <span>Attachments: </span>
                <p><a>{ attachmentCount } &laquo; View</a></p>
              </div>
              <div className="email__content-header__right">
                <ul>
                  <li>
                    <button type="button">Forward</button>
                  </li>
                  <li>
                    <button type="button">Reply</button>
                  </li>
                  <li>
                    <button type="button">Details</button>
                  </li>
                </ul>
              </div>
            </div>
            <div className="email__content-readable">
              <h2>{ email.e_Subject }</h2>
              {contentIndex !== -1 ? <iframe id="emailFrame" onLoad={this.onFrameLoad} srcDoc={email.e_Sections[contentIndex].e_Content}></iframe> : null}
            </div>
          </div>
        </div>
      </React.Fragment>
    );
  };
}

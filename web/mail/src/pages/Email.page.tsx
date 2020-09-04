import React, { AnchorHTMLAttributes } from 'react';
import classnames from 'classnames';
import ReactDOMServer from 'react-dom/server';

import { MailboxesService } from '../services/Mailboxes.service';
import { parse } from '../parsers/MIMEParser.parser';
import { Email, EmailAddress, EmailContentType, EmailTransferEncoding } from '../models/Email.model';
import { EmailFlags } from '../models/EmailShortcut.model';
import { ToolbarButton } from '../components/nav/Toolbar.component';
import Config from '../Config';
import { popup } from '..';
import FullscreenMessage from '../components/misc/FullscreenMessage.component';

import './Email.styles.scss';

interface EmailPageProps {
  setToolbar: (buttons: ToolbarButton[]) => {},
  showLoader: (message: string) => {},
  hideLoader: () => {},
  updateMailboxStat: (mailbox: string, add: number) => {}
}

export default class EmailPage extends React.Component<any, any> {
  public state: {
    error?: string,
    email?: Email,
    raw?: string
  };
  
  public constructor(props: EmailPageProps) {
    super(props);

    this.state = {
      error: undefined,
      email: undefined,
      raw: undefined
    };
  }

  public updateToolbar = () => {
    const { setToolbar } = this.props;
    const { mailbox } = this.props.match.params;

    let elements: ToolbarButton[] = [
      {
        icon: <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24"><path d="M0 0h24v24H0z" fill="none"/><path d="M12.5 8c-2.65 0-5.05.99-6.9 2.6L2 7v9h9l-3.62-3.62c1.39-1.16 3.16-1.88 5.12-1.88 3.54 0 6.55 2.31 7.6 5.5l2.37-.78C21.08 11.03 17.15 8 12.5 8z"/></svg>,
        title: 'Go back to mailbox',
        key: 'email_back_to_mailbox',
        callback: this.goBack
      }
    ];

    if (mailbox !== 'INBOX.Trash') {
      elements.push({
        icon: <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24"><path d="M0 0h24v24H0z" fill="none"/><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg>,
        title: 'Move to trash',
        key: 'email_mv_trash',
        callback: this.onDeleteOperation
      });
    }

    if (mailbox === 'INBOX.Trash') {
      elements.push({
        icon: <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24"><path d="M0 0h24v24H0z" fill="none"/><path d="M19 4h-3.5l-1-1h-5l-1 1H5v2h14zM6 7v12c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6zm8 7v4h-4v-4H8l4-4 4 4h-2z"/></svg>,
        title: 'Restore message',
        key: 'email_restore',
        callback: this.restoreFromTrash
      });
    } else if (mailbox !== 'INBOX.Archive') {
      elements.push({
        icon: <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24"><path d="M0 0h24v24H0z" fill="none"/><path d="M20.54 5.23l-1.39-1.68C18.88 3.21 18.47 3 18 3H6c-.47 0-.88.21-1.16.55L3.46 5.23C3.17 5.57 3 6.02 3 6.5V19c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V6.5c0-.48-.17-.93-.46-1.27zM12 17.5L6.5 12H10v-2h4v2h3.5L12 17.5zM5.12 5l.81-1h12l.94 1H5.12z"/></svg>,
        title: 'Archive message',
        key: 'email_archive',
        callback: () => this.onMoveOperation('INBOX.Archive')
      });

      elements.push({
        icon: <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24"><path d="M0 0h24v24H0z" fill="none"/><path d="M10 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z"/></svg>,
        title: 'Move message',
        key: 'email_move',
        callback: this.onCustomMove
      });
    } else if (mailbox === 'INBOX.Archive') {
      elements.push({
        icon: <svg xmlns="http://www.w3.org/2000/svg" enable-background="new 0 0 24 24" height="24" viewBox="0 0 24 24" width="24"><g><rect fill="none" height="24" width="24" x="0"/></g><g><g><g><path d="M20.55,5.22l-1.39-1.68C18.88,3.21,18.47,3,18,3H6C5.53,3,5.12,3.21,4.85,3.55L3.46,5.22C3.17,5.57,3,6.01,3,6.5V19 c0,1.1,0.89,2,2,2h14c1.1,0,2-0.9,2-2V6.5C21,6.01,20.83,5.57,20.55,5.22z M12,9.5l5.5,5.5H14v2h-4v-2H6.5L12,9.5z M5.12,5 l0.82-1h12l0.93,1H5.12z"/></g></g></g></svg>,
        title: 'Unarchive message',
        key: 'email_unarchive',
        callback: this.onCustomMove
      });
    }

    setToolbar(elements);
  }

  public componentDidMount = async () => {
    const { bucket, uuid } = this.props.match.params;

    this.updateToolbar();

    MailboxesService.getEmail(bucket, uuid).then(data => {
      parse(data).then(email => {
        Config.updateTitle(email.e_Subject ? email.e_Subject : uuid);
        this.setState({
          email,
          raw: data
        });
      }).catch(err => {
        popup.current?.showText(err.toString(), 'Parsing failed')
        this.setState({ error: err });
      })
    }).catch(err => {
      popup.current?.showText(err.toString(), 'Could not load email')
      this.setState({ error: err });
    });
  };

  public goBack = () => {
    const { mailbox } = this.props.match.params;
    const { history } = this.props;
    history.push(`/mailbox/${mailbox}`);
  };

  public renderAddressList = (list?: EmailAddress[]): any => {
    if (!list) return null;
    else return (
      <ul>
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

  public download = (): void => {
    const { raw, email } = this.state;
    
    if (!raw) return;

    let blob = new Blob([raw], {
      type: 'text/eml'
    });

    const filename: string = `${email?.e_Subject}.eml`;
    if (!!window.navigator.msSaveOrOpenBlob) {
      window.navigator.msSaveBlob(blob, filename);
    } else {
      let elem: HTMLAnchorElement = window.document.createElement('a');
      elem.href = window.URL.createObjectURL(blob);
      elem.download = filename;
      document.body.appendChild(elem);
      elem.click();
      document.body.removeChild(elem);
    }
  };

  public onCustomMove = (): void => {
    MailboxesService.gatherMailboxes().then(mailboxes => {
      popup.current?.showList(mailboxes.filter(mailbox => {
        if (mailbox.e_MailboxPath === 'INBOX.Trash') return;
        else return mailbox;
      }).map(mailbox => {
        return {
          text: mailbox.e_MailboxPath,
          onClick: () => this.onMoveOperation(mailbox.e_MailboxPath),
          icon: <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24"><path d="M0 0h24v24H0z" fill="none"/><path d="M10 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z"/></svg>
        }
      }), 'Move to folder')
    });
  };

  public showDetails = (): void => {
    const { email } = this.state;
    const { mailbox, uuid, bucket } = this.props.match.params;

    const mailer: any = email?.e_Headers.find(a => a.h_Key === 'x-mailer')?.h_Value;
    const mimeVersion: any = email?.e_Headers.find(a => a.h_Key === 'mime-version')?.h_Value;

    const classes = classnames({
      'email-details': true,
      'dark-mode__email-details': Config.darkmode,
      'light-mode__email-details': !Config.darkmode
    });

    popup.current?.showCustom((
      <div className={ classes }>
        <table>
          <tbody>
            <tr>
              <th>From: </th>
              <td>{ this.renderAddressList(email?.e_From) }</td>
            </tr>
            <tr>
              <th>To: </th>
              <td>{ this.renderAddressList(email?.e_To) }</td>
            </tr>
            <tr>
              <th>Subject: </th>
              <td><small>{ email?.e_Subject}</small></td>
            </tr>
            <tr>
              <th>Date: </th>
              <td><small>{ email?.e_Date?.toString() }</small></td>
            </tr>
            <tr>
              <th>Mailer: </th>
              <td><small>{ mailer ? mailer : 'Unknown' }</small></td>
            </tr>
            <tr>
              <th>MIME: </th>
              <td><small>Version { mimeVersion ? mimeVersion : 'Unknown' }</small></td>
            </tr>
            <tr>
              <th>Location: </th>
              <td><em>{`${bucket}:${mailbox}:${uuid}`}</em></td>
            </tr>
            <tr>
              <th>Connection</th>
              <td><small>{ (email?.e_Headers?.find(a => a.h_Key === 'x-fannst-conn')?.h_Value) ?? 'Unknown' }</small></td>
            </tr>
            { email?.e_SPFVerified ? (
              <tr>
                <th>SPF</th>
                <td><em>{ email?.e_SPFVerified }</em></td>
              </tr>
            ) : null }
            { email?.e_DKIMVerified ? (
              <tr>
                <th>DKIM</th>
                <td><em>{ email?.e_DKIMVerified }</em></td>
              </tr>
            ) : null }
            <tr>
              <th>Sections: </th>
              <td>
                <ol>
                  { email?.e_Sections.map(section => {
                    const transferEncoding: any = section.e_TransferEncoding !== undefined ? section.e_TransferEncoding : EmailTransferEncoding.Unknown;
                    const type: any = section.e_Type !== undefined ? section.e_Type : EmailTransferEncoding.Unknown;

                    return (
                      <li>
                        <p>
                          Encoding: <small>{ EmailTransferEncoding[transferEncoding] }</small>
                          <br />
                          Type: <small>{ EmailContentType[type] }</small>
                          <br />
                          ContentLength: <small>{ section.e_Content.length } chars</small>
                        </p>
                      </li>
                    );
                  }) }
                </ol>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    ), 'Email Details')
  };

  public restoreFromTrash = (): void => {
    const { uuid, mailbox } = this.props.match.params;
    const { history, showLoader, hideLoader, updateMailboxStat } = this.props;
    
    let args: any = {};

    let splitted: string[] = document.location.search.substr(1).split('&');
    splitted.forEach(elem => {
      let key: string, value: string;

      key = elem.substring(0, elem.indexOf('='));
      value = elem.substr(elem.indexOf('=') + 1);

      args[key] = value;
    });

    if (!args['trash_orig_mb']) return;

    showLoader(`Flagging message as deleted`);
    MailboxesService.unflag(args['trash_orig_mb'], uuid, EmailFlags.Deleted).then(() => {
      updateMailboxStat(args['trash_orig_mb'], 1);
      updateMailboxStat("INBOX.Trash", -1);
      this.goBack();
      hideLoader();
    }).catch(err => {
      popup.current?.showText(err.toString(), 'Could not move message');
      hideLoader();
    });
  }

  public onDeleteOperation = (): void => {
    const { uuid, mailbox } = this.props.match.params;
    const { history, showLoader, hideLoader, updateMailboxStat } = this.props;

    showLoader(`Flagging message as deleted`);
    MailboxesService.flag(mailbox, uuid, EmailFlags.Deleted).then(() => {
      hideLoader();
      updateMailboxStat(mailbox, -1);
      updateMailboxStat("INBOX.Trash", 1);
      history.push(`/mailbox/${mailbox}`);
    }).catch(err => {
      popup.current?.showText(err.toString(), 'Could not move message');
      hideLoader();
    });
  };

  public onMoveOperation = (mailboxTarget: string): void => {
    const { uuid, mailbox } = this.props.match.params;
    const { history, showLoader, hideLoader, updateMailboxStat } = this.props;

    showLoader(`Moving message to ${mailboxTarget}`);
    MailboxesService.move(mailbox, uuid, mailboxTarget).then(() => {
      hideLoader();
      updateMailboxStat(mailbox, -1);
      updateMailboxStat(mailboxTarget, 1);
      history.push(`/mailbox/${mailbox}`);
    }).catch(err => {
      popup.current?.showText(err.toString(), 'Could not move message');
      hideLoader();
    });
  };

  public onFrameLoad = (e: any) => {
    const frame: HTMLIFrameElement = e.target as HTMLIFrameElement;
    const document = frame.contentWindow?.document;
    if (!document) return;

    const body: HTMLBodyElement = document.querySelector('body') as HTMLBodyElement;
    const head: HTMLHeadElement = document.querySelector('head') as HTMLHeadElement;

    // Sets the default styles
    body.style.fontFamily = 'sans-serif';
   
    if (Config.darkmode) {
      body.style.color = '#fff';
      body.style.backgroundColor = "#242424";
    }
    else body.style.color = "#323232";

    // Configures that all the links will be opened in a new window instead
    //  of in the iframe itself
    const node: HTMLBaseElement = document.createElement('base');
    node.setAttribute('target', '_blank');
    head.appendChild(node);
  };

  public viewRaw = (): void => {
    const { raw } = this.state;
    const { email } = this.state;

    const encoded = raw?.replace(/[\u00A0-\u9999<>\&]/gim, i => {
      return '&#'+i.charCodeAt(0)+';';
    });

    const wind = window.open('', 'Raw message', 'width=600,height=400');

    const rowStyle = {};
    const tableHeadStyle = {
      border: '1px solid #e0e0e0',
      padding: '0.4rem',
      color: '#2b2b2b'
    };
    const tableItemStyle = {
      border: '1px solid #e0e0e0',
      padding: '0.4rem',
      color: '#414141',
      fontSize: '0.9rem'
    };

    wind?.document.write(
      ReactDOMServer.renderToStaticMarkup(
        <html style={{
          margin: '0',
          fontFamily: 'sans-serif'
        }}>
          <body style={{
            backgroundColor: '#eeeeee',
            margin: '0'
          }}>
            <div style={{
              padding: '2rem',
              borderBottom: '1px solid #dadada',
              backgroundColor: '#fff'
            }} className="header">
              <table style={{
                textAlign: 'left',
                borderCollapse: 'collapse',
                margin: 'auto',
                maxWidth: '900px',
                padding: '2rem',
                width: 'calc(100vw - 4rem)'
              }}>
                <thead>
                  <tr>
                    <th style={ tableHeadStyle }>Key</th>
                    <th style={ tableHeadStyle }>Value</th>
                  </tr>
                </thead>
                <tbody>
                  <tr style={ rowStyle }>
                    <th style={ tableHeadStyle }>Message ID</th>
                    <td style={ tableItemStyle }><span style={{
                      color: '#48a708'
                    }}>{ email?.e_Headers.find(a => a.h_Key === 'message-id')?.h_Value ?? 'Unknown' }</span></td>
                  </tr>
                  <tr style={ rowStyle }>
                    <th style={ tableHeadStyle }>From</th>
                    <td style={ tableItemStyle }>{ email?.e_From.map((a: EmailAddress) => `${a.e_Name} <${a.e_Address}>`).join(', ') ?? 'Unknown' }</td>
                  </tr>
                  <tr style={ rowStyle }>
                    <th style={ tableHeadStyle }>To</th>
                    <td style={ tableItemStyle }>{ email?.e_To.map((a: EmailAddress) => `${a.e_Name} <${a.e_Address}>`).join(', ') ?? 'Unknown' }</td>
                  </tr>
                  <tr style={ rowStyle }>
                    <th style={ tableHeadStyle }>Date</th>
                    <td style={ tableItemStyle }>{ email?.e_Date?.toUTCString() ?? 'Unknown' }</td>
                  </tr>
                  <tr style={ rowStyle }>
                    <th style={ tableHeadStyle }>Subject</th>
                    <td style={ tableItemStyle }>{ email?.e_Subject ?? 'Unknown' }</td>
                  </tr>
                  <tr style={ rowStyle }>
                    <th style={ tableHeadStyle }>X-Mailer</th>
                    <td style={ tableItemStyle }>{ email?.e_Headers.find(a => a.h_Key === 'x-mailer')?.h_Value ?? 'Unknown' } </td>
                  </tr>
                  <tr style={ rowStyle }>
                    <th style={ tableHeadStyle }>SPF</th>
                    <td style={ tableItemStyle }><em style={{
                      color: '#0875a7'
                    }}>{ email?.e_SPFVerified ?? 'Unknown' }</em></td>
                  </tr>
                  <tr style={ rowStyle }>
                    <th style={ tableHeadStyle }>DKIM</th>
                    <td style={ tableItemStyle }><em style={{
                      color: '#0875a7'
                    }}>{ email?.e_DKIMVerified ?? 'Unknown' }</em></td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div style={{
              margin: '2rem'
            }} className="wrapper"><pre style={{
              backgroundColor: '#fff',
              color: '#ff4444',
              border: '1px solid #e0e0e0',
              borderRadius: '0.3rem',
              padding: '1rem',
              wordWrap: 'break-word',
              overflowX: 'auto',
              whiteSpace: 'pre-wrap',
              margin: 'auto',
              maxWidth: '900px',
              width: 'calc(100vw - 6rem)'
            }} dangerouslySetInnerHTML={{__html: encoded ?? ''}}></pre></div>
          </body>
        </html>
      )
    );
  };

  public render = (): any => {
    const { email, error } = this.state;

    const classes = classnames({
      'email': true,
      'dark-mode__email': Config.darkmode,
      'light-mode__email': !Config.darkmode
    });

    if (error) {
      return (
        <div className={ classes }>
          <FullscreenMessage
            title="Parsing error"
            message={ error.toString() }
            icon={(
              <svg
                xmlns="http://www.w3.org/2000/svg"
                height="24"
                viewBox="0 0 24 24"
                width="24"
              >
                <path d="M0 0h24v24H0V0z" fill="none"/>
                <path d="M11 15h2v2h-2zm0-8h2v6h-2zm.99-5C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8z"/>
              </svg>
            )}
          />
        </div>
      );
    } else if (!email)
    {
      return (
        <div className={ classes }>
          <FullscreenMessage
            title="Parsing message"
            message="Please wait, this may take some time"
            loading
            icon={(
              <svg
                xmlns="http://www.w3.org/2000/svg"
                enable-background="new 0 0 24 24"
                height="24"
                viewBox="0 0 24 24" 
                width="24"
              >
                <g>
                  <rect fill="none" height="24" width="24"/></g><g>
                  <path d="M18,22l-0.01-6L14,12l3.99-4.01L18,2H6v6l4,4l-4,3.99V22H18z M8,7.5V4h8v3.5l-4,4L8,7.5z"/>
                </g>
              </svg>
            )}
          />
        </div>
      );
    }

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
        <div className={ classes }>
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
                  {/* <li>
                    <button type="button">Forward</button>
                  </li>
                  <li>
                    <button type="button">Reply</button>
                  </li> */}
                  <li>
                    <button type="button" onClick={ this.showDetails }>Details</button>
                  </li>
                  <li>
                    <button type="button" onClick={ this.download }>Download</button>
                  </li>
                  <li>
                    <button type="button" onClick={ this.viewRaw }>View raw</button>
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

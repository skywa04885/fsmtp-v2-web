import React from 'react';

import { MailboxesService } from '../services/Mailboxes.service';
import { EmailShortcut } from '../models/EmailShortcut.model';
import { EmailShortcutElement } from '../components/mailbox/EmailShortcutElement.component';

import './Mailbox.styles.scss';
import Config from '../Config';

interface InboxPageProps {
  mailbox: string,
  showLoader: (message: string) => {},
  hideLoader: () => {},
  setToolbar: (buttons: any[]) => {}
}

export default class MailboxPage extends React.Component<any, any>
{
  public state: {
    loading: boolean,
    page: number,
    shortcuts: EmailShortcut[],
    mailbox: string
  };

  public constructor(props: InboxPageProps)
  {
    super(props);

    this.state = {
      loading: false,
      page: 0,
      shortcuts: [],
      mailbox: '',
    };
  }

  public componentDidMount = (): void => {
    const { setToolbar, onCompose } = this.props;

    setToolbar([
      {
        icon: <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24"><path d="M0 0h24v24H0z" fill="none"/><path d="M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z"/></svg>,
        title: 'Refresh current mailbox',
        key: 'mailbox_refresh',
        callback: this.refresh
      },
      {
        icon: <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24"><path d="M0 0h24v24H0z" fill="none"/><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/></svg>,
        title: 'Compose an new message',
        key: 'mailbox_compose',
        callback: onCompose
      }
    ]);

    this.setState({
      mailbox: this.props.match.params.mailbox
    }, () => this.refresh());
  };
  
  public componentDidUpdate = (prev: InboxPageProps): void => {
    const { mailbox } = this.state;
    const newMailbox = this.props.match.params.mailbox;
    if (mailbox !== newMailbox)
    {
      this.setState({
        mailbox: newMailbox
      }, () => this.refresh());
    }
  };

  public refresh = (): void => {
    const { page, loading, mailbox } = this.state;
    Config.updateTitle(mailbox);

    if (!loading) this.setState({
      loading: true
    });

    setTimeout(() => {
      MailboxesService.gatherContents(mailbox, page).then(shortcuts => {
        this.setState({
          loading: false,
          shortcuts
        });
      }).catch(err => {});
    }, 100);
  };
  
  public onClick = (bucket: number, uuid: string): void => {
    const { history } = this.props;
    history.push(`/mail/${bucket}/${uuid}`);
  };

  public render = (): any => {
    const { loading, shortcuts } = this.state;
    const { params } = this.props.match;

    return (
      <React.Fragment>
        <div className="mailbox">
          <div className="mailbox__loader" hidden={!loading}>
            <div className="mailbox__loader-bar">
              <span />
            </div>
          </div>
          <ul className="mailbox__content">
            {shortcuts.length > 0 ?
              shortcuts.map(shortcut => {
                return (
                  <EmailShortcutElement
                    onClick={() => this.onClick(shortcut.e_Bucket, shortcut.e_EmailUUID)}
                    key={shortcut.e_UID}
                    shortcut={shortcut}
                  />
                )
              }) : (
                <div className="mailbox__content-empty">
                  <div className="mailbox__content-empty__picture">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      height="24"
                      viewBox="0 0 24 24"
                      width="24"
                    >
                      <path d="M0 0h24v24H0z" fill="none"/>
                      <path d="M14 6l-1-2H5v17h2v-7h5l1 2h7V6h-6zm4 8h-4l-1-2H7V6h5l1 2h5v6z"/>
                    </svg>
                  </div>
                  <div className="mailbox__content-empty__info">
                    <p>
                      <strong>Nothing here.</strong>
                      <br />
                      The currently selected mailbox <span>"{params.mailbox}"</span> does not contain anything.
                    </p>
                  </div>
                </div>
              )
            }
          </ul>
        </div>
      </React.Fragment>
    );
  };
}

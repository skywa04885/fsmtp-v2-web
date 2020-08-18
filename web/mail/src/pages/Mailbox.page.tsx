import React from 'react';

import { MailboxesService } from '../services/Mailboxes.service';
import { EmailShortcut } from '../models/EmailShortcut.model';
import { EmailShortcutElement } from '../components/mailbox/EmailShortcutElement.component';
import FullscreenMessage from '../components/misc/FullscreenMessage.component';
import Config from '../Config';
import { popup } from '..';

import './Mailbox.styles.scss';
import { ToolbarButton } from '../components/nav/Toolbar.component';
import { Mailbox } from '../models/Mailbox.model';
import { MailboxStatus } from '../models/MailboxStatus.model';

interface InboxPageProps {
  mailbox: string,
  showLoader: (message: string) => {},
  hideLoader: () => {},
  setToolbar: (buttons: any[]) => {},
  updateMailboxStat: (mailbox: string, add: boolean) => {}
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

  public updateToolbar = (): void => {
    const { setToolbar, onCompose } = this.props;
    const { mailbox } = this.props.match.params;

    let toolbarButtons: ToolbarButton[] = [
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
    ];

    if (mailbox === "INBOX.Trash") {
      toolbarButtons.push({
        icon: <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24"><path d="M0 0h24v24H0z" fill="none"/><path d="M0 0h24v24H0V0z" fill="none"/><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zm2.46-7.12l1.41-1.41L12 12.59l2.12-2.12 1.41 1.41L13.41 14l2.12 2.12-1.41 1.41L12 15.41l-2.12 2.12-1.41-1.41L10.59 14l-2.13-2.12zM15.5 4l-1-1h-5l-1 1H5v2h14V4z"/></svg>,
        title: 'Clear trash',
        key: 'mailbox_clear',
        callback: this.onTrashClear
      });
    }

    setToolbar(toolbarButtons);
  }

  public onTrashClear = (): void => {
    popup.current?.showButtons([
      {
        text: 'Clear trash',
        onClick: this.onClearTrashConfirm,
        icon: <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24"><path d="M0 0h24v24H0z" fill="none"/><path d="M0 0h24v24H0V0z" fill="none"/><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zm2.46-7.12l1.41-1.41L12 12.59l2.12-2.12 1.41 1.41L13.41 14l2.12 2.12-1.41 1.41L12 15.41l-2.12 2.12-1.41-1.41L10.59 14l-2.13-2.12zM15.5 4l-1-1h-5l-1 1H5v2h14V4z"/></svg>
      },
      {
        text: 'Cancel',
        onClick: () => popup.current?.hide(),
        icon: <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24"><path d="M0 0h24v24H0z" fill="none"/><path d="M12 2C6.47 2 2 6.47 2 12s4.47 10 10 10 10-4.47 10-10S17.53 2 12 2zm5 13.59L15.59 17 12 13.41 8.41 17 7 15.59 10.59 12 7 8.41 8.41 7 12 10.59 15.59 7 17 8.41 13.41 12 17 15.59z"/></svg>
      }
    ], 'Are you sure ?')
  };

  public onClearTrashConfirm = (): void => {
    const { showLoader, hideLoader, updateMailboxStat } = this.props;

    popup.current?.hide()
    showLoader('Clearing trash');

    MailboxesService.clearTrash().then(() => {
      hideLoader();
      updateMailboxStat("INBOX.Trash", 0);
      this.refresh();
    }).catch(err => {
      hideLoader();
      popup.current?.showText(err.toString(), 'Could not gather mailbox contents');
    });
  };

  public componentDidMount = (): void => {
    this.updateToolbar();
    this.setState({
      mailbox: this.props.match.params.mailbox
    }, () => this.refresh());
  };
  
  public componentDidUpdate = (prev: InboxPageProps): void => {
    const { mailbox } = this.state;
    const newMailbox = this.props.match.params.mailbox;
    if (mailbox !== newMailbox) {
      this.updateToolbar();
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
      }).catch(err => {
        popup.current?.showText(err.toString(), 'Could not gather mailbox contents');
      });
    }, 100);
  };
  
  public onClick = (bucket: number, uuid: string, mb?: string): void => {
    const { history } = this.props;
    const { mailbox } = this.state;
    if (mailbox === 'INBOX.Trash') {
      history.push(`/mail/${mailbox}/${bucket}/${uuid}?trash_orig_mb=${mb}`);
    } else {
      history.push(`/mail/${mailbox}/${bucket}/${uuid}`);
    }
  };

  public render = (): any => {
    const { loading, shortcuts } = this.state;
    const { mailbox } = this.props.match.params;

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
                    onClick={() => this.onClick(shortcut.e_Bucket, shortcut.e_EmailUUID, shortcut.e_Mailbox)}
                    key={shortcut.e_UID}
                    shortcut={shortcut}
                  />
                )
              }) : (
                <FullscreenMessage
                  title="Nothing here."
                  message={`The current mailbox "${ mailbox }" is either empty or does not exist.`}
                  icon={(
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      height="24"
                      viewBox="0 0 24 24"
                      width="24"
                    >
                      <path d="M0 0h24v24H0z" fill="none"/>
                      <path d="M14 6l-1-2H5v17h2v-7h5l1 2h7V6h-6zm4 8h-4l-1-2H7V6h5l1 2h5v6z"/>
                    </svg>
                  )}
                />
              )
            }
          </ul>
        </div>
      </React.Fragment>
    );
  };
}

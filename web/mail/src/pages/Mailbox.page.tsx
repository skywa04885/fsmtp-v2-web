import React from 'react';

import { MailboxesService } from '../services/Mailboxes.service';
import { EmailShortcut } from '../models/EmailShortcut.model';
import { EmailShortcutElement } from '../components/mailbox/EmailShortcutElement.component';

import './Mailbox.styles.scss';

interface InboxPageProps {
  mailbox: string,
  showLoader: (message: string) => {},
  hideLoader: () => {}
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

    if (!loading) this.setState({
      loading: true
    });

    setTimeout(() => {
      MailboxesService.gatherContents(mailbox, page).then(shortcuts => {
        this.setState({
          loading: false,
          shortcuts
        });
      });
    }, 100);
  };
  
  public onClick = (bucket: number, uuid: string): void => {
    const { history } = this.props;
    history.push(`/mail/${bucket}/${uuid}`);

    // const { showLoader, hideLoader } = this.props;
    // showLoader('Loading message');

    // setTimeout(() => {
    //   MailboxesService.getEmail(bucket, uuid).then(email => {
    //     hideLoader();
    //   }).catch(err => {
    //     hideLoader();
    //   });
    // }, 100);
  };

  public render = (): any => {
    const { loading, shortcuts } = this.state;

    return (
      <React.Fragment>
        <div className="mailbox">
          <div className="mailbox__loader" hidden={!loading}>
            <div className="mailbox__loader-bar">
              <span />
            </div>
          </div>
          <ul className="mailbox__content">
            {
              shortcuts.map(shortcut => {
                return (
                  <EmailShortcutElement
                    onClick={() => this.onClick(shortcut.e_Bucket, shortcut.e_EmailUUID)}
                    key={shortcut.e_UID}
                    shortcut={shortcut}
                  />
                )
              })
            }
          </ul>
        </div>
      </React.Fragment>
    );
  };
}

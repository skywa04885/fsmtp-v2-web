import React from 'react';
import { EmailShortcut } from '../models/EmailShortcut.model';
import { MailboxesService } from '../services/Mailboxes.service';
import { popup } from '..';
import Config from '../Config';
import FullscreenMessage from '../components/misc/FullscreenMessage.component';
import { EmailShortcutElement } from '../components/mailbox/EmailShortcutElement.component';
import classnames from 'classnames';

interface SearchPageProps {
  showLoader: (message: string) => {},
  hideLoader: () => {},
  setToolbar: (buttons: any[]) => {}
}

class SearchPage extends React.Component<any, any> {
  public state: {
    query: string,
    shortcuts: EmailShortcut[],
    loading: boolean
  };

  public constructor(props: SearchPageProps) {
    super(props);

    this.state = {
      query: '',
      shortcuts: [],
      loading: false
    };
  }

  public refresh = (): void => {
    const { query } = this.state;

    if (!query) return;

    this.setState({
      loading: true
    }, () => {
      MailboxesService.search(query).then(shortcuts => {
        this.setState({
          shortcuts,
          loading: false
        });
      }).catch(err => {
        popup.current?.showText(err.toString(), 'Could not perform search query');
      });
    })
  };

  public componentDidMount = (): void => {
    const { setToolbar } = this.props;

    setToolbar([
      {
        icon: <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24"><path d="M0 0h24v24H0z" fill="none"/><path d="M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z"/></svg>,
        title: 'Refresh current mailbox',
        key: 'mailbox_refresh',
        callback: this.refresh
      },
    ]);

    Config.updateTitle('Search');

    this.setState({
      mailbox: this.props.match.params.query
    }, () => this.refresh());
  };

  public componentDidUpdate = (prev: SearchPageProps): void => {
    const { query } = this.state;
    const newQuery = this.props.match.params.query;
    if (query != newQuery) {
      this.setState({
        query: newQuery
      }, () => this.refresh());
    }
  }

  public onClick = (bucket: number, uuid: string, mb?: string): void => {
    const { query } = this.state;
    const { history } = this.props;
    history.push(`/mail/${mb}/${bucket}/${uuid}?ret=${encodeURIComponent(`/search/${query}`)}`);
  };


  public render = (): any => {
    const { loading, shortcuts } = this.state;
    const { mailbox } = this.props.match.params;

    const classes = classnames({
      'mailbox': true,
      'dark-mode__mailbox': Config.darkmode,
      'light-mode__mailbox': !Config.darkmode
    });

    return (
      <React.Fragment>
        <div className={ classes }>
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
                    onClick={ () => this.onClick(shortcut.e_Bucket, shortcut.e_EmailUUID, shortcut.e_Mailbox) }
                    key={ shortcut.e_UID }
                    shortcut={ shortcut }
                    toggleSelected={ null }
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

export default SearchPage;
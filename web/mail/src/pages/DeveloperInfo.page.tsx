import React from 'react';
import classnames from 'classnames';

import Config from '../Config';
import { ToolbarButton } from '../components/nav/Toolbar.component';
import { AccountService } from '../services/Accounts.service';
import { MailboxesService } from '../services/Mailboxes.service';
import { Mailbox } from '../models/Mailbox.model';
import { MailboxStatus } from '../models/MailboxStatus.model';
import { popup } from '..';

import './DeveloperInfo.styles.scss';

interface DeveloperInfoProps {
  setToolbar: (buttons: ToolbarButton[]) => {},
  showLoader: (message: string) => {},
  hideLoader: () => {}
}

export default class DeveloperInfo extends React.Component<any, any> {
  public state: {
    mailboxes: Mailbox[],
    mailboxStats: MailboxStatus[]
  };
  
  constructor(props: DeveloperInfoProps) {
    super(props);

    this.state = {
      mailboxes: [],
      mailboxStats: []
    };
  }

  public componentDidMount = () => {
    const { setToolbar } = this.props;
    Config.updateTitle('Developer info for nerds');
    setToolbar([
      {
        icon: <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24"><path d="M0 0h24v24H0z" fill="none"/><path d="M19 8H5c-1.66 0-3 1.34-3 3v6h4v4h12v-4h4v-6c0-1.66-1.34-3-3-3zm-3 11H8v-5h8v5zm3-7c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zm-1-9H6v4h12V3z"/></svg>,
        callback: () => window.print(),
        title: 'Print',
        key: 'devinfo_print'
      }
    ]);

    this.load();
  };

  public load = (): void => {
    const { showLoader, hideLoader } = this.props;

    showLoader('Loading mailboxes');
    MailboxesService.gatherMailboxes()
    .then((mailboxes) => {
      MailboxesService.gatherMailboxStats(mailboxes)
        .then((mailboxStats) => {
          hideLoader();
          this.setState({
            mailboxes,
            mailboxStats
          });
        })
        .catch((err) => {
          hideLoader();
          popup.current?.showText(
            err.toString(),
            "Could not load statistics"
          );
        });
    })
    .catch((err) => {
      popup.current?.showText(err.toString(), "Could not load mailboxes");
    });
  };

  public render = (): any => {
    const { mailboxes, mailboxStats } = this.state;
    const accObj: any = AccountService.account.getObject();

    const classes = classnames({
      'developer-info': true,
      'dark-mode__developer-info': Config.darkmode,
      'light-mode__developer-info': !Config.darkmode
    });

    return (
      <div className={ classes }>
        <p>
          <strong>General</strong>
          Your account is the base which holds all the other information.
        </p>
        <div className="developer-info__section">
          <table>
            <caption>Account</caption>
            <thead>
              <tr>
                <th>Key</th>
                <th>Value</th>
              </tr>
            </thead>
            <tbody>
              {Object.keys(accObj).map((key, index) => {
                return (
                  <tr key={key}>
                    <th>{ key }</th>
                    <td>{ (accObj[key] ?? 'null').toString() }</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <p>
          <strong>Mailboxes</strong>
          The list of mailboxes stored under your account.
        </p>
        <hr />
        {mailboxes.map(mailbox => {
          const mbObj: any = mailbox.getObject();
          
          return (
            <div key={mailbox.e_MailboxPath} className="developer-info__section">
              <table>
                <caption>Mailbox '{mailbox.e_MailboxPath}'</caption>
                <thead>
                  <tr>
                    <th>Key</th>
                    <th>Value</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.keys(mbObj).map((key, index) => {
                    return (
                      <tr key={key}>
                        <th>{ key }</th>
                        <td>{ (mbObj[key] ?? 'null').toString() }</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )
        })}
        <p>
          <strong>Mailbox in memory stats</strong>
          The in memory stats for the mailboxes, these are updated
          when an email is being sent/received. As storage we use redis.
        </p>
        <hr />
        {mailboxes.map(mailbox => {
          const mbsObj: any = mailboxStats.find(a => a.s_Path === mailbox.e_MailboxPath)?.getObject();
          if (!mbsObj) return;

          return (
            <div key={mailbox.e_MailboxPath} className="developer-info__section">
              <table>
                <caption>Stats for '{mailbox.e_MailboxPath}'</caption>
                <thead>
                  <tr>
                    <th>Key</th>
                    <th>Value</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.keys(mbsObj).map((key, index) => {
                    return (
                      <tr key={key}>
                        <th>{ key }</th>
                        <td>{ (mbsObj[key] ?? 'null').toString() }</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )
        })}
      </div>
    )
  };
};
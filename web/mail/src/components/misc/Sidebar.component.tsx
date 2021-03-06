import React from "react";
import { NavLink } from "react-router-dom";
import { Mailbox } from "../../models/Mailbox.model";
import { MailboxStatus } from "../../models/MailboxStatus.model";

import { MailboxesService } from "../../services/Mailboxes.service";
import MusicPlayer from "../misc/MusicPlayer.component";
import { popup } from "../..";

import Fannst from '../../static/fannst-banner-light.png';
import "./Sidebar.styles.scss";

interface SidebarProps {
  showLoader: (message: string) => {};
  hideLoader: () => {};
}

export class Sidebar extends React.Component<any, any> {
  public state: {
    mailboxes: Mailbox[];
    mailboxStats: MailboxStatus[];
  };

  public constructor(props: SidebarProps) {
    super(props);

    this.state = {
      mailboxes: [],
      mailboxStats: [],
    };
  }

  public updateMailboxStat = (mailbox: string, add: number) => {
    const { mailboxStats } = this.state;

    let stat: MailboxStatus | undefined = mailboxStats.find(
      (a) => a.s_Path === mailbox
    );
    if (!stat) {
      return console.error(
        `Could not update status for: ${mailbox}, not found !`
      );
    }

    if (add !== 0) stat.s_Total += add;
    else stat.s_Total = 0;

    this.setState({});
  };

  public refresh = (): Promise<null> => {
    return new Promise<null>((resolve, reject) => {
      MailboxesService.gatherMailboxes()
        .then((mailboxes) => {
          MailboxesService.gatherMailboxStats(mailboxes)
            .then((mailboxStats) => {
              this.setState({
                mailboxes,
                mailboxStats
              }, () => resolve()
              );
            })
            .catch((err) => {
              popup.current?.showText(
                err.toString(),
                "Could not load statistics"
              );
              resolve();
            });
        })
        .catch((err) => {
          popup.current?.showText(err.toString(), "Could not load mailboxes");
          resolve();
        });
    });
  };

  public render = (): any => {
    const { mailboxes, mailboxStats } = this.state;

    return (
      <div className="sidebar" id="sidebar">
        <img src={Fannst} />
        <ul className="sidebar__ul">
          <li className="sidebar__ul__li">
            {/* Folder */}
            <div className="sidebar__ul__li__title">
              <strong>Folders: </strong>
            </div>
            <ul className="sidebar__ul__li__folders">
              {mailboxes.map((mailbox: Mailbox) => {
                return (
                  <li key={mailbox.e_MailboxPath}>
                    <NavLink
                      title={
                        mailbox.e_Bucket +
                        ":" +
                        mailbox.e_Domain +
                        ":" +
                        mailbox.e_MailboxPath
                      }
                      className="sidebar__folder"
                      activeClassName="sidebar__folder-active"
                      to={"/mailbox/" + mailbox.e_MailboxPath}
                    >
                      {mailbox.getIcon()}
                      {mailbox.getName()} (
                      {
                        mailboxStats.find(
                          (stat, n) => stat.s_Path === mailbox.e_MailboxPath
                        )?.s_Total
                      }
                      )
                    </NavLink>
                  </li>
                );
              })}
            </ul>
          </li>
          <hr />
          <li className="sidebar__ul__li">
            {/* Settings etcetera */}
            <p className="sidebar__ul__li__title">
              <strong>Other:</strong>
            </p>
            <ul className="sidebar__ul__li__folders">
              <li>
                <NavLink
                  to="/help/developer-info"
                  className="sidebar__folder"
                  activeClassName="sidebar__folder-active"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    height="24"
                    viewBox="0 0 24 24"
                    width="24"
                  >
                    <path d="M0 0h24v24H0z" fill="none" />
                    <path d="M7 5h10v2h2V3c0-1.1-.9-1.99-2-1.99L7 1c-1.1 0-2 .9-2 2v4h2V5zm8.41 11.59L20 12l-4.59-4.59L14 8.83 17.17 12 14 15.17l1.41 1.42zM10 15.17L6.83 12 10 8.83 8.59 7.41 4 12l4.59 4.59L10 15.17zM17 19H7v-2H5v4c0 1.1.9 2 2 2h10c1.1 0 2-.9 2-2v-4h-2v2z" />
                  </svg>
                  Developer Info
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/help/email-clients"
                  className="sidebar__folder"
                  activeClassName="sidebar__folder-active"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    height="24"
                    viewBox="0 0 24 24"
                    width="24"
                  >
                    <path d="M0 0h24v24H0z" fill="none" />
                    <path d="M4 6h18V4H4c-1.1 0-2 .9-2 2v11H0v3h14v-3H4V6zm19 2h-6c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h6c.55 0 1-.45 1-1V9c0-.55-.45-1-1-1zm-1 9h-4v-7h4v7z" />
                  </svg>
                  Email Clients
                </NavLink>
              </li>
            </ul>
          </li>
          <hr />
          <li className="sidebar__ul__li">
            {/* Music */}
            <p className="sidebar__ul__li__title">
              <strong>Lovely music:</strong>
            </p>
            <MusicPlayer />
          </li>
          <hr />
          <li className="sidebar__ul__li">
            <p className="sidebar__ul__li__text">FSMTP-V2 By Luke Rieff</p>
          </li>
        </ul>
      </div>
    );
  };
}

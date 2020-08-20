import React, { FormEvent } from 'react';
import classnames from 'classnames';
import { AccountService } from '../../services/Accounts.service';

import './Header.styles.scss';
import Config from '../../Config';


interface HeaderProps {
  toggleSidebar: () => {},
  toggleDarmMode: () => {}
};

export default class Header extends React.Component<any, any> {
  state: {
    showAccount: false
  };

  public constructor(props: HeaderProps) {
    super(props);

    this.state = {
      showAccount: false
    };
  }

  public onSearch = (e: FormEvent): void => {
    e.preventDefault();
  };
  
  public render = (): any => {
    const { showAccount } = this.state;
    const { toggleSidebar, toggleDarmMode } = this.props;

    const classes = classnames({
      'header': true,
      'dark-mode__header': Config.darkmode,
      'light-mode__header': !Config.darkmode
    });

    const dropdownClasses = classnames({
      'account-dropdown': true,
      'dark-mode__account-dropdown': Config.darkmode,
      'light-mode__account-dropdown': !Config.darkmode
    });

    return (
      <React.Fragment>
        {/* The header itself */}
        <div className={ classes } ref="header">
          {/* Menu and motd */}
          <div className="header__left">
            <button type="button" onClick={toggleSidebar} className="header__left__btn">
              <svg 
                xmlns="http://www.w3.org/2000/svg"
                height="24"
                viewBox="0 0 24 24"
                width="24"
              >
                <path d="M0 0h24v24H0z" fill="none"/>
                <path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z"/>
              </svg>
            </button>
            <div className="header__left__motd">
              <p>
                <a>Webmail</a>
              </p>
            </div>
          </div>
          {/* Search bar */}
          <div className="header__center">
            <form className="header__center__search-form" onSubmit={this.onSearch}>
              <input type="text" placeholder="Search ..." />
              <button type="submit">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  height="24"
                  viewBox="0 0 24 24"
                  width="24"
                >
                  <path d="M0 0h24v24H0z" fill="none"/>
                  <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
                </svg>
              </button>
            </form>
          </div>
          {/* Account stuff */}
          <div className="header__right">
            <div className="header__right__profile">
              <button type="button" onClick={() => this.setState({showAccount: !this.state.showAccount})}>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  height="24"
                  viewBox="0 0 24 24"
                  width="24"
                >
                  <path d="M0 0h24v24H0z" fill="none"/>
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/>
                </svg>
              </button>
            </div>
          </div>
        </div>
        {/* The account dropdown */}
        {showAccount? (
          <div className={ dropdownClasses }>
            <div className="account-dropdown__head">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                height="24"
                viewBox="0 0 24 24"
                width="24"
              >
                <path d="M0 0h24v24H0z" fill="none"/>
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/>
              </svg>
              <p>
                <strong>{AccountService.account.a_FullName}</strong>
                <br />
                {AccountService.account.a_Username}@{AccountService.account.a_Domain}
                <br />
                <small>User {AccountService.account.a_Bucket}:{AccountService.account.a_UUID}</small>
              </p>
            </div>
            <hr />
            <div className="account-dropdown__togglers">
              <form onSubmit={e => e.preventDefault()}>
                <div>
                  <label htmlFor="accountDropdownDMToggler">Dark-mode</label>
                  <input checked={Config.darkmode} onChange={toggleDarmMode} id="accountDropdownDMToggler" type="checkbox" />
                </div>
              </form>
            </div>
            <hr />
            <ul>
              <li>
                <button
                  type="button"
                  onClick={() => AccountService.logout()}
                >
                  Logout
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => window.location.href = '/auth/login'}
                >
                  Switch account
                </button>
              </li>
            </ul>
          </div>
        ): null}
      </React.Fragment>
    );
  };
};

import React from 'react';

import { MailboxesService } from '../services/Mailboxes.service';
import { parse } from '../parsers/MIMEParser.parser';
import { Email, EmailAddress, EmailContentType } from '../models/Email.model';

import './Email.styles.scss';

interface EmailPageProps {
  bucket: number,
  domain: string,
  ownersUuid: string,
  emailUuid: string
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

    MailboxesService.getEmail(bucket, uuid).then(data => {
      parse(data).then(email => {
        this.setState({
          email
        });
      }).catch(err => {
        this.setState({
          error: err
        });
      })
    });
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

    let contentIndex: number;
    let htmlIndex: number = -1, textIndex: number = -1, i: number = 0;
    for (let section of email.e_Sections) {
      if (section.e_Type === EmailContentType.TextPlain) textIndex = i;
      if (section.e_Type === EmailContentType.TextHTML) htmlIndex = i;
      i++;
    }

    if (htmlIndex !== -1) contentIndex = htmlIndex;
    else if (textIndex !== -1) contentIndex = textIndex;
    else contentIndex = -1;

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
                <hr />
                <span>To: </span>
                { this.renderAddressList(email?.e_To) }
              </div>
              <div className="email__content-header__right">
                <ul>
                  <li>
                    <button type="button">Forward</button>
                  </li>
                  <li>
                    <button type="button">Reply</button>
                  </li>
                </ul>
              </div>
            </div>
            <div className="email__content-readable">
              <h2>{ email.e_Subject }</h2>
              <iframe srcDoc={email.e_Sections[contentIndex].e_Content}></iframe>
            </div>
          </div>
        </div>
      </React.Fragment>
    );
  };
}

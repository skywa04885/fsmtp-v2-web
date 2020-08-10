import React from 'react';

import { MailboxesService } from '../services/Mailboxes.service';
import { parse } from '../parsers/MIMEParser.parser';

interface EmailPageProps {
  bucket: number,
  domain: string,
  ownersUuid: string,
  emailUuid: string
}

export default class EmailPage extends React.Component<any, any> {
  public constructor(props: EmailPageProps) {
    super(props);
  }

  public componentDidMount = (): void => {
    const { bucket, uuid } = this.props.match.params;

    MailboxesService.getEmail(bucket, uuid).then(data => {
      parse(data);
    });
  };

  public render = (): any => {
    return (
      <React.Fragment>
        <div className="email__page">
          
        </div>
      </React.Fragment>
    );
  };
}

import React from 'react';

import './EmailClients.styles.scss';

import EmailClientExample from '../static/email-client-example.png';
import { ToolbarButton } from '../components/nav/Toolbar.component';
import Config from '../Config';

interface EmailClientsProps {
  setToolbar: (buttons: ToolbarButton[]) => {},
};

class EmailClients extends React.Component<any, any> {
  public constructor(props: EmailClientsProps) {
    super(props);
  }

  componentDidMount = () => {
    const { setToolbar } = this.props;
    Config.updateTitle('Email Clients');
    setToolbar([]);
  };

  public render = (): any => {
    return (
      <div className="email__clients">
        <h1>Email Clients</h1>
        <p>
          If you want to access your messages from your phone or desktop computer,
          please read the details bellow..
        </p>
        <hr />
        <div className="email__clients-conninfo">
          <table>
            <caption>POP3 Server</caption>
            <thead>
              <tr>
                <th></th>
                <th>Hostname</th>
                <th>Port</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <th>SSL</th>
                <td>fannst.nl</td>
                <td><span>995</span></td>
              </tr>
              <tr>
                <th>STARTTLS</th>
                <td>fannst.nl</td>
                <td><span>110</span></td>
              </tr>
            </tbody>
          </table>
          <table>
            <caption>ESMTP Server</caption>
            <thead>
              <tr>
                <th></th>
                <th>Hostname</th>
                <th>Port</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <th>SSL</th>
                <td>fannst.nl</td>
                <td><span>465</span></td>
              </tr>
              <tr>
                <th>STARTTLS</th>
                <td>fannst.nl</td>
                <td><span>25</span></td>
              </tr>
            </tbody>
          </table>
        </div>
        <hr />
        <h2>Example</h2>
        <p>The following image contains an correctly configured thunderbird client..</p>
        <img src={EmailClientExample} />
      </div>
    );
  }
};

export default EmailClients;

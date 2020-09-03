import React from 'react';
import classnames from 'classnames';
import { EmailShortcut } from '../../models/EmailShortcut.model';

import './EmailShortcutElement.styles.scss';
import Config from '../../Config';

interface EmailShortcutElementProps {
  shortcut: EmailShortcut,
  onClick: any,
  toggleSelected: any
}

export const EmailShortcutElement = (props: EmailShortcutElementProps): any => {
  const { e_Subject, e_Preview, e_SizeOctets, e_From, e_Selected, e_Mailbox } = props.shortcut;
  const { onClick } = props;
  
  const classes = classnames({
    'email-shortcut-elem': true,
    'dark-mode__email-shortcut-elem': Config.darkmode,
    'light-mode__email-shortcut-elem': !Config.darkmode,
    'dark-mode__email-shortcut-elem_sl': Config.darkmode && e_Selected,
    'light-mode__email-shortcut-elem_sl': !Config.darkmode && e_Selected,
    'email-shortcut-elem__warn': e_Mailbox === "INBOX.Spam"
  });

  const toggleSelected = (e: any) => {    
    const { toggleSelected } = props;
    const { e_UID } = props.shortcut;

    toggleSelected(e.target.checked, e_UID);
  };
  
  return (
    <li className={ classes }>
      <a onClick={ onClick } title="Open message">
        <div className="email-shortcut-elem__left">
          <div className="email-shortcut-elem__left__cb">
            <input checked={e_Selected} onChange={ toggleSelected } onClick={ e => e.stopPropagation() } type="checkbox" />
          </div>
          <p>{ e_From }</p>
        </div>
        <div className="email-shortcut-elem__middle">
          <p><strong>{ e_Subject }</strong> - { e_Preview }</p>
        </div>
        <div className="email-shortcut-elem__right">
          <p>{ Math.round(e_SizeOctets / 1000 * 10) / 10 } KB</p>
        </div>
      </a>
    </li>
  );
};
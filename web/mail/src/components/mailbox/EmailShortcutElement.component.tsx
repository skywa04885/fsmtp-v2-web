import React from 'react';

import { EmailShortcut } from '../../models/EmailShortcut.model';

import './EmailShortcutElement.styles.scss';

interface EmailShortcutElementProps {
  shortcut: EmailShortcut,
  onClick: any
}

export const EmailShortcutElement = (props: EmailShortcutElementProps): any => {
  const { e_Subject, e_Preview, e_SizeOctets } = props.shortcut;
  const { onClick } = props;
  
  return (
    <li className="email-shortcut-elem">
      <a onClick={onClick}>
        <div className="email-shortcut-elem__left">
          <div className="email-shortcut-elem__left__cb">
            <input type="checkbox" />
          </div>
          <p>TODO: Add from</p>
        </div>
        <div className="email-shortcut-elem__middle">
          <p><strong>{ e_Subject }</strong> - { e_Preview }</p>
        </div>
        <div className="email-shortcut-elem__right">
          <p>{ Math.round(e_SizeOctets / 1024 * 10) / 10 } KB</p>
        </div>
      </a>
    </li>
  );
};
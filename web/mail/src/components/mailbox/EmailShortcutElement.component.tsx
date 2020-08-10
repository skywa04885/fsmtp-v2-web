import React from 'react';

import { EmailShortcut } from '../../models/EmailShortcut.model';

import './EmailShortcutElement.styles.scss';

interface EmailShortcutElementProps {
  shortcut: EmailShortcut
}

export const EmailShortcutElement = (props: EmailShortcutElementProps): any => {
  const { e_Subject, e_Preview, e_SizeOctets } = props.shortcut;
  
  return (
    <li className="email-shortcut-elem">
      <a>
        <div className="email-shortcut-elem__left">
          <p>{ e_Subject }</p>
        </div>
        <div className="email-shortcut-elem__middle">
          <p>{ e_Preview }</p>
        </div>
        <div className="email-shortcut-elem__right">

        </div>
      </a>
    </li>
  );
};
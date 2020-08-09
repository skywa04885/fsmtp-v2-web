import React from 'react';
import cnames from 'classnames';

import './DefaultButton.styles.scss';

interface DefaultButtonProps {
  active: boolean,
  children: any,
  type: string
}

export default class DefaultButton extends React.Component<any, any> {
  public constructor(props: DefaultButtonProps) {
    super(props);
  }

  public render = (): any => {
    const { children, active, type } = this.props;
    const classnames = cnames({
      'default-button': true,
      'default-button_active': active,
      'default-button_inactive': !active
    });

    return (
      <button type={type} className={classnames}>{children}</button>
    );
  };
}

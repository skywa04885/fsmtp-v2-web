import React from 'react';
import classnames from 'classnames';

import './Toolbar.styles.scss';
import Config from '../../Config';

interface ToolbarProps {}

export interface ToolbarButton {
  callback: any,
  icon: any,
  title: string,
  key: string
}

export class Toolbar extends React.Component<any, any> {
  public state: {
    buttons: ToolbarButton[]
  };

  public constructor(props: ToolbarProps) {
    super(props);

    this.state = {
      buttons: []
    };
  }

  private getElements = (): any[] => {
    const { buttons } = this.state;

    return buttons.map(button => {
      return (
        <li title={button.title} key={button.key} className="toolbar__list__elem">
          <button type="button" onClick={button.callback}>
            {button.icon}
          </button>
        </li>
      );
    });
  };

  public setToolbar = (buttons: ToolbarButton[]) => {
    this.setState({ buttons });
  };

  public render = (): any => {
    const classes = classnames({
      'toolbar': true,
      'dark-mode__toolbar': Config.darkmode,
      'light-mode__toolbar': !Config.darkmode
    })

    return (
      <div className={ classes }>
        <ul className="toolbar__list">
          { this.getElements() }
        </ul>
      </div>
    );
  };
};

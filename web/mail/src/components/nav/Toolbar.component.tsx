import React from 'react';

import './Toolbar.styles.scss';

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
    return (
      <div className="toolbar">
        <ul className="toolbar__list">
          { this.getElements() }
        </ul>
      </div>
    );
  };
};

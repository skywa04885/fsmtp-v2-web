import React from 'react';

import './Popup.styles.scss';

interface PopupComponentProps {

}

export enum PopupType {
  Buttons,
  List,
  Text,
  Error,
  Custom,
  None
};

interface PopupButton {
  onClick: any,
  text: string,
  icon: any
}

interface PopupListItem {
  onClick: any,
  text: string,
  icon: any
}

export default class Popup extends React.Component<any, any> {
  public state: {
    title?: string,
    buttons?: PopupButton[],
    listItems?: PopupListItem[],
    text?: string,
    custom?: any,
    show: boolean,
    type: PopupType
  };
  
  public constructor(props: PopupComponentProps) {
    super(props);

    this.state = {
      show: false,
      type: PopupType.Error
    };
  }

  public close = (): void => {
    this.setState({ show: false });
  };

  public showButtons = (buttons: PopupButton[], title: string) => {
    this.setState({
      buttons, title,
      show: true,
      type: PopupType.Buttons
    });
  };

  public showList = (listItems: PopupListItem[], title: string) => {
    this.setState({
      listItems, title,
      show: true,
      type: PopupType.List
    });
  };

  public showText = (text: string, title: string) => {
    this.setState({
      text, title,
      show: true,
      type: PopupType.Text
    });
  };

  public showCustom = (custom: any, title: string) => {
    this.setState({
      custom, title,
      show: true,
      type: PopupType.Custom
    });
  };

  public hide = () => {
    this.setState({
      show: false,
      type: PopupType.None
    });
  };

  public getContent = (): any => {
    const { type, buttons, listItems, text, custom } = this.state;

    switch (type)
    {
      case PopupType.Buttons:
        return (
          <ul className="popup__content__buttons">
            { buttons?.map(({ onClick, icon, text }) => (
              <li>
                <button type="button" onClick={onClick}>
                  { icon }<span>{ text }</span>
                </button>
              </li>
            )) }
          </ul>
        );
      case PopupType.List:
        return (
          <ul className="popup__content__list">
            { listItems?.map(({ onClick, icon, text }) => (
              <li onClick={onClick}>
                <p>
                  { icon }<span>{ text }</span>
                </p>
              </li>
            )) }
          </ul>
        );
      case PopupType.Text:
        return (
          <p className="popup__content__text">{ text }</p>
        );
      case PopupType.Custom:
        return custom;
      default: return null;
    }
  };

  public render = (): any => {
    const { title, show } = this.state;

    if (!show) return null;
    
    return (
      <React.Fragment>
        <div className="popup-background" onClick={this.close} />
        <div className="popup">
          <p className="popup__title">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              height="24"
              viewBox="0 0 24 24"
              width="24"
            >
              <path d="M0 0h24v24H0V0z" fill="none"/>
              <path d="M18 16v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2zm-5 0h-2v-2h2v2zm0-4h-2V8h2v4zm-1 10c1.1 0 2-.9 2-2h-4c0 1.1.89 2 2 2z"/>
            </svg>
            <strong>{ title }</strong>
          </p>
          <hr />
          <div className="popup__content">
            { this.getContent() }
          </div>
        </div>
      </React.Fragment>
    );
  };
}
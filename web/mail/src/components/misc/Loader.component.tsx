import React from 'react';

import './Loader.styles.scss';

interface LoaderProps {}

export default class Loader extends React.Component<any, any> {
  public state: {
    show: boolean,
    message: string
  };

  public constructor(props: LoaderProps) {
    super(props);

    this.state = {
      show: false,
      message: ''
    };
  }

  public show = (message: string): void => {
    this.setState({
      show: true,
      message
    });
  };

  public hide = (): void => {
    this.setState({
      show: false
    });
  };

  public render = (): any => {
    const { message, show } = this.state;

    if (!show) return null;
    else return (
      <div className="loader">
        <div className="loader__bar">
          <span /><span />
        </div>
        <p className="loader__message">
          { message }&nbsp;
          <span>.</span>
          <span>.</span>
          <span>.</span>
        </p>
      </div>
    );
  };
}

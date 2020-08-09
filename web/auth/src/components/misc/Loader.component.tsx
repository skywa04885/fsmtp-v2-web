import React from 'react';

import './Loader.styles.scss';

interface LoaderProps {

}

export default class Loader extends React.Component<any, any> {
  state: {
    show: boolean,
    message: string
  }

  public constructor(props: LoaderProps)
  {
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
    const { show, message } = this.state;

    if (!show) return null;

    return (
      <div className="loader">
        <div className="loader__bar">
          <span></span>
        </div>
        <div className="loader__message">
          <p>{ message }</p>
        </div>
      </div>
    );
  };
}

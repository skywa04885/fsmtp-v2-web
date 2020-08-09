import React from 'react';

import FannstBanner from '../../static/fannst-banner-light.png';
import './Splashscreen.styles.scss';

interface SplashscreenProps {
  message: string
}

export default class Splashscreen extends React.Component<any, any> {
  public constructor(props: SplashscreenProps) {
    super(props);
  }

  public render = (): any => {
    const { message } = this.props;

    return (
      <div className="splashscreen">
        <img className="splashscreen__motd" src={FannstBanner} />
        <div className="splashscreen__loader">
          <span /><span />
        </div>
        <div className="splashscreen__message">
          { message }&nbsp;
          <span>.</span>
          <span>.</span>
          <span>.</span>
        </div>
      </div>
    );
  };
}

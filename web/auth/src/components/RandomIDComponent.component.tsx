import React from 'react';
import crypto from 'crypto';

export default class RandomIDComponent extends React.Component<any, any> {
  state: {
    randomID: string
  };

  public constructor(props: any)
  {
    super(props);

    this.state = {
      randomID: Math.round(Date.now() * Math.random()).toString(36)
    };
  }
};

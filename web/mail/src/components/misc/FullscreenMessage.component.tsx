import React from 'react';
import classnames from 'classnames';
import Config from '../../Config';

import './FullscreenMessage.styles.scss';

const FullscreenMessage = ({ icon, title, message, loading }: any) => {
  const classes = classnames({
    'fullscreen-message': true,
    'dark-mode__fullscreen-message': Config.darkmode,
    'light-mode__fullscreen-message': !Config.darkmode
  });

  return (
    <div className={ classes }>
      <div className="fullscreen-message__picture">
        { icon }
      </div>
      <div className="fullscreen-message__info">
        <p>
          <strong>{ title } { loading ? (
            <React.Fragment>
              <span>.</span>
              <span>.</span>
              <span>.</span>
            </React.Fragment>
          ) : null }</strong>
          <br />
          { message }
        </p>
      </div>
    </div>
  );
};

export default FullscreenMessage;

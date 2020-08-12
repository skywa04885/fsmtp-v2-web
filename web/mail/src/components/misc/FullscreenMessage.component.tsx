import React from 'react';

import './FullscreenMessage.styles.scss';

const FullscreenMessage = ({ icon, title, message, loading }: any) => {
  return (
    <div className="fullscreen-message">
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

import React from 'react';

import './MusicPlayer.styles.scss';

const music: any = require('../../static/bgm.mp3');

const MusicPlayer = ({}): any => {
  return (
    <div className="music-player">
      <audio controls autoPlay loop>
        <source src={music} />
      </audio>
    </div>
  );
};

export default MusicPlayer;
import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './app';
import * as serviceWorker from './serviceWorker';
import { BrowserRouter } from 'react-router-dom';
import Popup from './components/misc/Popup.component';

export const popup: React.RefObject<Popup> = React.createRef<Popup>();

ReactDOM.render(
  <BrowserRouter basename="/mail">
    <Popup ref={popup} />
    <App />
  </BrowserRouter>,
  document.getElementById('root')
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();

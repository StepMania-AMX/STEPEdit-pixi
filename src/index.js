import React from 'react';
import { createRoot } from 'react-dom/client';
import WebFont from 'webfontloader';

import App from './App';
import './index.css';

const renderApp = () => {
  createRoot(document.getElementById('root')).render(<App />);
};

WebFont.load({
  google: {
    families: ['Open Sans'],
  },
  active: renderApp,
  inactive: renderApp,
});

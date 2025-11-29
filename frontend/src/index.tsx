import React             from 'react';
import { createRoot }    from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom'
import App               from './App.jsx';
import service           from './services/service';
import SnackbarManager   from './components/SnackbarManager.jsx';

// Import theme CSS files
import './theme/fonts.css';
import './theme/animations.css';
import './theme/third-party.css';

const container = document.getElementById('root');
const root = createRoot(container);
root.render(
  <BrowserRouter>
    <div>
      <SnackbarManager />
      <App />
    </div>
  </BrowserRouter>
);

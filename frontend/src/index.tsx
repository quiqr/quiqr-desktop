import React             from 'react';
import { createRoot }    from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom'
import App               from './App.jsx';
import service           from './services/service';
import SnackbarManager   from './components/SnackbarManager.jsx';

// Import CSS files directly - Vite will handle them
import './app-ui-styles/quiqr10/css/index.css';
import './app-ui-styles/quiqr10/css/bootstrap-grid.css';
import './app-ui-styles/components.css';

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

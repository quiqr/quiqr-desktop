import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom'
import App               from './App';
import SnackbarManager   from './components/SnackbarManager';

console.log("CONSOLE!")

const container = document.getElementById('root');
const root = createRoot(container!);
root.render(
  <BrowserRouter>
    <div>
      <SnackbarManager />
      <App />
    </div>
  </BrowserRouter>
);

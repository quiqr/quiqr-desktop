import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router'
import App               from './App';
import SnackbarManager   from './components/SnackbarManager';
import { SnackbarProvider } from './contexts/SnackbarContext';
import { ConsoleProvider } from './contexts/ConsoleContext';

console.log("CONSOLE!")

const container = document.getElementById('root');
const root = createRoot(container!);
root.render(
  <SnackbarProvider>
    <ConsoleProvider>
      <BrowserRouter>
        <div>
          <SnackbarManager />
          <App />
        </div>
      </BrowserRouter>
    </ConsoleProvider>
  </SnackbarProvider>
);

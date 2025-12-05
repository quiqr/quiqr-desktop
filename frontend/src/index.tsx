import { createRoot }    from 'react-dom/client';
import { BrowserRouter } from 'react-router'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import App               from './App.jsx';
import SnackbarManager   from './components/SnackbarManager.jsx';

// Import theme CSS files
import './theme/fonts.css';
import './theme/animations.css';
import './theme/third-party.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30 * 1000,
      gcTime: 5 * 60 * 1000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 1,
    },
  },
});

const container = document.getElementById('root');
const root = createRoot(container!);
root.render(
  <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      <div>
        <SnackbarManager />
        <App />
      </div>
    </BrowserRouter>
  </QueryClientProvider>
);

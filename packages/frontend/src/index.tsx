// Must be imported before React
import { scan } from "react-scan";

scan({
  enabled: false,
});

import { createRoot }    from 'react-dom/client';
import { BrowserRouter } from 'react-router'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import App               from './App.jsx';
import SnackbarManager   from './components/SnackbarManager.jsx';
import { SnackbarProvider } from './contexts/SnackbarContext';
import { isErrorWithResponse } from './utils/type-guards';

// Import theme CSS files
import './theme/fonts.css';
import './theme/animations.css';
import './theme/third-party.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30 * 1000, // 30 seconds - can be overridden per query
      gcTime: 5 * 60 * 1000, // Cache for 5 minutes after query becomes unused
      retry: (failureCount, error: unknown) => {
        // Don't retry on 4xx errors (client errors)
        if (isErrorWithResponse(error) && error.response.status >= 400 && error.response.status < 500) {
          return false;
        }
        // Retry up to 2 times for network/server errors
        return failureCount < 2;
      },
      refetchOnWindowFocus: false,
      refetchOnReconnect: true, // Refetch on network reconnect
    },
    mutations: {
      retry: 1, // Retry mutations once on failure
      onError: (error) => {
        console.error('Mutation error:', error);
        // TODO: Could integrate with SnackbarContext here for global error handling
      },
    },
  },
});

const container = document.getElementById('root');
const root = createRoot(container!);
root.render(
  <QueryClientProvider client={queryClient}>
    <SnackbarProvider>
      <BrowserRouter>
        <div>
          <SnackbarManager />
          <App />
        </div>
      </BrowserRouter>
    </SnackbarProvider>
    <ReactQueryDevtools initialIsOpen={false} />
  </QueryClientProvider>
);

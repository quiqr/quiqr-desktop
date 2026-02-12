// src/test/test-utils.tsx
import { ReactElement, ReactNode } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { ThemeProvider, StyledEngineProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { getThemeByName } from '../src/theme'; // adjust path as needed

const theme = getThemeByName('light');

interface WrapperProps {
  children: ReactNode;
}

function AllTheProviders({ children }: WrapperProps) {
  // Create a new QueryClient for each test to ensure isolation
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false, // Disable retries in tests
      },
    },
  });

  return (
    <QueryClientProvider client={queryClient}>
      <StyledEngineProvider injectFirst>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          {children}
        </ThemeProvider>
      </StyledEngineProvider>
    </QueryClientProvider>
  );
}

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { wrapper: AllTheProviders, ...options });

// Re-export everything
export * from '@testing-library/react';

// Override render method
export { customRender as render };
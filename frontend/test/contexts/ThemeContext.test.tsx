/**
 * ThemeContext Tests
 *
 * Tests the theme context provider and hook functionality.
 *
 * @vitest-environment jsdom
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { useAppTheme, ThemeContext } from '../../src/contexts/ThemeContext';

describe('ThemeContext', () => {
  describe('useAppTheme hook', () => {
    it('throws error when used outside ThemeProvider', () => {
      const TestComponent = () => {
        useAppTheme();
        return <div>Test</div>;
      };

      // Expect the component to throw when useAppTheme is called outside provider
      expect(() => render(<TestComponent />)).toThrow(
        'useAppTheme must be used within a ThemeProvider'
      );
    });

    it('provides updateTheme function when used inside ThemeProvider', () => {
      const mockUpdateTheme = vi.fn();

      const TestComponent = () => {
        const { updateTheme } = useAppTheme();
        return (
          <button onClick={() => updateTheme('quiqr10-dark')}>
            Change Theme
          </button>
        );
      };

      render(
        <ThemeContext.Provider value={{ updateTheme: mockUpdateTheme }}>
          <TestComponent />
        </ThemeContext.Provider>
      );

      const button = screen.getByRole('button', { name: /change theme/i });
      button.click();

      expect(mockUpdateTheme).toHaveBeenCalledWith('quiqr10-dark');
      expect(mockUpdateTheme).toHaveBeenCalledTimes(1);
    });

    it('allows multiple components to access the same updateTheme function', () => {
      const mockUpdateTheme = vi.fn();

      const ComponentA = () => {
        const { updateTheme } = useAppTheme();
        return <button onClick={() => updateTheme('light')}>Light</button>;
      };

      const ComponentB = () => {
        const { updateTheme } = useAppTheme();
        return <button onClick={() => updateTheme('dark')}>Dark</button>;
      };

      render(
        <ThemeContext.Provider value={{ updateTheme: mockUpdateTheme }}>
          <ComponentA />
          <ComponentB />
        </ThemeContext.Provider>
      );

      const lightButton = screen.getByRole('button', { name: /light/i });
      const darkButton = screen.getByRole('button', { name: /dark/i });

      lightButton.click();
      expect(mockUpdateTheme).toHaveBeenCalledWith('light');

      darkButton.click();
      expect(mockUpdateTheme).toHaveBeenCalledWith('dark');

      expect(mockUpdateTheme).toHaveBeenCalledTimes(2);
    });
  });
});

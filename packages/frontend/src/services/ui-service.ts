import { useSnackbar } from '../contexts/SnackbarContext';
import { useConsole } from '../contexts/ConsoleContext';

export const snackMessageService = {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  addSnackMessage: (...args: Parameters<ReturnType<typeof useSnackbar>['addSnackMessage']>) => {
    console.warn('Direct snackMessageService usage is deprecated. Use useSnackbar() hook in components.');
    throw new Error('snackMessageService can only be used within React components via useSnackbar() hook');
  },
  getCurrentSnackMessage: () => {
    console.warn('Direct snackMessageService usage is deprecated. Use useSnackbar() hook in components.');
    return undefined;
  },
  getPreviousSnackMessage: () => {
    console.warn('Direct snackMessageService usage is deprecated. Use useSnackbar() hook in components.');
    return undefined;
  },
  reportSnackDismiss: () => {
    console.warn('Direct snackMessageService usage is deprecated. Use useSnackbar() hook in components.');
  }
};

export const consoleService = {
  getConsoleMessages: () => {
    console.warn('Direct consoleService usage is deprecated. Use useConsole() hook in components.');
    return [];
  }
};

export { useSnackbar, useConsole };

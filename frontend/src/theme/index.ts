import { createTheme, ThemeOptions } from '@mui/material/styles';

// Layout constants (previously in style-*.js)
export const LAYOUT_CONSTANTS = {
  topBarHeight: 52,
  sidebarWidth: 280,
  sidebarCollapsedOffset: 214, // 280 - 66
  sidebarVisibleWidth: 66,
} as const;

// Light theme palette
const lightPalette = {
  mode: 'light' as const,
  primary: {
    main: '#2196f3', // blue[500]
  },
  background: {
    default: '#eaebed',
    paper: '#fff',
  },
  sidebar: {
    background: 'linear-gradient(to bottom right, #eaebed, #eaebed)',
  },
  toolbar: {
    background: '#eaebed',
    border: '#c7c5c4',
  },
};

// Dark theme palette
const darkPalette = {
  mode: 'dark' as const,
  primary: {
    main: '#2196f3',
  },
  background: {
    default: '#222',
    paper: '#333',
  },
  sidebar: {
    background: '#222',
  },
  toolbar: {
    background: '#222',
    border: '#c7c5c4',
  },
};

// Base theme options shared by both themes
const getBaseTheme = (): ThemeOptions => ({
  typography: {
    fontFamily: 'Roboto, sans-serif',
    h1: { fontFamily: 'Roboto, sans-serif', fontWeight: 400 },
    h2: { fontFamily: 'Roboto, sans-serif', fontWeight: 400 },
    h3: { fontFamily: 'Roboto, sans-serif', fontWeight: 400 },
    h4: { fontFamily: 'Roboto, sans-serif', fontWeight: 400 },
    h5: { fontFamily: 'Roboto, sans-serif', fontWeight: 400 },
    body1: { fontFamily: 'Roboto, sans-serif' },
    body2: { fontFamily: 'Roboto, sans-serif' },
    fontWeightRegular: 400,
  },
  spacing: 8, // MUI default, but explicit
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          margin: 0,
          padding: 0,
          fontFamily: 'Roboto, sans-serif',
        },
        // Custom scrollbar
        '::-webkit-scrollbar': {
          width: '12px',
          height: '5px',
        },
        '::-webkit-scrollbar-track': {
          boxShadow: 'inset 0 0 4px rgba(0,0,0,0.3)',
        },
        '::-webkit-scrollbar-thumb': {
          backgroundColor: 'darkgrey',
          outline: '1px solid slategrey',
        },
        '.hideScrollbar::-webkit-scrollbar': {
          display: 'none',
        },
        '.hideScrollbar': {
          borderRight: 'solid 1px #c7c5c4',
        },
        // Markdown styles
        '.markdown': {
          lineHeight: 1.5,
          '& table': {
            borderCollapse: 'collapse',
            minWidth: '50%',
          },
          '& th, & td': {
            padding: '12px 15px',
            textAlign: 'left',
            borderBottom: '1px solid #E1E1E1',
          },
          '& th:first-of-type, & td:first-of-type': {
            paddingLeft: 0,
          },
          '& th:last-child, & td:last-child': {
            paddingRight: 0,
          },
        },
        // Site home text links
        '.site-home-text a, .site-home-text a:visited': {
          color: '#2196f3',
        },
        // Pre/code styling
        'pre, code': {
          wordWrap: 'break-word',
          whiteSpace: 'pre-wrap',
        },
        // Checkered background pattern
        '.checkered': {
          height: '240px',
          background: `linear-gradient(45deg, rgba(0, 0, 0, 0.0980392) 25%, transparent 25%, transparent 75%, rgba(0, 0, 0, 0.0980392) 75%, rgba(0, 0, 0, 0.0980392) 0),
            linear-gradient(45deg, rgba(0, 0, 0, 0.0980392) 25%, transparent 25%, transparent 75%, rgba(0, 0, 0, 0.0980392) 75%, rgba(0, 0, 0, 0.0980392) 0),
            white`,
          backgroundRepeat: 'repeat, repeat',
          backgroundPosition: '0px 0, 5px 5px',
          backgroundSize: '10px 10px, 10px 10px',
        },
        // LED indicator styles
        '.led': {
          width: '13px',
          height: '13px',
          display: 'inline-block',
          margin: '0 5px',
          borderRadius: '50%',
          backgroundColor: 'rgba(255, 255, 255, 0.25)',
          boxShadow: '#000 0 -1px 4px 1px',
        },
        '.led-red': {
          backgroundColor: '#F00',
          boxShadow: '#000 0 -1px 6px 1px, inset #600 0 -1px 8px, #F00 0 3px 11px',
        },
        '.led-green': {
          backgroundColor: '#ABFF00',
          boxShadow: 'rgba(0, 0, 0, 0.2) 0 -1px 7px 1px, inset #304701 0 -1px 9px, #89FF00 0 2px 12px',
        },
        '.led-orange': {
          backgroundColor: '#FF7000',
          boxShadow: '#000 0 -1px 6px 1px, inset #630 0 -1px 8px, #FF7000 0 3px 11px',
        },
        '.led-yellow': {
          backgroundColor: '#FF0',
          boxShadow: '#000 0 -1px 6px 1px, inset #660 0 -1px 8px, #FF0 0 3px 11px',
        },
        '.led-blue': {
          backgroundColor: '#06F',
        },
        // Button link styles
        'button.reglink': {
          background: 'none !important',
          border: 'none',
          padding: '0 !important',
          color: 'rgb(0, 188, 212)',
          textDecoration: 'underline',
          cursor: 'pointer',
          fontFamily: 'Roboto, sans-serif',
          fontSize: '1em',
        },
        // Typography defaults
        'h1, h2, h3, h4, h5, p': {
          fontFamily: 'Roboto, sans-serif',
          fontWeight: 400,
        },
        'ul': {
          paddingInlineStart: '16px',
        },
        // Notification and action panel buttons
        '.actionpanel button': {
          margin: '5px',
          color: 'white !important',
        },
        '.notificationPanel button': {
          color: 'white !important',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none', // Prevent uppercase transformation
        },
      },
    },
  },
});

// Create light theme
export const createLightTheme = () => createTheme({
  ...getBaseTheme(),
  palette: lightPalette,
});

// Create dark theme
export const createDarkTheme = () => createTheme({
  ...getBaseTheme(),
  palette: darkPalette,
});

// Helper to get theme by name
export const getThemeByName = (themeName: 'light' | 'dark') => {
  return themeName === 'dark' ? createDarkTheme() : createLightTheme();
};

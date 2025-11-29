import { createTheme, ThemeOptions } from '@mui/material/styles';

// Layout constants (previously in style-*.js)
export const LAYOUT_CONSTANTS = {
  topBarHeight: 52,
  sidebarWidth: 280,
  sidebarCollapsedOffset: 214,
  sidebarVisibleWidth: 66,
} as const;

// Light theme palette - based on shadcn theme
const lightPalette = {
  mode: 'light' as const,
  primary: {
    main: '#37b6ff', 
    contrastText: '#ffffff',
  },
  secondary: {
    main: '#2a2d3d',
    contrastText: '#ffffff',
  },
  error: {
    main: '#e74c3c',
  },
  background: {
    default: '#ffffff',
    paper: '#f8f8f9',
  },
  text: {
    primary: '#2a2d3d',
    secondary: '#68697a',
  },
  divider: '#e8e9ec',
  action: {
    hover: '#eff0f7',
    selected: '#eff0f7',
  },
  sidebar: {
    background: '#f8f8f9',
    border: '#e9eaed',
  },
  toolbar: {
    background: '#ffffff',
    border: '#e8e9ec',
  },
};

// Dark theme palette - based on shadcn theme
const darkPalette = {
  mode: 'dark' as const,
  primary: {
    main: '#37b6ff',
    contrastText: '#ffffff',
  },
  secondary: {
    main: '#f5f5f6',
    contrastText: '#2a2d3d',
  },
  error: {
    main: '#e74c3c',
  },
  background: {
    default: '#000000',
    paper: '#313237',
  },
  text: {
    primary: '#e9eaec',
    secondary: '#8a8b99',
  },
  divider: '#3f4044',
  action: {
    hover: '#282a3e',
    selected: '#282a3e',
  },
  sidebar: {
    background: '#313237',
    border: '#5a5d6e',
  },
  toolbar: {
    background: '#000000',
    border: '#3f4044',
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
  spacing: 8,
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          margin: 0,
          padding: 0,
        },
       
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
          borderRight: 'solid 1px #e8e9ec',
        },
       
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
       
        '.site-home-text a, .site-home-text a:visited': {
          color: '#37b6ff',
        },
       
        'pre, code': {
          wordWrap: 'break-word',
          whiteSpace: 'pre-wrap',
        },
       
        '.checkered': {
          height: '240px',
          background: `linear-gradient(45deg, rgba(0, 0, 0, 0.0980392) 25%, transparent 25%, transparent 75%, rgba(0, 0, 0, 0.0980392) 75%, rgba(0, 0, 0, 0.0980392) 0),
            linear-gradient(45deg, rgba(0, 0, 0, 0.0980392) 25%, transparent 25%, transparent 75%, rgba(0, 0, 0, 0.0980392) 75%, rgba(0, 0, 0, 0.0980392) 0),
            white`,
          backgroundRepeat: 'repeat, repeat',
          backgroundPosition: '0px 0, 5px 5px',
          backgroundSize: '10px 10px, 10px 10px',
        },
       
        'h1, h2, h3, h4, h5, p': {
          fontWeight: 400,
        },
        'ul': {
          paddingInlineStart: '16px',
        },
      },
    }
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

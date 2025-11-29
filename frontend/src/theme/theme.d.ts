import '@mui/material/styles';

declare module '@mui/material/styles' {
  interface Palette {
    sidebar: {
      background: string;
    };
    toolbar: {
      background: string;
      border: string;
    };
  }
  interface PaletteOptions {
    sidebar?: {
      background?: string;
    };
    toolbar?: {
      background?: string;
      border?: string;
    };
  }
}

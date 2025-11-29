import '@mui/material/styles';

declare module '@mui/material/Paper' {
  interface PaperPropsVariantOverrides {
    highlighted: true;
  }
}

declare module '@mui/material/styles' {
  interface ColorRange {
    50: string;
    100: string;
    200: string;
    300: string;
    400: string;
    500: string;
    600: string;
    700: string;
    800: string;
    900: string;
  }

  interface PaletteColor extends ColorRange {}

  interface Palette {
    baseShadow: string;
    sidebar: {
      background: string;
      border: string;
    };
    toolbar: {
      background: string;
      border: string;
    };
  }

  interface PaletteOptions {
    sidebar?: {
      background?: string;
      border?: string;
    };
    toolbar?: {
      background?: string;
      border?: string;
    };
  }

  interface TypeText {
    warning: string;
  }
}

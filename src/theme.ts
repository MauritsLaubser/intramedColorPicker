import { createTheme } from "@mui/material/styles";
import type { Color, ThemeOptions as MuiThemeOptions } from "@mui/material";
import { common } from "@mui/material/colors";
import neutral from "./colors/neutral";
import purple from "./colors/purple";
import blue from "./colors/blue";

const ThemeOptions: MuiThemeOptions = {
  palette: {
    background: {
      default: "#F4F4F8",
      paper: neutral[50],
    },
    primary: {
      main: "#005B6B",
      dark: "#005C60",
      light: "#317bb1",
    },
    secondary: {
      main: common.white,
    },
    lightBlue: { main: "#E0ECEE" },
    softOrange: { main: "#F09D3780" },
    cyan: { main: "#3BC9AE", dark: "#00778C" },
    slate: { main: "#30515D" },
    text: {
      primary: neutral[900],
      secondary: neutral[900],
      disabled: neutral[500],
    },
    grey: neutral,
    error: {
      main: "#E94E3D",
    },
    warning: {
      main: "#E98300",
      light: "#EF9F25",
    },
    copper: {
      main: "#f2bd54",
      contrastText: common.white,
    },
    purple: blue,
    pink: purple,
    info: {
      main: purple[900],
    },
    success: {
      main: "#00C244",
    },
    responsive: {
      main: blue[500],
    },
  },
};

declare module "@mui/material/styles" {
  interface Palette {
    responsive: Palette["primary"];
    lightBlue: Palette["primary"];
    purple: Color;
    pink: Color;
    copper: Palette["primary"];
    cyan: Palette["primary"];
    slate: Palette["primary"];
    softOrange: Palette["primary"];
  }

  interface PaletteOptions {
    responsive: PaletteOptions["primary"];
    lightBlue?: PaletteOptions["primary"];
    purple?: Partial<Color>;
    pink?: Partial<Color>;
    copper?: PaletteOptions["primary"];
    cyan?: PaletteOptions["primary"];
    slate?: PaletteOptions["primary"];
    softOrange: PaletteOptions["primary"];
  }
}

export { ThemeOptions };

export const appTheme = createTheme(ThemeOptions);

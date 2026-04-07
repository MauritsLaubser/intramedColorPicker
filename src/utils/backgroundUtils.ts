import { darken, getContrastRatio, lighten, type Theme } from "@mui/system";
import convert from "color-convert";
import type { ColorVariant } from "../colors/variants";

type ColorAdjustmentMode = "lighten" | "darken";

const toHexColor = (color: string): string => {
  const trimmedColor = color.trim();

  const rgbaMatch = /^rgba?\((.*)\)$/i.exec(trimmedColor);

  if (rgbaMatch === null) {
    // MUI lighten/darken should return rgb/rgba, keep original as safe fallback.
    return trimmedColor;
  }

  const channels = rgbaMatch[1].split(",").map((channel) => channel.trim());

  if (channels.length !== 3 && channels.length !== 4) {
    return trimmedColor;
  }

  const [redString, greenString, blueString, alphaString] = channels;
  const red = Number.parseFloat(redString);
  const green = Number.parseFloat(greenString);
  const blue = Number.parseFloat(blueString);

  if ([red, green, blue].some((channel) => Number.isNaN(channel))) {
    return trimmedColor;
  }

  const rgbHex = convert.rgb.hex(
    Math.round(red),
    Math.round(green),
    Math.round(blue),
  );

  if (alphaString === undefined) {
    return `#${rgbHex}`;
  }

  const alpha = Number.parseFloat(alphaString);

  if (Number.isNaN(alpha)) {
    return trimmedColor;
  }

  const alphaHex = Math.round(Math.min(Math.max(alpha, 0), 1) * 255)
    .toString(16)
    .padStart(2, "0")
    .toUpperCase();

  return `#${rgbHex}${alphaHex}`;
};

export const getBackgroundColorForColorVariant = (
  theme: Theme,
  colorVariant: ColorVariant,
  defaultColor?: string,
) => {
  const map: Record<string, string> = {
    primary: theme.palette.cyan.main,
    primaryDark: theme.palette.cyan.dark,
    copper: theme.palette.copper.main,
    pink: theme.palette.pink[200],
    softOrange: theme.palette.softOrange.main,
    lightBlue: theme.palette.lightBlue.main,
    white: theme.palette.common.white,
    warning: theme.palette.warning.main,
    green: theme.palette.success.main,
  };

  return map[colorVariant] ?? defaultColor ?? theme.palette.grey[400];
};

export const getTextColorForBackgroundColor = (
  theme: Theme,
  backgroundColor: string,
): string => {
  return getContrastRatio(backgroundColor, theme.palette.grey[900]) >
    getContrastRatio(backgroundColor, theme.palette.common.white)
    ? theme.palette.grey[900]
    : theme.palette.common.white;
};

export const adjustBackgroundColor = (
  backgroundColor: string,
  mode: ColorAdjustmentMode,
  amount = 0.1,
): string => {
  const adjustedColor =
    mode === "lighten"
      ? lighten(backgroundColor, amount)
      : darken(backgroundColor, amount);

  return toHexColor(adjustedColor);
};

export const findClosestBackgroundColorForTextFlip = (
  theme: Theme,
  backgroundColor: string,
): string => {
  const currentTextColor = getTextColorForBackgroundColor(
    theme,
    backgroundColor,
  );

  for (let step = 1; step <= 10; step += 1) {
    const amount = step / 10;

    for (const mode of ["lighten", "darken"] as const) {
      const candidateColor = adjustBackgroundColor(
        backgroundColor,
        mode,
        amount,
      );

      if (
        getTextColorForBackgroundColor(theme, candidateColor) !==
        currentTextColor
      ) {
        return candidateColor;
      }
    }
  }

  return backgroundColor;
};

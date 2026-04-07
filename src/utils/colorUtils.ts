import { darken, lighten } from "@mui/material/styles";

const DEFAULT_CHIP_COLOR = "#005B6B";
const LIGHT_TEXT = "#F8FAFC";
const DARK_TEXT = "#0F172A";

type ColorAdjustmentMode = "lighten" | "darken";

export function isValidHexColor(value: string): boolean {
  return /^#?([0-9a-f]{3}|[0-9a-f]{4}|[0-9a-f]{6}|[0-9a-f]{8})$/i.test(
    value.trim(),
  );
}

function normalizeHexColor(value: string): string | null {
  const trimmedValue = value.trim();

  if (!isValidHexColor(trimmedValue)) {
    return null;
  }

  const prefixedValue = trimmedValue.startsWith("#")
    ? trimmedValue
    : `#${trimmedValue}`;

  if (prefixedValue.length === 4) {
    const [, red, green, blue] = prefixedValue;
    return `#${red}${red}${green}${green}${blue}${blue}`.toUpperCase();
  }

  if (prefixedValue.length === 5) {
    const [, red, green, blue, alpha] = prefixedValue;
    return `#${red}${red}${green}${green}${blue}${blue}${alpha}${alpha}`.toUpperCase();
  }

  return prefixedValue.toUpperCase();
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

function toHexChannel(value: number): string {
  return Math.round(clamp(value, 0, 255))
    .toString(16)
    .padStart(2, "0")
    .toUpperCase();
}

function normalizeCssColor(value: string): string | null {
  const normalizedHexColor = normalizeHexColor(value);

  if (normalizedHexColor !== null) {
    return normalizedHexColor;
  }

  const rgbaMatch = /^rgba?\((.*)\)$/i.exec(value.trim());

  if (rgbaMatch === null) {
    return null;
  }

  const channels = rgbaMatch[1].split(",").map((channel) => channel.trim());

  if (channels.length !== 3 && channels.length !== 4) {
    return null;
  }

  const [redString, greenString, blueString, alphaString] = channels;
  const red = Number.parseFloat(redString);
  const green = Number.parseFloat(greenString);
  const blue = Number.parseFloat(blueString);

  if ([red, green, blue].some((channel) => Number.isNaN(channel))) {
    return null;
  }

  if (alphaString === undefined) {
    return `#${toHexChannel(red)}${toHexChannel(green)}${toHexChannel(blue)}`;
  }

  const alpha = Number.parseFloat(alphaString);

  if (Number.isNaN(alpha)) {
    return null;
  }

  return `#${toHexChannel(red)}${toHexChannel(green)}${toHexChannel(blue)}${toHexChannel(alpha * 255)}`;
}

function getRgbChannels(hexColor: string): {
  red: number;
  green: number;
  blue: number;
} {
  const red = Number.parseInt(hexColor.slice(1, 3), 16);
  const green = Number.parseInt(hexColor.slice(3, 5), 16);
  const blue = Number.parseInt(hexColor.slice(5, 7), 16);

  if (hexColor.length !== 9) {
    return { red, green, blue };
  }

  const alpha = Number.parseInt(hexColor.slice(7, 9), 16) / 255;

  return {
    red: Math.round(red * alpha + 255 * (1 - alpha)),
    green: Math.round(green * alpha + 255 * (1 - alpha)),
    blue: Math.round(blue * alpha + 255 * (1 - alpha)),
  };
}

function getColorDistance(fromColor: string, toColor: string): number {
  const fromChannels = getRgbChannels(fromColor);
  const toChannels = getRgbChannels(toColor);

  return Math.hypot(
    fromChannels.red - toChannels.red,
    fromChannels.green - toChannels.green,
    fromChannels.blue - toChannels.blue,
  );
}

export function getChipBackgroundColor(input: string): string {
  return normalizeHexColor(input) ?? DEFAULT_CHIP_COLOR;
}

export function getBestTextColor(backgroundColor: string): string {
  const normalizedColor = getChipBackgroundColor(backgroundColor);
  const { red, green, blue } = getRgbChannels(normalizedColor);
  const luminance = (red * 0.299 + green * 0.587 + blue * 0.114) / 255;

  return luminance > 0.64 ? DARK_TEXT : LIGHT_TEXT;
}

export function adjustHexColor(
  input: string,
  mode: ColorAdjustmentMode,
  amount = 0.12,
): string {
  const baseColor = getChipBackgroundColor(input);
  const adjustmentAmount = clamp(amount, 0, 1);
  const adjustedColor =
    mode === "lighten"
      ? lighten(baseColor, adjustmentAmount)
      : darken(baseColor, adjustmentAmount);

  return normalizeCssColor(adjustedColor) ?? baseColor;
}

export function findClosestTextColorFlip(
  input: string,
  resolveTextColor: (backgroundColor: string) => string = getBestTextColor,
): string {
  const baseColor = getChipBackgroundColor(input);
  const currentTextColor = resolveTextColor(baseColor);
  let closestColor = baseColor;
  let closestAmount = Number.POSITIVE_INFINITY;
  let closestDistance = Number.POSITIVE_INFINITY;

  for (const mode of ["lighten", "darken"] as const) {
    for (let step = 1; step <= 100; step += 1) {
      const amount = step / 100;
      const candidateColor = adjustHexColor(baseColor, mode, amount);

      if (resolveTextColor(candidateColor) === currentTextColor) {
        continue;
      }

      const distance = getColorDistance(baseColor, candidateColor);
      const isBetterMatch =
        amount < closestAmount ||
        (amount === closestAmount && distance < closestDistance);

      if (isBetterMatch) {
        closestColor = candidateColor;
        closestAmount = amount;
        closestDistance = distance;
      }

      break;
    }
  }

  return closestColor;
}

export const colorVariants = [
  "primary",
  "primaryDark",
  "copper",
  "pink",
  "softOrange",
  "lightBlue",
  "white",
  "green",
  "warning",
  "none",
] as const;
export type ColorVariant = (typeof colorVariants)[number];

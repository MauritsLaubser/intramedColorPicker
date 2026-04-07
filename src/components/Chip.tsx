import {
  Chip as MuiChip,
  type ChipProps as MuiChipProps,
  styled,
} from "@mui/material";
import type { ColorVariant } from "../colors/variants";
import {
  getBackgroundColorForColorVariant,
  getTextColorForBackgroundColor,
} from "../utils/backgroundUtils";

type StyledChipProps = (
  | {
      colorVariant?: ColorVariant;
      chipColor?: never;
    }
  | {
      chipColor?: string;
      colorVariant?: never;
    }
) & { compact?: boolean };

type ChipProps = MuiChipProps & StyledChipProps & { multiline?: boolean };

const StyledChip = styled(MuiChip, {
  shouldForwardProp: (prop) =>
    !["colorVariant", "chipColor", "compact"].includes(prop.toString()),
})<StyledChipProps>(({
  theme,
  colorVariant,
  chipColor,
  compact = false,
  size = "medium",
  icon,
}) => {
  const backgroundColor = colorVariant
    ? getBackgroundColorForColorVariant(
        theme,
        colorVariant,
        theme.palette.grey[400],
      )
    : chipColor;

  const color =
    backgroundColor !== undefined
      ? getTextColorForBackgroundColor(theme, backgroundColor)
      : undefined;
  const compactMargin = size === "medium" ? "0 12px" : "0 8px";

  return {
    backgroundColor,
    color,
    ...(compact
      ? {
          ".MuiChip-icon": { margin: compactMargin },
          ".MuiChip-label": { display: "none" },
        }
      : {
          paddingLeft: icon !== undefined ? theme.spacing(1) : undefined,
        }),
  };
});

export const Chip = (props: ChipProps) => {
  const { multiline = false, sx, ...restProps } = props;

  return (
    <StyledChip
      sx={
        multiline
          ? {
              ...sx,
              height: "auto",
              "& .MuiChip-label": {
                display: "block",
                whiteSpace: "normal",
              },
            }
          : sx
      }
      {...restProps}
    />
  );
};

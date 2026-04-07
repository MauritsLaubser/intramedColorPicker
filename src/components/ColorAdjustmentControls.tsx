import {
  Button,
  ButtonGroup,
  Stack,
  Typography,
  useTheme,
} from "@mui/material";
import {
  adjustBackgroundColor,
  findClosestBackgroundColorForTextFlip,
} from "../utils/backgroundUtils";

type ColorAdjustmentControlsProps = Readonly<{
  color: string;
  onChange: (nextColor: string) => void;
}>;

export function ColorAdjustmentControls({
  color,
  onChange,
}: ColorAdjustmentControlsProps) {
  const theme = useTheme();

  return (
    <Stack spacing={1.25}>
      <Typography variant="body2">Achtergrondkleur aanpassen</Typography>

      <ButtonGroup fullWidth variant="outlined" sx={{ alignSelf: "stretch" }}>
        <Button
          onClick={() => onChange(adjustBackgroundColor(color, "darken", 0.1))}
        >
          Donkerder
        </Button>

        <Button
          onClick={() => onChange(adjustBackgroundColor(color, "lighten", 0.1))}
        >
          Lichter
        </Button>

        <Button
          onClick={() =>
            onChange(findClosestBackgroundColorForTextFlip(theme, color))
          }
        >
          Wissel tekstkleur
        </Button>
      </ButtonGroup>
    </Stack>
  );
}

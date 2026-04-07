import { useState } from "react";
import {
  Box,
  Paper,
  Stack,
  TextField,
  Typography,
  useTheme,
} from "@mui/material";
import { Chip } from "./components/Chip";
import { ColorAdjustmentControls } from "./components/ColorAdjustmentControls";
import type { ColorVariant } from "./colors/variants";
import {
  adjustBackgroundColor,
  getBackgroundColorForColorVariant,
  getTextColorForBackgroundColor,
} from "./utils/backgroundUtils";
import { ColorPicker } from "./components/Colorpicker";

function App() {
  const theme = useTheme();
  const [chipLabel, setChipLabel] = useState<string | undefined>();
  const [colorInput, setColorInput] = useState(theme.palette.primary.main);

  const chipBackground = colorInput || theme.palette.primary.main;
  const chipTextColor = getTextColorForBackgroundColor(theme, chipBackground);

  const presetColors: { label: string; variant: ColorVariant }[] = [
    { label: "Primary", variant: "primary" },
    { label: "PrimaryDark", variant: "primaryDark" },
    { label: "Copper", variant: "copper" },
    { label: "Pink", variant: "pink" },
    { label: "Soft Orange", variant: "softOrange" },
    { label: "Light Blue", variant: "lightBlue" },
    { label: "White", variant: "white" },
    { label: "Green", variant: "green" },
    { label: "Warning", variant: "warning" },
  ];

  const cardStyles = {
    flex: 1,
    minWidth: 0,
    border: "1px solid rgba(19, 44, 68, 0.08)",
    borderRadius: { xs: 2.5, md: 3 },
    background:
      "linear-gradient(180deg, rgba(255, 255, 255, 0.96), rgba(246, 249, 252, 0.9))",
    p: { xs: 2.5, md: 3 },
  } as const;

  return (
    <Box
      sx={{
        position: "relative",
        minHeight: "100vh",
        overflow: "hidden",
        p: { xs: 2, md: 3 },
      }}
    >
      <Box
        sx={{
          position: "absolute",
          inset: 0,
          background: `
            radial-gradient(circle at top left, rgba(30, 136, 229, 0.18), transparent 30%),
            radial-gradient(circle at bottom right, rgba(0, 137, 123, 0.18), transparent 32%),
            linear-gradient(135deg, #f6f8fc 0%, #eef3fb 45%, #f9fbfd 100%)
          `,
        }}
      />

      <Paper
        elevation={0}
        sx={{
          position: "relative",
          maxWidth: 1120,
          mx: "auto",
          border: "1px solid rgba(19, 44, 68, 0.08)",
          borderRadius: { xs: 3, md: 4 },
          background: "rgba(255, 255, 255, 0.84)",
          backdropFilter: "blur(14px)",
          p: { xs: 2.5, md: 4 },
        }}
      >
        <Stack spacing={4}>
          <Stack spacing={1.5}>
            <Box
              component="img"
              src="/Intramed.svg"
              alt="Intramed"
              sx={{
                width: { xs: "100%", sm: 340, md: 420 },
                maxWidth: "100%",
                height: "auto",
              }}
            />
          </Stack>

          <Stack
            direction={{ xs: "column", md: "row" }}
            spacing={3}
            sx={{ alignItems: "stretch" }}
          >
            <Paper elevation={0} sx={cardStyles}>
              <Stack spacing={2.5}>
                <Typography variant="h2">Configuratie</Typography>

                <TextField
                  fullWidth
                  label="Chiptekst"
                  value={chipLabel}
                  onChange={(event) => setChipLabel(event.target.value)}
                />
                <ColorPicker value={chipBackground} onChange={setColorInput} />

                <ColorAdjustmentControls
                  color={chipBackground}
                  onChange={setColorInput}
                />

                <Stack direction="row" flexWrap="wrap" gap={1}>
                  {presetColors.map((presetColor) => {
                    return (
                      <Chip
                        key={presetColor.label}
                        clickable
                        label={presetColor.label}
                        onClick={() =>
                          setColorInput(
                            getBackgroundColorForColorVariant(
                              theme,
                              presetColor.variant,
                            ),
                          )
                        }
                        colorVariant={presetColor.variant}
                        sx={{
                          "&:hover": {
                            transform: "translateY(-1px)",
                            backgroundColor: adjustBackgroundColor(
                              getBackgroundColorForColorVariant(
                                theme,
                                presetColor.variant,
                                theme.palette.grey[300],
                              ),
                              "darken",
                              0.2,
                            ),
                          },
                        }}
                      />
                    );
                  })}
                </Stack>
              </Stack>
            </Paper>

            <Paper elevation={0} sx={cardStyles}>
              <Stack spacing={3}>
                <Typography variant="h2">Voorbeeld</Typography>

                <Box
                  sx={{
                    display: "grid",
                    placeItems: "center",
                    minHeight: { xs: 180, md: 240 },
                    borderRadius: 2.5,
                    background: `
                      linear-gradient(135deg, rgba(15, 23, 42, 0.02), rgba(15, 118, 110, 0.08)),
                      repeating-linear-gradient(
                        45deg,
                        rgba(255, 255, 255, 0.8),
                        rgba(255, 255, 255, 0.8) 12px,
                        rgba(15, 23, 42, 0.03) 12px,
                        rgba(15, 23, 42, 0.03) 24px
                      )
                    `,
                  }}
                >
                  <Chip
                    label={chipLabel || "Label"}
                    sx={{
                      backgroundColor: chipBackground,
                      color: chipTextColor,
                      fontSize: "1rem",
                      fontWeight: 700,
                      height: 42,
                      px: 1,
                    }}
                  />
                </Box>

                <Stack spacing={1.25}>
                  <Typography variant="body2">
                    Achtergrond in gebruik: <strong>{chipBackground}</strong>
                  </Typography>
                  <Typography variant="body2">
                    Tekstkleur bepaald door achtergrond-utils:{" "}
                    <strong>{chipTextColor}</strong>
                  </Typography>
                </Stack>
              </Stack>
            </Paper>
          </Stack>
        </Stack>
      </Paper>
    </Box>
  );
}

export default App;

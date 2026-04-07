import {
  Alert,
  Box,
  Button,
  Divider,
  Paper,
  Snackbar,
  Slider,
  Stack,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  useTheme,
  Typography,
} from "@mui/material";
import { getContrastRatio } from "@mui/material/styles";
import {
  type MouseEvent as ReactMouseEvent,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import convert from "color-convert";
import { getChipBackgroundColor, isValidHexColor } from "../utils/colorUtils";
import { getTextColorForBackgroundColor } from "../utils/backgroundUtils";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ErrorIcon from "@mui/icons-material/Error";

type AccessibilityLevel = "AA" | "AAA";

type HsvColor = {
  h: number;
  s: number;
  v: number;
};

type ColorPickerProps = Readonly<{
  value: string;
  onChange: (nextColor: string) => void;
}>;

const clamp = (value: number, min: number, max: number): number => {
  return Math.min(Math.max(value, min), max);
};

const toHsv = (value: string, fallbackHue = 0): HsvColor => {
  const normalizedHex = getChipBackgroundColor(value).slice(1);
  const [h, s, v] = convert.hex.hsv(normalizedHex);
  const safeSaturation = s ?? 0;
  const safeValue = v ?? 0;
  const safeHue =
    safeSaturation === 0 || safeValue === 0 ? fallbackHue : (h ?? fallbackHue);

  return { h: safeHue, s: safeSaturation, v: safeValue };
};

const toHex = ({ h, s, v }: HsvColor): string => {
  return `#${convert.hsv.hex(Math.round(h), Math.round(s), Math.round(v)).toUpperCase()}`;
};

const findLightTextPassCeilingValue = (
  hue: number,
  saturation: number,
  minimumContrast: number,
  lightTextColor: string,
): number => {
  let boundaryValue = 0;

  for (let valueChannel = 0; valueChannel <= 100; valueChannel += 1) {
    const candidateColor = toHex({
      h: hue,
      s: saturation,
      v: valueChannel,
    });
    const contrast = getContrastRatio(candidateColor, lightTextColor);

    if (contrast >= minimumContrast) {
      boundaryValue = valueChannel;
    }
  }

  return boundaryValue;
};

const findDarkTextPassFloorValue = (
  hue: number,
  saturation: number,
  minimumContrast: number,
  darkTextColor: string,
): number => {
  let boundaryValue = 100;

  for (let valueChannel = 0; valueChannel <= 100; valueChannel += 1) {
    const candidateColor = toHex({
      h: hue,
      s: saturation,
      v: valueChannel,
    });
    const contrast = getContrastRatio(candidateColor, darkTextColor);

    if (contrast >= minimumContrast) {
      boundaryValue = valueChannel;
      break;
    }
  }

  return boundaryValue;
};

const findTextFlipBoundaryValue = (
  hue: number,
  saturation: number,
  darkTextColor: string,
  resolveTextColor: (backgroundColor: string) => string,
): number => {
  // Keep boundary at the top edge when a dark-text region is not present.
  let boundaryValue = 100;

  for (let valueChannel = 0; valueChannel <= 100; valueChannel += 1) {
    const candidateColor = toHex({
      h: hue,
      s: saturation,
      v: valueChannel,
    });

    if (resolveTextColor(candidateColor) === darkTextColor) {
      boundaryValue = valueChannel;
      break;
    }
  }

  return boundaryValue;
};

export const ColorPicker = ({ value, onChange }: ColorPickerProps) => {
  const theme = useTheme();
  const [accessibilityLevel, setAccessibilityLevel] =
    useState<AccessibilityLevel>("AA");
  const [hsvColor, setHsvColor] = useState<HsvColor>(() => toHsv(value));
  const [hexInput, setHexInput] = useState(() => getChipBackgroundColor(value));
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarSeverity, setSnackbarSeverity] = useState<"success" | "error">(
    "success",
  );
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const saturationAreaRef = useRef<HTMLDivElement | null>(null);
  const hsvColorRef = useRef<HsvColor>(hsvColor);
  const lastPublishedHexRef = useRef<string>(toHex(hsvColor));
  const internalEchoesRef = useRef<Set<string>>(
    new Set([toHex(hsvColor).toUpperCase()]),
  );

  useEffect(() => {
    hsvColorRef.current = hsvColor;
  }, [hsvColor]);

  useEffect(() => {
    const normalizedHex = getChipBackgroundColor(value);
    const normalizedUpper = normalizedHex.toUpperCase();

    if (
      normalizedUpper === lastPublishedHexRef.current ||
      internalEchoesRef.current.has(normalizedUpper)
    ) {
      internalEchoesRef.current.delete(normalizedUpper);
      setHexInput(normalizedHex);
      return;
    }

    const nextHsv = toHsv(normalizedHex, hsvColorRef.current.h);
    hsvColorRef.current = nextHsv;
    lastPublishedHexRef.current = normalizedUpper;
    setHsvColor(nextHsv);
    setHexInput(normalizedHex);
  }, [value]);

  const hexColor = useMemo(() => toHex(hsvColor), [hsvColor]);
  const resolvedTextColor = getTextColorForBackgroundColor(theme, hexColor);
  const contrastRatio = getContrastRatio(hexColor, resolvedTextColor);
  const requiredContrast = accessibilityLevel === "AA" ? 4.5 : 7;
  const isAccessible = contrastRatio >= requiredContrast;
  const darkTextColor = theme.palette.grey[900];
  const lightTextColor = theme.palette.common.white;
  const overlayBoundaries = useMemo(() => {
    const resolveTextColor = (backgroundColor: string) =>
      getTextColorForBackgroundColor(theme, backgroundColor);
    const lightTextCeilingPoints: Array<{ x: number; y: number }> = [];
    const darkTextFloorPoints: Array<{ x: number; y: number }> = [];
    const textFlipPoints: Array<{ x: number; y: number }> = [];

    for (let saturation = 0; saturation <= 100; saturation += 2) {
      const lightTextCeilingValue = findLightTextPassCeilingValue(
        hsvColor.h,
        saturation,
        requiredContrast,
        lightTextColor,
      );
      lightTextCeilingPoints.push({
        x: saturation,
        y: 100 - lightTextCeilingValue,
      });

      const darkTextFloorValue = findDarkTextPassFloorValue(
        hsvColor.h,
        saturation,
        requiredContrast,
        darkTextColor,
      );
      darkTextFloorPoints.push({ x: saturation, y: 100 - darkTextFloorValue });

      const textFlipBoundaryValue = findTextFlipBoundaryValue(
        hsvColor.h,
        saturation,
        darkTextColor,
        resolveTextColor,
      );
      textFlipPoints.push({ x: saturation, y: 100 - textFlipBoundaryValue });
    }

    const toPath = (points: Array<{ x: number; y: number }>) => {
      return points
        .map((point, index) => {
          const command = index === 0 ? "M" : "L";
          return `${command}${point.x} ${point.y}`;
        })
        .join(" ");
    };

    return {
      selectedLightTextPath: toPath(lightTextCeilingPoints),
      selectedDarkTextPath: toPath(darkTextFloorPoints),
      textFlipPath: toPath(textFlipPoints),
    };
  }, [darkTextColor, hsvColor.h, lightTextColor, requiredContrast, theme]);

  const setAndPublishColor = (nextHsvColor: HsvColor) => {
    hsvColorRef.current = nextHsvColor;
    setHsvColor(nextHsvColor);
    const nextHex = toHex(nextHsvColor);
    lastPublishedHexRef.current = nextHex.toUpperCase();
    internalEchoesRef.current.add(lastPublishedHexRef.current);
    if (internalEchoesRef.current.size > 24) {
      const oldestValue = internalEchoesRef.current.values().next().value;

      if (oldestValue !== undefined) {
        internalEchoesRef.current.delete(oldestValue);
      }
    }
    setHexInput(nextHex);
    onChange(nextHex);
  };

  const setFromPointerPosition = (clientX: number, clientY: number) => {
    const area = saturationAreaRef.current;

    if (area === null) {
      return;
    }

    const bounds = area.getBoundingClientRect();
    const saturation = clamp(
      ((clientX - bounds.left) / bounds.width) * 100,
      0,
      100,
    );
    const valueChannel = clamp(
      100 - ((clientY - bounds.top) / bounds.height) * 100,
      0,
      100,
    );

    setAndPublishColor({
      h: hsvColorRef.current.h,
      s: saturation,
      v: valueChannel,
    });
  };

  const handleSaturationAreaMouseDown = (
    event: ReactMouseEvent<HTMLDivElement>,
  ) => {
    setFromPointerPosition(event.clientX, event.clientY);

    const handleMouseMove = (moveEvent: MouseEvent) => {
      setFromPointerPosition(moveEvent.clientX, moveEvent.clientY);
    };

    const stopTracking = () => {
      globalThis.removeEventListener("mousemove", handleMouseMove);
      globalThis.removeEventListener("mouseup", stopTracking);
    };

    globalThis.addEventListener("mousemove", handleMouseMove);
    globalThis.addEventListener("mouseup", stopTracking);
  };

  const handleHexInputChange = (nextInput: string) => {
    setHexInput(nextInput);

    if (!isValidHexColor(nextInput)) {
      return;
    }

    const normalizedHex = getChipBackgroundColor(nextInput);
    const nextHsv = toHsv(normalizedHex, hsvColorRef.current.h);
    hsvColorRef.current = nextHsv;
    lastPublishedHexRef.current = normalizedHex.toUpperCase();
    internalEchoesRef.current.add(lastPublishedHexRef.current);
    setHsvColor(nextHsv);
    onChange(normalizedHex);
  };

  const copyHexColor = async () => {
    if (typeof navigator.clipboard?.writeText !== "function") {
      setSnackbarSeverity("error");
      setSnackbarMessage("Kopieren wordt niet ondersteund in deze browser.");
      setSnackbarOpen(true);
      return;
    }

    try {
      await navigator.clipboard.writeText(hexColor);
      setSnackbarSeverity("success");
      setSnackbarMessage(`Kleur ${hexColor} gekopieerd.`);
      setSnackbarOpen(true);
    } catch {
      setSnackbarSeverity("error");
      setSnackbarMessage("Kopieren is mislukt. Probeer opnieuw.");
      setSnackbarOpen(true);
    }
  };

  const closeSnackbar = () => {
    setSnackbarOpen(false);
  };

  return (
    <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
      <Stack gap={2}>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
        >
          <Stack direction="row" gap={1} alignItems="center">
            {isAccessible ? (
              <CheckCircleIcon
                sx={{ color: "success.main" }}
                fontSize="small"
              />
            ) : (
              <ErrorIcon sx={{ color: "error.main" }} fontSize="small" />
            )}
            <Typography variant="body2">
              {contrastRatio.toFixed(2)}:1 (doel {requiredContrast}:1)
            </Typography>
          </Stack>

          <ToggleButtonGroup
            size="small"
            exclusive
            value={accessibilityLevel}
            onChange={(_, nextValue: AccessibilityLevel | null) => {
              if (nextValue !== null) {
                setAccessibilityLevel(nextValue);
              }
            }}
          >
            <ToggleButton value="AA">AA</ToggleButton>
            <ToggleButton value="AAA">AAA</ToggleButton>
          </ToggleButtonGroup>
        </Stack>
        <Box
          ref={saturationAreaRef}
          onMouseDown={handleSaturationAreaMouseDown}
          sx={{
            cursor: "crosshair",
            position: "relative",
            borderRadius: 1.5,
            height: 280,
            aspectRatio: "1/1",
            background: `
              linear-gradient(to top, #000, transparent),
              linear-gradient(to right, #fff, hsl(${hsvColor.h}, 100%, 50%))
        `,
          }}
        >
          <Box
            sx={{
              position: "absolute",
              inset: 0,
              pointerEvents: "none",
            }}
          >
            <svg
              width="100%"
              height="100%"
              viewBox="0 0 100 100"
              preserveAspectRatio="none"
            >
              <path
                d={overlayBoundaries.selectedLightTextPath}
                fill="none"
                stroke="rgba(56, 142, 60, 0.95)"
                strokeWidth="1"
                strokeDasharray="2 1.6"
              />
              <path
                d={overlayBoundaries.selectedDarkTextPath}
                fill="none"
                stroke="rgba(56, 142, 60, 0.95)"
                strokeWidth="1"
                strokeDasharray="5 2"
              />
              <path
                d={overlayBoundaries.textFlipPath}
                fill="none"
                stroke="rgba(255, 255, 255, 0.95)"
                strokeWidth="1"
                strokeDasharray="4 2"
              />
            </svg>
          </Box>

          <Box
            sx={{
              position: "absolute",
              width: 20,
              height: 20,
              borderRadius: "50%",
              border: "2px solid #fff",
              boxShadow: "0 0 0 1px rgba(0,0,0,0.4)",
              transform: "translate(-50%, -50%)",
              left: `${hsvColor.s}%`,
              top: `${100 - hsvColor.v}%`,
              pointerEvents: "none",
            }}
          />
        </Box>

        <Slider
          value={hsvColor.h}
          min={0}
          max={360}
          onChange={(_, nextValue) => {
            const hue = Array.isArray(nextValue) ? nextValue[0] : nextValue;
            setAndPublishColor({
              h: hue,
              s: hsvColorRef.current.s,
              v: hsvColorRef.current.v,
            });
          }}
          sx={{
            "& .MuiSlider-rail": {
              opacity: 1,
              background:
                "linear-gradient(90deg, #ff0000 0%, #ffff00 17%, #00ff00 33%, #00ffff 50%, #0000ff 67%, #ff00ff 83%, #ff0000 100%)",
            },
            "& .MuiSlider-track": {
              background: "transparent",
              border: "none",
            },
          }}
        />

        <Divider />

        <Stack direction="row" gap={1} alignItems="top">
          <TextField
            fullWidth
            label="HEX"
            value={hexInput}
            onChange={(event) => handleHexInputChange(event.target.value)}
            error={!isValidHexColor(hexInput)}
            helperText={
              isValidHexColor(hexInput)
                ? undefined
                : "Gebruik een geldige HEX-kleur"
            }
          />
          <Button variant="outlined" onClick={copyHexColor} sx={{ height: 56 }}>
            Kopieer
          </Button>
        </Stack>
      </Stack>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={2200}
        onClose={closeSnackbar}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={closeSnackbar}
          severity={snackbarSeverity}
          variant="filled"
          sx={{ width: "100%" }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Paper>
  );
};

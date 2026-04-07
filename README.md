# intraMedColorPicker

MUI-based Vite app for previewing and adjusting an IntraMed chip color.

## Available scripts

```bash
npm install
npm run dev
npm run build
npm run preview
```

## Background utility integration

The current chip styling is driven by [src/utils/backgroundUtils.ts](src/utils/backgroundUtils.ts).

- `getBackgroundColorForColorVariant(theme, variant)` resolves theme variant colors.
- `getTextColorForBackgroundColor(theme, background)` resolves readable text color.
- `adjustBackgroundColor(background, mode, amount)` applies MUI darken/lighten and returns hex.
- `findClosestBackgroundColorForTextFlip(theme, background)` finds the nearest color that flips text contrast.

## Vercel deployment

This project is a static Vite app and is ready for Vercel.

Expected settings:

- Build command: `npm run build`
- Output directory: `dist`

You can deploy by importing the project into Vercel or using the Vercel CLI.

### Quick launch with Vercel CLI

```bash
npm i -g vercel
vercel
vercel --prod
```

import { systemWeights } from 'react-native-typography';
import palettes from './palettes';
import { createTheme, DefaultTheme } from '@draftbit/ui';
export default createTheme({
  breakpoints: {},
  palettes,
  baseTheme: DefaultTheme,
  theme: {
    name: 'Draftbit Default',
    colors: {
      background: {
        base: {
          default: palettes.Gray[50],
          dark: palettes.Gray[50],
        },
        brand: {
          default: palettes.Indigo[100],
          dark: palettes.Indigo[100],
        },
        danger: {
          default: palettes.Rose[100],
          dark: palettes.Rose[100],
        },
        info: {
          default: palettes.Cyan[100],
          dark: palettes.Cyan[100],
        },
        success: {
          default: palettes.Emerald[100],
          dark: palettes.Emerald[100],
        },
        warning: {
          default: palettes.Yellow[100],
          dark: palettes.Yellow[100],
        },
      },
      border: {
        base: {
          default: palettes.Indigo[300],
          dark: palettes.Indigo[300],
        },
        brand: {
          default: palettes.Indigo[300],
          dark: palettes.Indigo[300],
        },
        danger: {
          default: palettes.Rose[300],
          dark: palettes.Rose[300],
        },
        info: {
          default: palettes.Cyan[300],
          dark: palettes.Cyan[300],
        },
        success: {
          default: palettes.Emerald[300],
          dark: palettes.Emerald[300],
        },
        warning: {
          default: palettes.Yellow[300],
          dark: palettes.Yellow[300],
        },
      },
      branding: {
        primary: {
          default: palettes['#551658']['Custom Color'],
          dark: palettes['#551658']['Custom Color'],
        },
        secondary: {
          default: palettes.App.SecondaryColor,
          dark: palettes.App.SecondaryColor,
        },
      },
      foreground: {
        base: {
          default: palettes.Indigo[900],
          dark: palettes.Indigo[900],
        },
        brand: {
          default: palettes.Indigo[900],
          dark: palettes.Indigo[900],
        },
        danger: {
          default: palettes.Rose[700],
          dark: palettes.Rose[700],
        },
        info: {
          default: palettes.Cyan[700],
          dark: palettes.Cyan[700],
        },
        success: {
          default: palettes.Emerald[700],
          dark: palettes.Emerald[700],
        },
        warning: {
          default: palettes.Yellow[700],
          dark: palettes.Yellow[700],
        },
      },
      text: {
        danger: {
          default: palettes.Rose[600],
          dark: palettes.Rose[600],
        },
        light: {
          default: palettes.Neutral[400],
          dark: palettes.Neutral[400],
        },
        medium: {
          default: palettes.App.Bg_Linear,
          dark: palettes.App.Bg_Linear,
        },
        normal: {
          default: palettes.Neutral[600],
          dark: palettes.Neutral[600],
        },
        strong: {
          default: palettes.App['Custom Color_18'],
          dark: palettes.App['Custom Color_18'],
        },
        success: {
          default: palettes.Emerald[600],
          dark: palettes.Emerald[600],
        },
        warning: {
          default: palettes.Yellow[600],
          dark: palettes.Yellow[600],
        },
      },
    },
    typography: {
      body1: {
        ...(({ backgroundColor, ...o }) => o)(systemWeights.regular ?? {}),
        fontWeight: '400',
        fontSize: 16,
      },
      body2: {
        ...(({ backgroundColor, ...o }) => o)(systemWeights.regular ?? {}),
        fontWeight: '400',
        fontSize: 14,
      },
      button: {
        ...(({ backgroundColor, ...o }) => o)(systemWeights.bold ?? {}),
        fontWeight: '700',
        fontSize: 14,
      },
      caption: {
        ...(({ backgroundColor, ...o }) => o)(systemWeights.regular ?? {}),
        fontWeight: '400',
        fontSize: 12,
      },
      headline1: {
        ...(({ backgroundColor, ...o }) => o)(systemWeights.bold ?? {}),
        fontWeight: '700',
        fontSize: 60,
      },
      headline2: {
        ...(({ backgroundColor, ...o }) => o)(systemWeights.bold ?? {}),
        fontWeight: '700',
        fontSize: 48,
      },
      headline3: {
        ...(({ backgroundColor, ...o }) => o)(systemWeights.bold ?? {}),
        fontWeight: '700',
        fontSize: 34,
      },
      headline4: {
        ...(({ backgroundColor, ...o }) => o)(systemWeights.bold ?? {}),
        fontWeight: '700',
        fontSize: 24,
      },
      headline5: {
        ...(({ backgroundColor, ...o }) => o)(systemWeights.bold ?? {}),
        fontWeight: '700',
        fontSize: 20,
      },
      headline6: {
        ...(({ backgroundColor, ...o }) => o)(systemWeights.bold ?? {}),
        fontWeight: '700',
        fontSize: 16,
      },
      overline: {
        ...(({ backgroundColor, ...o }) => o)(systemWeights.regular ?? {}),
        fontWeight: '400',
        fontSize: 12,
      },
      subtitle1: {
        ...(({ backgroundColor, ...o }) => o)(systemWeights.regular ?? {}),
        fontWeight: '400',
        fontSize: 16,
      },
      subtitle2: {
        ...(({ backgroundColor, ...o }) => o)(systemWeights.regular ?? {}),
        fontWeight: '400',
        fontSize: 14,
      },
    },
  },
});

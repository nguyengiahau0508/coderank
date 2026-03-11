import { definePreset } from '@primeuix/themes';
import Aura from '@primeuix/themes/aura';

const CodeRankPreset = definePreset(Aura, {
  semantic: {
    primary: {
      50: '#e6f1ff',
      100: '#b3d4ff',
      200: '#80b8ff',
      300: '#4d9bff',
      400: '#1a7fff',
      500: '#58a6ff',
      600: '#388bfd',
      700: '#1f6feb',
      800: '#0d5fcc',
      900: '#0a3d8f',
      950: '#071f4d'
    },
    colorScheme: {
      dark: {
        surface: {
          0: '#f0f6fc',
          50: '#c9d1d9',
          100: '#b1bac4',
          200: '#8b949e',
          300: '#6e7681',
          400: '#484f58',
          500: '#30363d',
          600: '#21262d',
          700: '#1c2128',
          800: '#161b22',
          900: '#0d1117',
          950: '#010409'
        },
        primary: {
          color: '#58a6ff',
          inverseColor: '#0d1117',
          hoverColor: '#79c0ff',
          activeColor: '#388bfd'
        },
        highlight: {
          background: 'rgba(88, 166, 255, 0.16)',
          focusBackground: 'rgba(88, 166, 255, 0.24)',
          color: '#58a6ff',
          focusColor: '#79c0ff'
        },
        formField: {
          background: '#0d1117',
          disabledBackground: '#161b22',
          filledBackground: '#161b22',
          filledHoverBackground: '#1c2128',
          filledFocusBackground: '#0d1117',
          borderColor: '#30363d',
          hoverBorderColor: '#58a6ff',
          focusBorderColor: '#58a6ff',
          invalidBorderColor: '#f85149',
          color: '#c9d1d9',
          disabledColor: '#484f58',
          placeholderColor: '#6e7681',
          invalidPlaceholderColor: '#f85149',
          floatLabelColor: '#6e7681',
          floatLabelFocusColor: '#58a6ff',
          floatLabelActiveColor: '#58a6ff',
          floatLabelInvalidColor: '#f85149',
          iconColor: '#6e7681',
          shadow: '0 0 0 0 transparent'
        },
        content: {
          background: '#0d1117',
          hoverBackground: '#161b22',
          borderColor: '#30363d',
          color: '#c9d1d9',
          hoverColor: '#f0f6fc'
        },
        navigation: {
          item: {
            focusBackground: '#161b22',
            activeBackground: 'rgba(88, 166, 255, 0.16)',
            color: '#c9d1d9',
            focusColor: '#f0f6fc',
            activeColor: '#58a6ff',
            icon: {
              color: '#6e7681',
              focusColor: '#c9d1d9',
              activeColor: '#58a6ff'
            }
          }
        }
      }
    }
  }
});

export default CodeRankPreset;

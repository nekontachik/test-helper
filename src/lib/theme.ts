import { extendTheme, type ThemeConfig } from '@chakra-ui/react';

// Define the color mode config
const config: ThemeConfig = {
  initialColorMode: 'light',
  useSystemColorMode: false,
};

// Define the colors to match Shadcn UI
const colors = {
  // Light mode colors
  light: {
    background: '#ffffff',
    foreground: '#000000',
    primary: {
      50: '#f0f9ff',
      100: '#e0f2fe',
      200: '#bae6fd',
      300: '#7dd3fc',
      400: '#38bdf8',
      500: '#0ea5e9',
      600: '#0284c7',
      700: '#0369a1',
      800: '#075985',
      900: '#0c4a6e',
    },
    secondary: {
      50: '#f8fafc',
      100: '#f1f5f9',
      200: '#e2e8f0',
      300: '#cbd5e1',
      400: '#94a3b8',
      500: '#64748b',
      600: '#475569',
      700: '#334155',
      800: '#1e293b',
      900: '#0f172a',
    },
  },
  // Dark mode colors
  dark: {
    background: '#1e293b',
    foreground: '#f8fafc',
    primary: {
      50: '#0c4a6e',
      100: '#075985',
      200: '#0369a1',
      300: '#0284c7',
      400: '#0ea5e9',
      500: '#38bdf8',
      600: '#7dd3fc',
      700: '#bae6fd',
      800: '#e0f2fe',
      900: '#f0f9ff',
    },
    secondary: {
      50: '#0f172a',
      100: '#1e293b',
      200: '#334155',
      300: '#475569',
      400: '#64748b',
      500: '#94a3b8',
      600: '#cbd5e1',
      700: '#e2e8f0',
      800: '#f1f5f9',
      900: '#f8fafc',
    },
  },
};

// Define the component styles
const components = {
  Button: {
    baseStyle: {
      fontWeight: 'medium',
      borderRadius: 'md',
    },
    variants: {
      solid: (props: { colorMode: string }) => {
        return {
          bg: props.colorMode === 'dark' ? 'primary.500' : 'primary.500',
          color: props.colorMode === 'dark' ? 'white' : 'white',
          _hover: {
            bg: props.colorMode === 'dark' ? 'primary.600' : 'primary.600',
          },
        };
      },
      outline: (props: { colorMode: string }) => {
        return {
          bg: 'transparent',
          color: props.colorMode === 'dark' ? 'primary.500' : 'primary.500',
          border: '1px solid',
          borderColor: props.colorMode === 'dark' ? 'primary.500' : 'primary.500',
          _hover: {
            bg: props.colorMode === 'dark' ? 'rgba(56, 189, 248, 0.1)' : 'rgba(56, 189, 248, 0.1)',
          },
        };
      },
    },
  },
  Input: {
    variants: {
      outline: (props: { colorMode: string }) => {
        return {
          field: {
            bg: props.colorMode === 'dark' ? 'gray.800' : 'white',
            color: props.colorMode === 'dark' ? 'white' : 'gray.800',
            border: '1px solid',
            borderColor: props.colorMode === 'dark' ? 'gray.600' : 'gray.200',
            _focus: {
              borderColor: props.colorMode === 'dark' ? 'primary.500' : 'primary.500',
              boxShadow: `0 0 0 1px ${props.colorMode === 'dark' ? 'primary.500' : 'primary.500'}`,
            },
          },
        };
      },
    },
  },
  // Add Sidebar component styling
  Box: {
    variants: {
      sidebar: (props: { colorMode: string }) => {
        return {
          bg: props.colorMode === 'dark' ? '#1e293b' : 'white',
          borderColor: props.colorMode === 'dark' ? '#38bdf8' : 'gray.200',
          borderWidth: props.colorMode === 'dark' ? '2px' : '1px',
          boxShadow: props.colorMode === 'dark' 
            ? '0 0 10px rgba(56, 189, 248, 0.3)' 
            : '0 2px 10px rgba(0, 0, 0, 0.05)',
        };
      },
    },
  },
  // Add NavItem component styling
  Flex: {
    variants: {
      navItem: (props: { colorMode: string }) => {
        return {
          borderRadius: 'md',
          p: 3,
          transition: 'all 0.2s',
          _hover: {
            bg: props.colorMode === 'dark' ? '#334155' : 'gray.100',
          },
        };
      },
      activeNavItem: (props: { colorMode: string }) => {
        return {
          bg: props.colorMode === 'dark' ? '#334155' : 'gray.100',
          color: props.colorMode === 'dark' ? '#38bdf8' : 'blue.600',
          borderWidth: props.colorMode === 'dark' ? '2px' : '1px',
          borderColor: props.colorMode === 'dark' ? '#38bdf8' : 'gray.300',
          borderRadius: 'md',
          p: 3,
          transition: 'all 0.2s',
          _hover: {
            bg: props.colorMode === 'dark' ? '#334155' : 'gray.100',
          },
        };
      },
    },
  },
};

// Create the theme
const theme = extendTheme({
  config,
  colors,
  components,
  styles: {
    global: (props: { colorMode: string }) => ({
      body: {
        bg: props.colorMode === 'dark' ? 'dark.background' : 'light.background',
        color: props.colorMode === 'dark' ? 'dark.foreground' : 'light.foreground',
      },
    }),
  },
});

export default theme; 
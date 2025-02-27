export interface ComponentStyleConfig {
  baseStyle?: Record<string, unknown>;
  sizes?: Record<string, unknown>;
  variants?: Record<string, unknown>;
  defaultProps?: {
    size?: string;
    variant?: string;
    colorScheme?: string;
    focusBorderColor?: string;
    [key: string]: unknown;
  };
} 
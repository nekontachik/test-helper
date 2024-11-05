export interface ComponentStyleConfig {
  baseStyle?: Record<string, any>;
  sizes?: Record<string, any>;
  variants?: Record<string, any>;
  defaultProps?: {
    size?: string;
    variant?: string;
    colorScheme?: string;
    focusBorderColor?: string;
    [key: string]: any;
  };
} 
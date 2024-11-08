declare module 'lucide-react' {
  import type { SVGProps, ComponentType } from 'react';

  interface IconProps extends SVGProps<SVGSVGElement> {
    size?: number | string;
    absoluteStrokeWidth?: boolean;
  }

  // Common icons
  export const X: ComponentType<IconProps>;
  export const Check: ComponentType<IconProps>;
  
  // Loading icons
  export const Loader: ComponentType<IconProps>;
  
  // Action icons
  export const Copy: ComponentType<IconProps>;
  export const Download: ComponentType<IconProps>;
  
  // Security Activity icons
  export const AlertTriangle: ComponentType<IconProps>;
  export const Shield: ComponentType<IconProps>;
  export const UserMinus: ComponentType<IconProps>;
  
  // Session Devices icons
  export const Laptop: ComponentType<IconProps>;
  export const Smartphone: ComponentType<IconProps>;
  export const Globe: ComponentType<IconProps>;

  // Password visibility icons
  export const Eye: ComponentType<IconProps>;
  export const EyeOff: ComponentType<IconProps>;
}

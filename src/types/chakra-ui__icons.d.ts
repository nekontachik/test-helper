declare module '@chakra-ui/icons' {
  import { ComponentType } from 'react';
  import { IconProps } from '@chakra-ui/react';

  // Common icons
  export const CloseIcon: ComponentType<IconProps>;
  export const CheckIcon: ComponentType<IconProps>;
  export const WarningIcon: ComponentType<IconProps>;
  export const InfoIcon: ComponentType<IconProps>;
  export const SearchIcon: ComponentType<IconProps>;
  
  // Navigation icons
  export const ChevronDownIcon: ComponentType<IconProps>;
  export const ChevronUpIcon: ComponentType<IconProps>;
  export const ChevronLeftIcon: ComponentType<IconProps>;
  export const ChevronRightIcon: ComponentType<IconProps>;
  export const HamburgerIcon: ComponentType<IconProps>;
  export const ExternalLinkIcon: ComponentType<IconProps>;
  export const SpinnerIcon: ComponentType<IconProps>;
  export const AddIcon: ComponentType<IconProps>;
  export const MinusIcon: ComponentType<IconProps>;
  
  // Sidebar specific icons
  export const DuplicateIcon: ComponentType<IconProps>; // Replacement for CopyIcon
  export const ViewOffIcon: ComponentType<IconProps>; // Replacement for ViewIcon
  export const RepeatClockIcon: ComponentType<IconProps>; // Replacement for RepeatIcon
  export const SettingsIcon: ComponentType<IconProps>;
} 
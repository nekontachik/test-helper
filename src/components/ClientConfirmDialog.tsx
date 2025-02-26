'use client';

import { ConfirmDialog } from './ConfirmDialog';
import type { ComponentProps } from 'react';

export function ClientConfirmDialog(props: ComponentProps<typeof ConfirmDialog>): JSX.Element {
  return <ConfirmDialog {...props} />;
} 
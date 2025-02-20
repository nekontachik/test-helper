'use client';

import { ConfirmDialog } from './ConfirmDialog';
import type { ComponentProps } from 'react';

export function ClientConfirmDialog(props: ComponentProps<typeof ConfirmDialog>) {
  return <ConfirmDialog {...props} />;
} 
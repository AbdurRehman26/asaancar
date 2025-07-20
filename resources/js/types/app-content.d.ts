import * as React from 'react';

export interface AppContentProps extends React.ComponentProps<'main'> {
  variant?: 'header' | 'sidebar';
} 
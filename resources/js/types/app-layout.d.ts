import { type BreadcrumbItem } from './index';
import { type ReactNode } from 'react';

export interface AppLayoutProps {
  children: ReactNode;
  breadcrumbs?: BreadcrumbItem[];
} 
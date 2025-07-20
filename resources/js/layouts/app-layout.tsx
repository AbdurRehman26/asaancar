import AppLayoutTemplate from '@/layouts/app/app-sidebar-layout';
import React from 'react';
import type { AppLayoutProps } from '@/types/app-layout';

export default ({ children, breadcrumbs, ...props }: AppLayoutProps) => (
    <AppLayoutTemplate breadcrumbs={breadcrumbs} {...props}>
        {children}
    </AppLayoutTemplate>
);

import React from 'react';
import { type IconProps } from '@/types/icon';

export function Icon({ iconNode: IconComponent, className, ...props }: IconProps) {
    return <IconComponent className={className} {...props} />;
}

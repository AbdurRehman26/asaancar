import { LucideIcon } from 'lucide-react';
import type { IconPropsSimple } from '@/types/icon';

export function Icon({ iconNode: IconComponent, className }: IconPropsSimple) {
    if (!IconComponent) {
        return null;
    }

    return <IconComponent className={className} />;
}

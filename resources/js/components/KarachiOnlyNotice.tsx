import { MapPin } from 'lucide-react';

interface KarachiOnlyNoticeProps {
    className?: string;
}

export default function KarachiOnlyNotice({ className = '' }: KarachiOnlyNoticeProps) {
    return (
        <div
            className={`flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-amber-900 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-100 ${className}`}
        >
            <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-amber-600 dark:text-amber-300" />
            <p className="text-sm leading-6">
                We’re currently serving Karachi only. More cities are on the way soon, and we’ll open them up as the network expands.
            </p>
        </div>
    );
}

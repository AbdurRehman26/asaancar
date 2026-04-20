import { cn } from '@/lib/utils';
import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';

export function DashboardPage({ children, className = '' }: { children: ReactNode; className?: string }) {
    return <div className={cn('mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 pt-0 pb-6 sm:px-6 xl:px-8', className)}>{children}</div>;
}

export function DashboardHero({
    eyebrow,
    title,
    description,
    actions,
}: {
    eyebrow?: string;
    title: string;
    description: string;
    actions?: ReactNode;
}) {
    return (
        <section className="overflow-hidden rounded-[2rem] border border-white/60 bg-gradient-to-br from-[#fff6fc] via-white to-[#f5ecff] p-6 shadow-[0_20px_60px_-30px_rgba(126,36,108,0.45)] ring-1 ring-[#7e246c]/8 dark:border-white/10 dark:bg-gradient-to-br dark:from-[#2f1830] dark:via-[#1d1624] dark:to-[#15121e] dark:ring-white/5">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
                <div className="max-w-3xl">
                    {eyebrow ? (
                        <span className="inline-flex rounded-full border border-[#7e246c]/15 bg-[#7e246c]/8 px-3 py-1 text-xs font-semibold tracking-[0.2em] text-[#7e246c] uppercase dark:border-white/10 dark:bg-white/5 dark:text-white/75">
                            {eyebrow}
                        </span>
                    ) : null}
                    <h1 className="mt-4 text-3xl font-semibold tracking-tight text-[#2b1128] sm:text-4xl dark:text-white">{title}</h1>
                    <p className="mt-3 max-w-2xl text-sm leading-6 text-[#6b5368] sm:text-base dark:text-white/70">{description}</p>
                </div>
                {actions ? <div className="flex flex-wrap items-center gap-3">{actions}</div> : null}
            </div>
        </section>
    );
}

export function DashboardPanel({
    title,
    description,
    actions,
    children,
    className = '',
    contentClassName = '',
}: {
    title?: string;
    description?: string;
    actions?: ReactNode;
    children: ReactNode;
    className?: string;
    contentClassName?: string;
}) {
    return (
        <section
            className={cn(
                'overflow-hidden rounded-[1.75rem] border border-white/70 bg-white/90 shadow-[0_18px_45px_-32px_rgba(126,36,108,0.55)] ring-1 ring-[#7e246c]/6 backdrop-blur dark:border-white/10 dark:bg-[#17141f]/92 dark:ring-white/5',
                className,
            )}
        >
            {title || description || actions ? (
                <div className="flex flex-col gap-4 border-b border-[#7e246c]/8 px-6 py-5 dark:border-white/10">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                        <div>
                            {title ? <h2 className="text-lg font-semibold text-[#2b1128] dark:text-white">{title}</h2> : null}
                            {description ? <p className="mt-1 text-sm text-[#7b6678] dark:text-white/65">{description}</p> : null}
                        </div>
                        {actions ? <div className="flex flex-wrap items-center gap-3">{actions}</div> : null}
                    </div>
                </div>
            ) : null}
            <div className={cn('px-6 py-6', contentClassName)}>{children}</div>
        </section>
    );
}

export function DashboardStatCard({ icon, label, value, hint }: { icon: ReactNode; label: string; value: ReactNode; hint?: string }) {
    return (
        <div className="rounded-[1.5rem] border border-white/70 bg-white/95 p-5 shadow-[0_16px_38px_-30px_rgba(126,36,108,0.65)] ring-1 ring-[#7e246c]/6 dark:border-white/10 dark:bg-[#1b1724] dark:ring-white/5">
            <div className="flex items-start justify-between gap-4">
                <div>
                    <p className="text-sm font-medium text-[#80657a] dark:text-white/65">{label}</p>
                    <div className="mt-3 text-3xl font-semibold tracking-tight text-[#2b1128] dark:text-white">{value}</div>
                    {hint ? <p className="mt-2 text-xs text-[#9a8394] dark:text-white/45">{hint}</p> : null}
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#7e246c]/10 text-[#7e246c] dark:bg-white/8 dark:text-white">
                    {icon}
                </div>
            </div>
        </div>
    );
}

export function DashboardEmptyState({
    icon,
    title,
    description,
    action,
}: {
    icon: ReactNode;
    title: string;
    description: string;
    action?: ReactNode;
}) {
    return (
        <div className="flex flex-col items-center justify-center rounded-[1.75rem] border border-dashed border-[#7e246c]/20 bg-[#fcf8fd] px-6 py-14 text-center dark:border-white/10 dark:bg-[#120f18]">
            <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-[#7e246c]/10 text-[#7e246c] dark:bg-white/8 dark:text-white">
                {icon}
            </div>
            <h3 className="mt-5 text-lg font-semibold text-[#2b1128] dark:text-white">{title}</h3>
            <p className="mt-2 max-w-md text-sm leading-6 text-[#7d6678] dark:text-white/65">{description}</p>
            {action ? <div className="mt-6">{action}</div> : null}
        </div>
    );
}

export function DashboardPrimaryLink({ to, children }: { to: string; children: ReactNode }) {
    return (
        <Link
            to={to}
            className="inline-flex items-center justify-center rounded-xl bg-[#7e246c] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#67205a]"
        >
            {children}
        </Link>
    );
}

export function DashboardSecondaryButton({
    children,
    onClick,
    type = 'button',
}: {
    children: ReactNode;
    onClick?: () => void;
    type?: 'button' | 'submit';
}) {
    return (
        <button
            type={type}
            onClick={onClick}
            className="inline-flex items-center justify-center rounded-xl border border-[#7e246c]/20 bg-white px-4 py-2.5 text-sm font-semibold text-[#7e246c] transition hover:border-[#7e246c]/35 hover:bg-[#fbf3fa] dark:border-white/10 dark:bg-white/5 dark:text-white"
        >
            {children}
        </button>
    );
}

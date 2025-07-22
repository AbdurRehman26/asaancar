import { useState, useRef } from 'react';
import InputError from '@/components/input-error';
import AppLayout from '@/layouts/app-layout';
import SettingsLayout from '@/layouts/settings/layout';
import { type BreadcrumbItem } from '@/types';
import { Transition } from '@headlessui/react';
import { Head } from '@inertiajs/react';
import HeadingSmall from '@/components/heading-small';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { apiFetch } from '@/lib/utils';
import { Eye, EyeOff } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Password settings',
        href: '/settings/password',
    },
];

export default function Password() {
    const passwordInput = useRef<HTMLInputElement>(null);
    const currentPasswordInput = useRef<HTMLInputElement>(null);
    const [data, setData] = useState({
        current_password: '',
        password: '',
        password_confirmation: '',
    });
    const [processing, setProcessing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const [showCurrent, setShowCurrent] = useState(false);
    const [showNew, setShowNew] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    const updatePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setProcessing(true);
        setError(null);
        setSuccess(false);
        try {
            const res = await apiFetch('/api/settings/password', {
                method: 'PUT',
                body: JSON.stringify(data),
            });
            if (!res.ok) {
                const err = await res.json();
                setError(err.message || 'Update failed');
            } else {
                setSuccess(true);
                setData({ current_password: '', password: '', password_confirmation: '' });
            }
        } catch (err) {
            console.error(err);
            setError('Network error' + err);
        } finally {
            setProcessing(false);
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Password settings" />
            <SettingsLayout>
                <div className="space-y-6">
                    <HeadingSmall title="Update password" description="Ensure your account is using a long, random password to stay secure" />
                    <form onSubmit={updatePassword} className="space-y-6">
                        <div className="grid gap-2">
                            <Label htmlFor="current_password">Current password</Label>
                            <div className="relative">
                                <Input
                                    id="current_password"
                                    ref={currentPasswordInput}
                                    value={data.current_password}
                                    onChange={(e) => setData({ ...data, current_password: e.target.value })}
                                    type={showCurrent ? 'text' : 'password'}
                                    className="mt-1 block w-full pr-10"
                                    autoComplete="current-password"
                                    placeholder="Current password"
                                />
                                <button
                                    type="button"
                                    tabIndex={-1}
                                    className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#7e246c]"
                                    onClick={() => setShowCurrent((v) => !v)}
                                >
                                    {showCurrent ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="password">New password</Label>
                            <div className="relative">
                                <Input
                                    id="password"
                                    ref={passwordInput}
                                    value={data.password}
                                    onChange={(e) => setData({ ...data, password: e.target.value })}
                                    type={showNew ? 'text' : 'password'}
                                    className="mt-1 block w-full pr-10"
                                    autoComplete="new-password"
                                    placeholder="New password"
                                />
                                <button
                                    type="button"
                                    tabIndex={-1}
                                    className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#7e246c]"
                                    onClick={() => setShowNew((v) => !v)}
                                >
                                    {showNew ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="password_confirmation">Confirm password</Label>
                            <div className="relative">
                                <Input
                                    id="password_confirmation"
                                    value={data.password_confirmation}
                                    onChange={(e) => setData({ ...data, password_confirmation: e.target.value })}
                                    type={showConfirm ? 'text' : 'password'}
                                    className="mt-1 block w-full pr-10"
                                    autoComplete="new-password"
                                    placeholder="Confirm password"
                                />
                                <button
                                    type="button"
                                    tabIndex={-1}
                                    className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#7e246c]"
                                    onClick={() => setShowConfirm((v) => !v)}
                                >
                                    {showConfirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                        </div>
                        {error && <InputError message={error} />}
                        <div className="flex items-center gap-4">
                            <Button disabled={processing}>Save password</Button>
                            <Transition
                                show={success}
                                enter="transition ease-in-out"
                                enterFrom="opacity-0"
                                leave="transition ease-in-out"
                                leaveTo="opacity-0"
                            >
                                <p className="text-sm text-neutral-600">Saved</p>
                            </Transition>
                        </div>
                    </form>
                </div>
            </SettingsLayout>
        </AppLayout>
    );
}

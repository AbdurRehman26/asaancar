import { useState } from 'react';
import { type BreadcrumbItem, type SharedData } from '@/types';
import { Transition } from '@headlessui/react';
import { Head } from '@inertiajs/react';
import { FormEventHandler } from 'react';

import DeleteUser from '@/components/delete-user';
import HeadingSmall from '@/components/heading-small';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import SettingsLayout from '@/layouts/settings/layout';
import { apiFetch } from '@/lib/utils';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Profile settings',
        href: '/settings/profile',
    },
];

type ProfileForm = {
    name: string;
    email: string;
};

export default function Profile({ auth }: { auth: SharedData['auth'] }) {
    const [data, setData] = useState<ProfileForm>({
        name: auth.user.name,
        email: auth.user.email,
    });
    const [processing, setProcessing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const submit: FormEventHandler = async (e) => {
        e.preventDefault();
        setProcessing(true);
        setError(null);
        setSuccess(false);
        try {
            const res = await apiFetch('/api/settings/profile', {
                method: 'PATCH',
                body: JSON.stringify(data),
            });
            if (!res.ok) {
                const err = await res.json();
                setError(err.message || 'Update failed');
            } else {
                setSuccess(true);
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
            <Head title="Profile settings" />

            <SettingsLayout>
                <div className="space-y-6">
                    <HeadingSmall title="Profile information" description="Update your name and email address" />

                    <form onSubmit={submit} className="space-y-6">
                        <div className="grid gap-2">
                            <Label htmlFor="name">Name</Label>
                            <Input
                                id="name"
                                className="mt-1 block w-full"
                                value={data.name}
                                onChange={(e) => setData({ ...data, name: e.target.value })}
                                required
                                autoComplete="name"
                                placeholder="Full name"
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="email">Email address</Label>
                            <Input
                                id="email"
                                type="email"
                                className="mt-1 block w-full"
                                value={data.email}
                                onChange={(e) => setData({ ...data, email: e.target.value })}
                                required
                                autoComplete="username"
                                placeholder="Email address"
                            />
                        </div>
                        {error && <InputError className="mt-2" message={error} />}
                        <div className="flex items-center gap-4">
                            <Button disabled={processing}>Save</Button>
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
                <DeleteUser />
            </SettingsLayout>
        </AppLayout>
    );
}

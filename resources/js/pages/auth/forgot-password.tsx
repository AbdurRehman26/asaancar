// Components
import { useState } from 'react';
import { LoaderCircle } from 'lucide-react';
import { FormEventHandler } from 'react';

import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AuthLayout from '@/layouts/auth-layout';
import { apiFetch } from '@/lib/utils';

export default function ForgotPassword({ status }: { status?: string }) {
    const [data, setData] = useState({ email: '' });
    const [processing, setProcessing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const submit: FormEventHandler = async (e) => {
        e.preventDefault();
        setProcessing(true);
        setError(null);
        setSuccess(false);
        try {
            const res = await apiFetch('/api/forgot-password', {
                method: 'POST',
                body: JSON.stringify(data),
            });
            if (!res.ok) {
                const err = await res.json();
                setError(err.message || 'Request failed');
            } else {
                setSuccess(true);
            }
        } catch (err) {
            console.error(err);
            setError('Network error');
        } finally {
            setProcessing(false);
        }
    };

    return (
        <AuthLayout title="Forgot password" description="Enter your email to receive a password reset link">
            {status && <div className="mb-4 text-center text-sm font-medium text-green-600">{status}</div>}
            <div className="space-y-6">
                <form onSubmit={submit}>
                    <div className="grid gap-2">
                        <Label htmlFor="email">Email address</Label>
                        <Input
                            id="email"
                            type="email"
                            name="email"
                            autoComplete="off"
                            value={data.email}
                            autoFocus
                            onChange={(e) => setData({ ...data, email: e.target.value })}
                            placeholder="email@example.com"
                        />
                    </div>
                    {error && <InputError message={error} />}
                    <div className="my-6 flex items-center justify-start">
                        <Button
                            className="w-full cursor-pointer"
                            disabled={processing}
                            style={{ pointerEvents: processing ? 'none' : 'auto' }}
                        >
                            {processing && <LoaderCircle className="h-4 w-4 animate-spin" />}
                            Email password reset link
                        </Button>
                    </div>
                    {success && <div className="text-green-600 text-center mt-2">Reset link sent!</div>}
                </form>
                <div className="space-x-1 text-center text-sm text-muted-foreground">
                    <span>Or, return to</span>
                    <TextLink href={route('login')}>log in</TextLink>
                </div>
            </div>
        </AuthLayout>
    );
}

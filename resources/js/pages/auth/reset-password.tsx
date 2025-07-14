import { useState } from 'react';
import { LoaderCircle } from 'lucide-react';
import { FormEventHandler } from 'react';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AuthLayout from '@/layouts/auth-layout';
import { apiFetch } from '@/lib/utils';

interface ResetPasswordProps {
    token: string;
    email: string;
}

type ResetPasswordForm = {
    token: string;
    email: string;
    password: string;
    password_confirmation: string;
};

export default function ResetPassword({ token, email }: ResetPasswordProps) {
    const [data, setData] = useState<ResetPasswordForm>({
        token: token,
        email: email,
        password: '',
        password_confirmation: '',
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
            const res = await apiFetch('/api/reset-password', {
                method: 'POST',
                body: JSON.stringify(data),
            });
            if (!res.ok) {
                const err = await res.json();
                setError(err.message || 'Reset failed');
            } else {
                setSuccess(true);
            }
        } catch (err) {
            setError('Network error');
        } finally {
            setProcessing(false);
        }
    };

    return (
        <AuthLayout title="Reset password" description="Please enter your new password below">
            <form onSubmit={submit}>
                <div className="grid gap-6">
                    <div className="grid gap-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                            id="email"
                            type="email"
                            name="email"
                            autoComplete="email"
                            value={data.email}
                            className="mt-1 block w-full"
                            readOnly
                            onChange={(e) => setData({ ...data, email: e.target.value })}
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="password">Password</Label>
                        <Input
                            id="password"
                            type="password"
                            name="password"
                            autoComplete="new-password"
                            value={data.password}
                            className="mt-1 block w-full"
                            autoFocus
                            onChange={(e) => setData({ ...data, password: e.target.value })}
                            placeholder="Password"
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="password_confirmation">Confirm password</Label>
                        <Input
                            id="password_confirmation"
                            type="password"
                            name="password_confirmation"
                            autoComplete="new-password"
                            value={data.password_confirmation}
                            className="mt-1 block w-full"
                            onChange={(e) => setData({ ...data, password_confirmation: e.target.value })}
                            placeholder="Confirm password"
                        />
                    </div>
                    {error && <InputError message={error} />}
                    <Button type="submit" className="mt-4 w-full" disabled={processing}>
                        {processing && <LoaderCircle className="h-4 w-4 animate-spin" />}
                        Reset password
                    </Button>
                    {success && <div className="text-green-600 text-center mt-2">Password reset successful!</div>}
                </div>
            </form>
        </AuthLayout>
    );
}

// Components
import { useState } from 'react';
import { LoaderCircle } from 'lucide-react';
import { FormEventHandler } from 'react';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AuthLayout from '@/layouts/auth-layout';
import { apiFetch } from '@/lib/utils';

export default function ConfirmPassword() {
    const [data, setData] = useState({ password: '' });
    const [processing, setProcessing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const submit: FormEventHandler = async (e) => {
        e.preventDefault();
        setProcessing(true);
        setError(null);
        setSuccess(false);
        try {
            const res = await apiFetch('/api/confirm-password', {
                method: 'POST',
                body: JSON.stringify(data),
            });
            if (!res.ok) {
                const err = await res.json();
                setError(err.message || 'Confirmation failed');
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
        <AuthLayout
            title="Confirm your password"
            description="This is a secure area of the application. Please confirm your password before continuing."
        >
            <form onSubmit={submit}>
                <div className="space-y-6">
                    <div className="grid gap-2">
                        <Label htmlFor="password">Password</Label>
                        <Input
                            id="password"
                            type="password"
                            name="password"
                            placeholder="Password"
                            autoComplete="current-password"
                            value={data.password}
                            autoFocus
                            onChange={(e) => setData({ ...data, password: e.target.value })}
                        />
                    </div>
                    {error && <InputError message={error} />}
                    <div className="flex items-center">
                        <Button className="w-full" disabled={processing}>
                            {processing && <LoaderCircle className="h-4 w-4 animate-spin" />}
                            Confirm password
                        </Button>
                    </div>
                    {success && <div className="text-green-600 text-center mt-2">Password confirmed!</div>}
                </div>
            </form>
        </AuthLayout>
    );
}

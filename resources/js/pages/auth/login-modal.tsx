import { useState } from 'react';
import { useAuth } from '@/components/AuthContext';
import { LoaderCircle } from 'lucide-react';
import { FormEventHandler } from 'react';

import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import RegisterModal from './register-modal';

type LoginForm = {
    email: string;
    password: string;
    remember: boolean;
};

interface LoginModalProps {
    status?: string;
    canResetPassword: boolean;
    onSuccess?: () => void;
}

export default function LoginModal({ status, canResetPassword, onSuccess }: LoginModalProps = { canResetPassword: false }) {
    const { login, loading: authLoading, error: authError } = useAuth();
    const [data, setData] = useState<LoginForm>({
        email: '',
        password: '',
        remember: false,
    });
    const [processing, setProcessing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const submit: FormEventHandler = async (e) => {
        e.preventDefault();
        setProcessing(true);
        setError(null);
        const success = await login(data.email, data.password);
        setProcessing(false);
        if (success && onSuccess) onSuccess();
    };

    return (
        <form className="flex flex-col gap-6" onSubmit={submit}>
            <div className="grid gap-6">
                <div className="grid gap-2">
                    <Label htmlFor="email">Email address</Label>
                    <Input
                        id="email"
                        type="email"
                        required
                        autoFocus
                        tabIndex={1}
                        autoComplete="email"
                        value={data.email}
                        onChange={(e) => setData({ ...data, email: e.target.value })}
                        placeholder="email@example.com"
                    />
                </div>

                <div className="grid gap-2">
                    <div className="flex items-center">
                        <Label htmlFor="password">Password</Label>
                        {canResetPassword && (
                            <TextLink href="/forgot-password" className="ml-auto text-sm" tabIndex={5}>
                                Forgot password?
                            </TextLink>
                        )}
                    </div>
                    <Input
                        id="password"
                        type="password"
                        required
                        tabIndex={2}
                        autoComplete="current-password"
                        value={data.password}
                        onChange={(e) => setData({ ...data, password: e.target.value })}
                        placeholder="Password"
                    />
                </div>

                <div className="flex items-center space-x-3">
                    <Checkbox
                        id="remember"
                        name="remember"
                        checked={data.remember}
                        onClick={() => setData({ ...data, remember: !data.remember })}
                        tabIndex={3}
                    />
                    <Label htmlFor="remember">Remember me</Label>
                </div>
                {(error || authError) && <InputError message={(error || authError) ?? ''} />}
                <Button type="submit" className="mt-4 w-full" tabIndex={4} disabled={processing || authLoading}>
                    {(processing || authLoading) && <LoaderCircle className="h-4 w-4 animate-spin" />}
                    Log in
                </Button>
            </div>

            <div className="text-center text-sm text-muted-foreground">
                Don't have an account?{' '}
                <Dialog>
                    <DialogTrigger asChild>
                        <button className="text-primary hover:underline" tabIndex={5}>
                            Sign up
                        </button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Create an account</DialogTitle>
                        </DialogHeader>
                        <RegisterModal />
                    </DialogContent>
                </Dialog>
            </div>
        </form>
    );
} 
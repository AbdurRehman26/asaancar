import { useState } from 'react';
import axios from 'axios';
import { LoaderCircle } from 'lucide-react';
import { FormEventHandler } from 'react';

import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import LoginModal from './login-modal';

type RegisterForm = {
    name: string;
    email: string;
    password: string;
    password_confirmation: string;
    terms: boolean;
};

interface RegisterModalProps {
    status?: string;
}

export default function RegisterModal({ status }: RegisterModalProps = {}) {
    const [data, setData] = useState<RegisterForm>({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
        terms: false,
    });
    const [processing, setProcessing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const submit: FormEventHandler = async (e) => {
        e.preventDefault();
        setProcessing(true);
        setError(null);
        try {
            const response = await axios.post('/api/register', {
                name: data.name,
                email: data.email,
                password: data.password,
                password_confirmation: data.password_confirmation,
                terms: data.terms,
            }, {
                headers: { 'Accept': 'application/json' },
            });
            if (response.data.token) {
                localStorage.setItem('token', response.data.token);
                window.location.reload();
            }
        } catch (err: any) {
            if (err.response && err.response.data && err.response.data.message) {
                setError(err.response.data.message);
            } else {
                setError('Registration failed');
            }
        } finally {
            setProcessing(false);
        }
    };

    return (
        <form className="flex flex-col gap-6" onSubmit={submit}>
            <div className="grid gap-6">
                <div className="grid gap-2">
                    <Label htmlFor="name">Name</Label>
                    <Input
                        id="name"
                        type="text"
                        required
                        autoFocus
                        tabIndex={1}
                        autoComplete="name"
                        value={data.name}
                        onChange={(e) => setData({ ...data, name: e.target.value })}
                        placeholder="John Doe"
                    />
                </div>

                <div className="grid gap-2">
                    <Label htmlFor="email">Email address</Label>
                    <Input
                        id="email"
                        type="email"
                        required
                        tabIndex={2}
                        autoComplete="email"
                        value={data.email}
                        onChange={(e) => setData({ ...data, email: e.target.value })}
                        placeholder="email@example.com"
                    />
                </div>

                <div className="grid gap-2">
                    <Label htmlFor="password">Password</Label>
                    <Input
                        id="password"
                        type="password"
                        required
                        tabIndex={3}
                        autoComplete="new-password"
                        value={data.password}
                        onChange={(e) => setData({ ...data, password: e.target.value })}
                        placeholder="Password"
                    />
                </div>

                <div className="grid gap-2">
                    <Label htmlFor="password_confirmation">Confirm password</Label>
                    <Input
                        id="password_confirmation"
                        type="password"
                        required
                        tabIndex={4}
                        autoComplete="new-password"
                        value={data.password_confirmation}
                        onChange={(e) => setData({ ...data, password_confirmation: e.target.value })}
                        placeholder="Confirm password"
                    />
                </div>

                <div className="flex items-center space-x-3">
                    <Checkbox
                        id="terms"
                        name="terms"
                        checked={data.terms}
                        onClick={() => setData({ ...data, terms: !data.terms })}
                        tabIndex={5}
                    />
                    <Label htmlFor="terms">I agree to the terms and conditions</Label>
                </div>
                {error && <InputError message={error} />}
                <Button type="submit" className="mt-4 w-full" tabIndex={6} disabled={processing}>
                    {processing && <LoaderCircle className="h-4 w-4 animate-spin" />}
                    Create account
                </Button>
            </div>

            <div className="text-center text-sm text-muted-foreground">
                Already have an account?{' '}
                <Dialog>
                    <DialogTrigger asChild>
                        <button className="text-primary hover:underline" tabIndex={7}>
                            Sign in
                        </button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Log in to your account</DialogTitle>
                        </DialogHeader>
                        <LoginModal canResetPassword={true} />
                    </DialogContent>
                </Dialog>
            </div>
        </form>
    );
} 
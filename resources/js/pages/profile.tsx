import { useAuth } from '@/components/AuthContext';
import { DashboardHero, DashboardPage, DashboardPanel } from '@/components/dashboard-shell';
import ImageUpload, { UploadedImage } from '@/components/ImageUpload';
import InputError from '@/components/input-error';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { apiFetch } from '@/lib/utils';
import { Camera, Trash2 } from 'lucide-react';
import React, { useState } from 'react';

export default function ProfilePage() {
    const { user, setUser } = useAuth();
    const [profile, setProfile] = useState({
        name: user?.name || '',
        email: user?.email || '',
        profile_image: user?.profile_image || '',
    });
    const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([]);
    const [profileLoading, setProfileLoading] = useState(false);
    const [profileSuccess, setProfileSuccess] = useState(false);
    const [profileError, setProfileError] = useState<string | null>(null);

    const [passwords, setPasswords] = useState({
        current_password: '',
        password: '',
        password_confirmation: '',
    });
    const [passwordLoading, setPasswordLoading] = useState(false);
    const [passwordSuccess, setPasswordSuccess] = useState(false);
    const [passwordError, setPasswordError] = useState<string | null>(null);
    const previewImage = uploadedImages[0]?.url || profile.profile_image || '';
    const profileInitial = profile.name ? profile.name.charAt(0) : 'U';

    const handleProfileSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setProfileLoading(true);
        setProfileSuccess(false);
        setProfileError(null);
        try {
            const payload = { ...profile };
            if (uploadedImages.length > 0) {
                payload.profile_image = uploadedImages[0].url;
            }
            const res = await apiFetch('/api/settings/profile', {
                method: 'PATCH',
                body: JSON.stringify(payload),
            });
            if (!res.ok) {
                const err = await res.json();
                setProfileError(err.message || 'Update failed');
            } else {
                setProfileSuccess(true);
                const updated = await res.json();
                // Update user context with new data including profile image
                if (setUser) setUser({ ...user, ...updated.user });
            }
        } catch (err) {
            console.error(err);
            setProfileError('Network error' + (err instanceof Error ? err.message : String(err)));
        } finally {
            setProfileLoading(false);
        }
    };

    const handlePasswordSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setPasswordLoading(true);
        setPasswordSuccess(false);
        setPasswordError(null);
        try {
            const res = await apiFetch('/api/settings/password', {
                method: 'PUT',
                body: JSON.stringify(passwords),
            });
            if (!res.ok) {
                const err = await res.json();
                // Handle validation errors
                if (err.errors) {
                    const errorMessages = Object.values(err.errors).flat();
                    setPasswordError((errorMessages[0] as string) || 'Password update failed');
                } else {
                    setPasswordError((err.message as string) || 'Password update failed');
                }
            } else {
                setPasswordSuccess(true);
                setPasswords({ current_password: '', password: '', password_confirmation: '' });
            }
        } catch (err) {
            console.error(err);
            setPasswordError('Network error' + (err instanceof Error ? err.message : String(err)));
        } finally {
            setPasswordLoading(false);
        }
    };

    return (
        <DashboardPage className="max-w-5xl">
            <DashboardHero
                eyebrow="Account settings"
                title="Profile settings"
                description="Update the information people see when they contact you, keep your profile photo fresh, and secure your account details."
            />
            {/* Profile info form */}
            <form onSubmit={handleProfileSubmit} className="space-y-6">
                <DashboardPanel title="Personal information" description="Manage the name and profile photo shown in your dashboard presence.">
                    <div className="mb-6 rounded-xl border border-gray-200 bg-gray-50 p-5 dark:border-gray-700 dark:bg-gray-900/20">
                        <Label className="mb-4 block text-sm font-medium text-gray-700 dark:text-gray-200">Profile photo</Label>
                        <div className="grid gap-5 md:grid-cols-[140px_minmax(0,1fr)] md:items-center">
                            <div className="flex flex-col items-center text-center">
                                <div className="relative">
                                    <Avatar className="h-28 w-28 rounded-2xl border border-gray-200 shadow-sm dark:border-gray-700">
                                        <AvatarImage src={previewImage} alt={profile.name || 'Profile'} className="object-cover" />
                                        <AvatarFallback className="rounded-2xl bg-gray-100 text-3xl font-bold text-[#7e246c] uppercase dark:bg-gray-700">
                                            {profileInitial}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="absolute right-0 bottom-0 flex h-8 w-8 items-center justify-center rounded-full border border-white bg-[#7e246c] text-white dark:border-gray-800">
                                        <Camera className="h-3.5 w-3.5" />
                                    </div>
                                </div>
                                {previewImage && (
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        className="mt-4 rounded-full"
                                        onClick={() => {
                                            setProfile({ ...profile, profile_image: '' });
                                            setUploadedImages([]);
                                        }}
                                    >
                                        <Trash2 className="mr-2 h-4 w-4" />
                                        Remove photo
                                    </Button>
                                )}
                            </div>

                            <ImageUpload onImagesChange={setUploadedImages} maxImages={1} directory="profile-images" />
                        </div>
                    </div>

                    <div className="grid max-w-sm gap-2">
                        <Label htmlFor="name">Name</Label>
                        <Input
                            id="name"
                            value={profile.name}
                            onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                            required
                            autoComplete="name"
                            placeholder="Full name"
                        />
                    </div>
                    {profileError && <InputError className="mt-2" message={profileError || undefined} />}
                    <div className="flex items-center gap-4">
                        <Button className="cursor-pointer bg-[#7e246c] text-white hover:bg-[#6a1f5c]" disabled={profileLoading}>
                            Save
                        </Button>
                        {profileSuccess && <span className="text-sm text-green-600">Saved!</span>}
                    </div>
                </DashboardPanel>
            </form>
            {/* Password form */}
            <form onSubmit={handlePasswordSubmit} className="space-y-6">
                <DashboardPanel
                    title={user?.has_password ? 'Change password' : 'Set password'}
                    description="Use a strong password to keep your dashboard and ride activity secure."
                >
                    {user?.has_password && (
                        <div className="grid gap-2">
                            <Label htmlFor="current_password">Current Password</Label>
                            <Input
                                id="current_password"
                                type="password"
                                value={passwords.current_password}
                                onChange={(e) => setPasswords({ ...passwords, current_password: e.target.value })}
                                required
                                autoComplete="current-password"
                                placeholder="Enter your current password"
                            />
                        </div>
                    )}
                    <div className="grid gap-2">
                        <Label htmlFor="password">New Password</Label>
                        <Input
                            id="password"
                            type="password"
                            value={passwords.password}
                            onChange={(e) => setPasswords({ ...passwords, password: e.target.value })}
                            required
                            autoComplete="new-password"
                            placeholder="New password"
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="password_confirmation">Confirm New Password</Label>
                        <Input
                            id="password_confirmation"
                            type="password"
                            value={passwords.password_confirmation}
                            onChange={(e) => setPasswords({ ...passwords, password_confirmation: e.target.value })}
                            required
                            autoComplete="new-password"
                            placeholder="Confirm new password"
                        />
                    </div>
                    {passwordError && <InputError className="mt-2" message={passwordError || undefined} />}
                    <div className="flex items-center gap-4">
                        <Button className="cursor-pointer bg-[#7e246c] text-white hover:bg-[#6a1f5c]" disabled={passwordLoading}>
                            Change Password
                        </Button>
                        {passwordSuccess && <span className="text-sm text-green-600">Password updated!</span>}
                    </div>
                </DashboardPanel>
            </form>
        </DashboardPage>
    );
}

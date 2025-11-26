import React, { useState } from 'react';
import { useAuth } from '@/components/AuthContext';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import InputError from '@/components/input-error';
import Navbar from '@/components/navbar';
import { apiFetch } from '@/lib/utils';

export default function ProfilePage() {
  const { user, setUser } = useAuth();
  const [profile, setProfile] = useState({
    name: user?.name || '',
    email: user?.email || '',
  });
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

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileLoading(true);
    setProfileSuccess(false);
    setProfileError(null);
    try {
      const res = await apiFetch('/api/settings/profile', {
        method: 'PATCH',
        body: JSON.stringify(profile),
      });
      if (!res.ok) {
        const err = await res.json();
        setProfileError(err.message || 'Update failed');
      } else {
        setProfileSuccess(true);
        const updated = await res.json();
        if (setUser) setUser({ ...user, ...updated });
      }
    } catch (err) {
      console.error(err);
      setProfileError('Network error' + err);
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
          setPasswordError(errorMessages[0] || 'Password update failed');
        } else {
          setPasswordError(err.message || 'Password update failed');
        }
      } else {
        setPasswordSuccess(true);
        setPasswords({ current_password: '', password: '', password_confirmation: '' });
      }
    } catch (err) {
      console.error(err);
      setPasswordError('Network error' + err);
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-gray-900">
      <Navbar />
      <div className="max-w-xl mx-auto py-12 px-4 mt-10">
        <h1 className="text-2xl font-bold mb-8">Profile</h1>
        {/* Profile info form */}
        <form onSubmit={handleProfileSubmit} className="space-y-6 bg-white dark:bg-gray-800 rounded-xl shadow p-6 mb-10">
          <h2 className="text-lg font-semibold mb-2">Personal Information</h2>
          <div className="grid gap-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={profile.name}
              onChange={e => setProfile({ ...profile, name: e.target.value })}
              required
              autoComplete="name"
              placeholder="Full name"
            />
          </div>
          {profileError && <InputError className="mt-2" message={profileError} />}
          <div className="flex items-center gap-4">
            <Button className="bg-[#7e246c] text-white hover:bg-[#6a1f5c] cursor-pointer" disabled={profileLoading}>Save</Button>
            {profileSuccess && <span className="text-green-600 text-sm">Saved!</span>}
          </div>
        </form>
        {/* Password form */}
        <form onSubmit={handlePasswordSubmit} className="space-y-6 bg-white dark:bg-gray-800 rounded-xl shadow p-6">
          <h2 className="text-lg font-semibold mb-2">{user?.has_password ? 'Change Password' : 'Set Password'}</h2>
          {user?.has_password && (
            <div className="grid gap-2">
              <Label htmlFor="current_password">Current Password</Label>
              <Input
                id="current_password"
                type="password"
                value={passwords.current_password}
                onChange={e => setPasswords({ ...passwords, current_password: e.target.value })}
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
              onChange={e => setPasswords({ ...passwords, password: e.target.value })}
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
              onChange={e => setPasswords({ ...passwords, password_confirmation: e.target.value })}
              required
              autoComplete="new-password"
              placeholder="Confirm new password"
            />
          </div>
          {passwordError && <InputError className="mt-2" message={passwordError} />}
          <div className="flex items-center gap-4">
            <Button className="bg-[#7e246c] text-white hover:bg-[#6a1f5c] cursor-pointer" disabled={passwordLoading}>Change Password</Button>
            {passwordSuccess && <span className="text-green-600 text-sm">Password updated!</span>}
          </div>
        </form>
      </div>
    </div>
  );
}

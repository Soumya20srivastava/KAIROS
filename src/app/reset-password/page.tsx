// Reset Password Page
'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { authService } from '@/services/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Link from 'next/link';
import { Lock, CheckCircle, AlertCircle, Eye, EyeOff, ArrowLeft } from 'lucide-react';
import { getApiError } from '@/lib/utils';

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [tokenValid, setTokenValid] = useState(true);

  useEffect(() => {
    const token = searchParams.get('access_token');
    if (!token) {
      setTokenValid(false);
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      await authService.resetPassword(password);
      setSuccess(true);
      setTimeout(() => {
        router.push('/login');
      }, 2000);
    } catch (err: unknown) {
      setError(getApiError(err));
      setLoading(false);
    }
  };

  if (!tokenValid) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-md text-center">
          <div className="nerv-panel p-6">
            <div className="flex items-center gap-2 rounded-md bg-destructive/10 border border-destructive/30 p-3 text-sm text-destructive mb-4">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              <span>Invalid or expired reset token</span>
            </div>
            <Link href="/forgot-password">
              <Button variant="primary" className="w-full">
                Request New Reset Link
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-secondary mb-4">
            <span className="font-orbitron text-3xl font-bold text-primary-foreground">K</span>
          </div>
          <h1 className="font-orbitron text-3xl font-bold tracking-wider text-foreground">
            KAIROS
          </h1>
        </div>

        <div className="nerv-panel p-6">
          <h2 className="text-xl font-orbitron font-semibold text-foreground mb-1">
            Set New Password
          </h2>
          <p className="text-sm text-muted-foreground mb-6">
            Enter your new password below
          </p>

          {success && (
            <div className="flex items-center gap-2 rounded-md bg-green-500/10 border border-green-500/30 p-3 text-sm text-green-400 mb-4">
              <CheckCircle className="h-4 w-4 flex-shrink-0" />
              <span>Password reset successfully! Redirecting...</span>
            </div>
          )}

          {error && (
            <div className="flex items-center gap-2 rounded-md bg-destructive/10 border border-destructive/30 p-3 text-sm text-destructive mb-4">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              id="password"
              type={showPassword ? 'text' : 'password'}
              label="New Password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              icon={
                showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )
              }
              iconPosition="right"
              onIconClick={() => setShowPassword(!showPassword)}
              className="cursor-pointer"
              required
              disabled={success}
            />

            <Input
              id="confirmPassword"
              type={showPassword ? 'text' : 'password'}
              label="Confirm Password"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              icon={<Lock className="h-4 w-4" />}
              required
              disabled={success}
            />

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full"
              loading={loading}
              disabled={success}
            >
              Reset Password
            </Button>
          </form>

          <div className="mt-6 text-center">
            <Link href="/login" className="text-sm text-primary hover:underline flex items-center justify-center">
              <ArrowLeft className="mr-1 h-4 w-4" />
              Back to Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center p-4 text-sm text-muted-foreground">Loading...</div>}>
      <ResetPasswordForm />
    </Suspense>
  );
}
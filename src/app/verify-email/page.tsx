// Verify Email Page
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { authService } from '@/services/auth';
import { Button } from '@/components/ui/button';
import { Mail, RefreshCw, CheckCircle, AlertCircle, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useAuthStore } from '@/stores/auth';
import { getApiError } from '@/lib/utils';

export default function VerifyEmailPage() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleResend = async () => {
    if (!user?.email) {
      setError('No email address found');
      return;
    }

    setResending(true);
    setError(null);

    try {
      await authService.resendVerification(user.email);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: unknown) {
      setError(getApiError(err));
    } finally {
      setResending(false);
    }
  };

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

        <div className="nerv-panel p-6 text-center">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 mb-4">
            <Mail className="h-8 w-8 text-primary" />
          </div>

          <h2 className="text-xl font-orbitron font-semibold text-foreground mb-2">
            Verify Your Email
          </h2>
          <p className="text-sm text-muted-foreground mb-6">
            We sent a verification link to{' '}
            <span className="text-foreground font-medium">{user?.email || 'your email'}</span>.
            Check your inbox and click the link to verify your account.
          </p>

          {error && (
            <div className="flex items-center gap-2 rounded-md bg-destructive/10 border border-destructive/30 p-3 text-sm text-destructive mb-4">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="flex items-center gap-2 rounded-md bg-green-500/10 border border-green-500/30 p-3 text-sm text-green-400 mb-4">
              <CheckCircle className="h-4 w-4 flex-shrink-0" />
              <span>Verification email sent!</span>
            </div>
          )}

          <div className="space-y-3">
            <Button
              variant="primary"
              size="lg"
              className="w-full"
              loading={resending}
              onClick={handleResend}
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Resend Verification Email
            </Button>

            <Button
              variant="ghost"
              size="lg"
              className="w-full"
              onClick={() => router.push('/dashboard')}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Continue to Dashboard
            </Button>
          </div>

          <p className="mt-6 text-xs text-muted-foreground">
            Already verified?{' '}
            <Link href="/login" className="text-primary hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
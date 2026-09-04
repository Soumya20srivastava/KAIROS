// Forgot Password Page
'use client';

import { useState } from 'react';
import { authService } from '@/services/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Link from 'next/link';
import { Mail, CheckCircle, ArrowLeft, AlertCircle } from 'lucide-react';
import { getApiError } from '@/lib/utils';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await authService.forgotPassword(email);
      setSent(true);
    } catch (err: unknown) {
      setError(getApiError(err));
      setLoading(false);
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

        <div className="nerv-panel p-6">
          <h2 className="text-xl font-orbitron font-semibold text-foreground mb-1">
            Reset Password
          </h2>
          <p className="text-sm text-muted-foreground mb-6">
            Enter your email to receive a password reset link
          </p>

          {sent && (
            <div className="flex items-center gap-2 rounded-md bg-green-500/10 border border-green-500/30 p-3 text-sm text-green-400 mb-4">
              <CheckCircle className="h-4 w-4 flex-shrink-0" />
              <span>Check your email for the reset link.</span>
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
              id="email"
              type="email"
              label="Email"
              placeholder="operator@kairos.io"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              icon={<Mail className="h-4 w-4" />}
              required
              disabled={sent}
            />

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full"
              loading={loading}
              disabled={sent}
            >
              Send Reset Link
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
// Register Page
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/auth';
import { authService } from '@/services/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Link from 'next/link';
import { User, Mail, Lock, AlertCircle, CheckCircle } from 'lucide-react';
import { getApiError, isValidEmail, isValidUsername } from '@/lib/utils';

export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const user = useAuthStore((state) => state.user);

  useEffect(() => {
    if (user) {
      router.push('/dashboard');
    }
  }, [user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!isValidEmail(email)) {
      setError('Please enter a valid email address');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    if (!isValidUsername(username)) {
      setError('Username must be 3-30 alphanumeric characters or underscores');
      return;
    }

    setLoading(true);

    try {
      const result = await authService.register(email, password, username);

      if (result.access_token && result.refresh_token && result.user) {
        useAuthStore.getState().setSession(result);
      } else if (result.user) {
        useAuthStore.getState().setUser(result.user);
      }

      setSuccess(true);
      setTimeout(() => {
        router.push('/verify-email');
      }, 1800);
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
          <p className="mt-2 text-sm text-muted-foreground font-techno tracking-wider">
            AUTOMATION PLATFORM
          </p>
        </div>

        <div className="nerv-panel p-6">
          <h2 className="text-xl font-orbitron font-semibold text-foreground mb-1">
            Create Account
          </h2>
          <p className="text-sm text-muted-foreground mb-6">
            Register to start automating with KAIROS
          </p>

          {success && (
            <div className="flex items-center gap-2 rounded-md bg-green-500/10 border border-green-500/30 p-3 text-sm text-green-400 mb-4">
              <CheckCircle className="h-4 w-4 flex-shrink-0" />
              <span>Account created! Please check your email to verify.</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              id="username"
              type="text"
              label="Username"
              placeholder="operator_kairos"
              value={username}
              onChange={(e) => setUsername(e.target.value.toLowerCase())}
              icon={<User className="h-4 w-4" />}
              required
              disabled={loading || success}
            />

            <Input
              id="email"
              type="email"
              label="Email"
              placeholder="operator@kairos.io"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              icon={<Mail className="h-4 w-4" />}
              required
              disabled={loading || success}
            />

            <Input
              id="password"
              type="password"
              label="Password"
              placeholder="•••••••• (min 6 chars)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              icon={<Lock className="h-4 w-4" />}
              required
              disabled={loading || success}
            />

            {error && (
              <div className="flex items-center gap-2 rounded-md bg-destructive/10 border border-destructive/30 p-3 text-sm text-destructive">
                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full"
              loading={loading}
              disabled={success}
            >
              {success ? 'Verifying...' : 'Create Account'}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              Already have an account?{' '}
              <Link href="/login" className="text-primary hover:underline font-medium">
                Sign in
              </Link>
            </p>
          </div>
        </div>

        <p className="mt-6 text-center text-[10px] font-techno text-muted-foreground">
          NERV SYSTEMS © 2026 — ALL RIGHTS RESERVED
        </p>
      </div>
    </div>
  );
}
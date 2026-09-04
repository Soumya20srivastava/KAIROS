// Login Page
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/auth';
import { authService } from '@/services/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Link from 'next/link';
import { Mail, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { getApiError } from '@/lib/utils';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const user = useAuthStore((state) => state.user);

  useEffect(() => {
    if (user) {
      router.push('/dashboard');
    }
  }, [user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const session = await authService.login(email, password);
      useAuthStore.getState().setSession(session);
      router.push('/dashboard');
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
            Welcome Back
          </h2>
          <p className="text-sm text-muted-foreground mb-6">
            Sign in to your KAIROS account
          </p>

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
              disabled={loading}
            />

            <Input
              id="password"
              type={showPassword ? 'text' : 'password'}
              label="Password"
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
              disabled={loading}
            />

            {error && (
              <div className="flex items-center gap-2 rounded-md bg-destructive/10 border border-destructive/30 p-3 text-sm text-destructive">
                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="flex items-center justify-between">
              <Link
                href="/forgot-password"
                className="text-xs text-primary hover:underline"
              >
                Forgot password?
              </Link>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full"
              loading={loading}
            >
              Sign In
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              Don't have an account?{' '}
              <Link href="/register" className="text-primary hover:underline font-medium">
                Create one
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
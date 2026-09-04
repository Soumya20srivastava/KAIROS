'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Play, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { databaseService } from '@/services/database';
import { useAuthStore } from '@/stores/auth';
import { createAgentEngine } from '@/services/agent-engine';
import { getApiError } from '@/lib/utils';

export default function NewRunPage() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const [title, setTitle] = useState('');
  const [objective, setObjective] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!user) return null;

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    if (!title.trim() || !objective.trim()) {
      setError('Run name and objective details are required');
      return;
    }

    setLoading(true);

    try {
      const createdObjective = await databaseService.createObjective({
        user_id: user.id,
        title: title.trim(),
        description: objective.trim(),
        priority: 3,
        status: 'active',
      });

      const engine = createAgentEngine(user.id);
      const result = await engine.executeObjective({
        ...createdObjective,
        user_id: user.id,
        title: createdObjective.title,
        description: createdObjective.description,
        status: 'active',
        priority: 3,
        metadata: createdObjective.metadata || {},
        created_at: createdObjective.created_at,
        updated_at: createdObjective.updated_at,
      });

      if (result.runId) {
        router.push(`/runs/${result.runId}`);
        return;
      }

      router.push('/runs');
    } catch (err: unknown) {
      setError(getApiError(err));
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/runs">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="font-orbitron text-3xl font-bold tracking-tight text-foreground">
            New Run
          </h1>
          <p className="mt-1 text-sm text-muted-foreground font-techno tracking-wider">
            START A NEW AGENT EXECUTION
          </p>
        </div>
      </div>

      <Card className="max-w-2xl p-6">
        <form onSubmit={handleSubmit} className="space-y-5">
          <Input
            id="title"
            label="Run Name"
            placeholder="e.g. Dependency audit"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            icon={<Zap className="h-4 w-4" />}
            required
            disabled={loading}
          />

          <div>
            <label htmlFor="objective" className="mb-1.5 block text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Objective
            </label>
            <textarea
              id="objective"
              value={objective}
              onChange={(e) => setObjective(e.target.value)}
              rows={6}
              placeholder="Describe what the agent should do during this run."
              className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
              disabled={loading}
            />
          </div>

          {error && (
            <div className="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
              {error}
            </div>
          )}

          <div className="flex items-center gap-3 pt-2">
            <Button type="submit" variant="primary" loading={loading}>
              <Play className="mr-2 h-4 w-4" />
              Start Run
            </Button>
            <Button type="button" variant="outline" asChild>
              <Link href="/runs">Cancel</Link>
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}

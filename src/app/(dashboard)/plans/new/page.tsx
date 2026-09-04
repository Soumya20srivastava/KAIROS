'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Save, Target } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { databaseService } from '@/services/database';
import { useAuthStore } from '@/stores/auth';
import { getApiError } from '@/lib/utils';

export default function NewObjectivePage() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('3');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!user) return null;

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    if (!title.trim()) {
      setError('Objective title is required');
      return;
    }

    setLoading(true);

    try {
      await databaseService.createObjective({
        user_id: user.id,
        title: title.trim(),
        description: description.trim() || null,
        priority: Number(priority) || 3,
        status: 'active',
      });

      router.push('/plans');
    } catch (err: unknown) {
      setError(getApiError(err));
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/plans">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="font-orbitron text-3xl font-bold tracking-tight text-foreground">
            New Objective
          </h1>
          <p className="mt-1 text-sm text-muted-foreground font-techno tracking-wider">
            CREATE A NEW AUTOMATION GOAL
          </p>
        </div>
      </div>

      <Card className="max-w-2xl p-6">
        <form onSubmit={handleSubmit} className="space-y-5">
          <Input
            id="title"
            label="Objective Title"
            placeholder="e.g. Audit deployment pipeline"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            icon={<Target className="h-4 w-4" />}
            required
            disabled={loading}
          />

          <div>
            <label htmlFor="description" className="mb-1.5 block text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Description
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={6}
              placeholder="Describe the outcome, constraints, and deliverables for this objective."
              className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
              disabled={loading}
            />
          </div>

          <div>
            <label htmlFor="priority" className="mb-1.5 block text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Priority
            </label>
            <select
              id="priority"
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              className="flex h-10 w-full appearance-none rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              disabled={loading}
            >
              <option value="1">Critical</option>
              <option value="2">High</option>
              <option value="3">Medium</option>
              <option value="4">Low</option>
              <option value="5">Trivial</option>
            </select>
          </div>

          {error && (
            <div className="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
              {error}
            </div>
          )}

          <div className="flex items-center gap-3 pt-2">
            <Button type="submit" variant="primary" loading={loading}>
              <Save className="mr-2 h-4 w-4" />
              Save Objective
            </Button>
            <Button type="button" variant="outline" asChild>
              <Link href="/plans">Cancel</Link>
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}

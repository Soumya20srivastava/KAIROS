'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Loader2, Play, CheckCircle2, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { databaseService } from '@/services/database';
import { useAuthStore } from '@/stores/auth';
import { formatRelativeTime } from '@/lib/utils';
import type { AgentRun } from '@/types';

export default function RunDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const [run, setRun] = useState<AgentRun | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      if (!user || !params?.id) return;

      try {
        setLoading(true);
        const runData = await databaseService.getAgentRun(params.id);
        setRun(runData);
      } catch (error) {
        console.error('Failed to load run details:', error);
        router.push('/runs');
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [user, params, router]);

  if (!user) return null;

  if (loading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/runs"><ArrowLeft className="h-4 w-4" /></Link>
          </Button>
        </div>
        <Card className="p-6">
          <div className="flex items-center gap-3 text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span>Loading run…</span>
          </div>
        </Card>
      </div>
    );
  }

  if (!run) {
    return null;
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/runs"><ArrowLeft className="h-4 w-4" /></Link>
          </Button>
          <div>
            <h1 className="font-orbitron text-3xl font-bold tracking-tight text-foreground">{run.run_name}</h1>
            <p className="mt-1 text-sm text-muted-foreground font-techno tracking-wider">AGENT RUN DETAIL</p>
          </div>
        </div>
        <Badge status={run.status} variant="status">{run.status}</Badge>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
              {run.status === 'completed' ? <CheckCircle2 className="h-5 w-5 text-green-400" /> : run.status === 'failed' ? <AlertTriangle className="h-5 w-5 text-red-400" /> : <Play className="h-5 w-5 text-cyan-400" />}
            </div>
            <div>
              <h2 className="font-orbitron text-lg font-semibold text-foreground">Objective</h2>
            </div>
          </div>
          <p className="text-sm leading-6 text-muted-foreground">{run.objective}</p>

          <div className="mt-6 grid grid-cols-2 gap-3 text-sm text-muted-foreground">
            <div>
              <span className="block text-[10px] font-techno uppercase tracking-wider">Model</span>
              <span className="text-foreground">{run.model}</span>
            </div>
            <div>
              <span className="block text-[10px] font-techno uppercase tracking-wider">Steps</span>
              <span className="text-foreground">{run.completed_steps}/{run.total_steps}</span>
            </div>
            <div>
              <span className="block text-[10px] font-techno uppercase tracking-wider">Created</span>
              <span className="text-foreground">{formatRelativeTime(run.created_at)}</span>
            </div>
            <div>
              <span className="block text-[10px] font-techno uppercase tracking-wider">Started</span>
              <span className="text-foreground">{run.started_at ? formatRelativeTime(run.started_at) : '—'}</span>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="font-orbitron text-lg font-semibold text-foreground mb-4">Run metadata</h3>
          <div className="space-y-3 text-sm text-muted-foreground">
            <div className="flex items-center justify-between gap-4">
              <span>Status</span>
              <Badge status={run.status} variant="status" size="sm">{run.status}</Badge>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span>Tool calls</span>
              <span className="text-foreground">{run.tool_calls.length}</span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span>Failures</span>
              <span className="text-foreground">{run.failed_steps}</span>
            </div>
          </div>
        </Card>
      </div>

      <Card className="p-6">
        <h3 className="font-orbitron text-lg font-semibold text-foreground mb-3">Result</h3>
        {run.error ? (
          <div className="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">{run.error}</div>
        ) : (
          <pre className="overflow-x-auto rounded-md bg-background/60 p-3 text-xs text-foreground">{JSON.stringify(run.result || { status: 'No result recorded yet' }, null, 2)}</pre>
        )}
      </Card>
    </div>
  );
}

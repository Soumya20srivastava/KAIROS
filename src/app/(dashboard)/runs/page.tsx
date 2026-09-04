// Agent Runs Page
'use client';

import { useEffect, useState } from 'react';
import { databaseService } from '@/services/database';
import { useAuthStore } from '@/stores/auth';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Link from 'next/link';
import { cn, formatRelativeTime, formatDuration } from '@/lib/utils';
import {
  Plus,
  Search,
  Filter,
  Play,
  Zap,
  Clock,
  CheckCircle,
  AlertCircle,
  XCircle,
  ArrowRight,
  MoreVertical,
} from 'lucide-react';
import type { AgentRun } from '@/types';

export default function RunsPage() {
  const user = useAuthStore((state) => state.user);
  const [runs, setRuns] = useState<AgentRun[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'pending' | 'running' | 'completed' | 'failed' | 'cancelled'>('all');

  useEffect(() => {
    async function fetchRuns() {
      if (!user) return;
      try {
        setLoading(true);
        const data = await databaseService.getAgentRuns(user.id);
        setRuns(data);
      } catch (err) {
        console.error('Failed to fetch runs:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchRuns();
  }, [user]);

  const filteredRuns = runs
    .filter((r) => filter === 'all' || r.status === filter)
    .filter((r) =>
      r.run_name.toLowerCase().includes(search.toLowerCase()) ||
      r.objective.toLowerCase().includes(search.toLowerCase())
    );

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4 text-green-400" />;
      case 'running': return <Play className="h-4 w-4 text-cyan-400 animate-spin" />;
      case 'pending': return <Clock className="h-4 w-4 text-yellow-400" />;
      case 'failed': return <AlertCircle className="h-4 w-4 text-red-400" />;
      case 'cancelled': return <XCircle className="h-4 w-4 text-gray-400" />;
      default: return <Zap className="h-4 w-4 text-muted-foreground" />;
    }
  };

  if (!user) return null;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-orbitron text-3xl font-bold tracking-tight text-foreground">
            Agent Runs
          </h1>
          <p className="mt-1 text-sm text-muted-foreground font-techno tracking-wider">
            {runs.length} RUNS — {runs.filter(r => r.status === 'running').length} RUNNING
          </p>
        </div>
        <Button variant="primary" asChild>
          <Link href="/runs/new">
            <Plus className="mr-2 h-4 w-4" />
            New Run
          </Link>
        </Button>
      </div>

      <Card className="p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search runs..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as typeof filter)}
              className="flex h-10 w-full appearance-none rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="running">Running</option>
              <option value="completed">Completed</option>
              <option value="failed">Failed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>
      </Card>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <div className="h-4 w-1/3 bg-muted rounded mb-2" />
              <div className="h-3 w-full bg-muted rounded" />
            </Card>
          ))}
        </div>
      ) : filteredRuns.length === 0 ? (
        <Card className="text-center py-12">
          <Zap className="h-16 w-16 mx-auto text-muted-foreground/30 mb-4" />
          <h3 className="font-orbitron text-lg font-semibold text-foreground mb-2">
            No agent runs
          </h3>
          <p className="text-sm text-muted-foreground mb-4">
            {search || filter !== 'all'
              ? 'Try adjusting your search or filter'
              : 'Start your first agent run to automate tasks'}
          </p>
          <Button variant="primary" asChild>
            <Link href="/runs/new">
              <Plus className="mr-2 h-4 w-4" />
              Start Run
            </Link>
          </Button>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredRuns.map((run) => (
            <Card key={run.id} className="relative overflow-hidden">
              <div
                className="absolute top-0 left-0 right-0 h-1"
                style={{
                  background: `linear-gradient(90deg, transparent, ${cn(
                    run.status === 'completed' && 'hsl(var(--neon-green))',
                    run.status === 'running' && 'hsl(var(--neon-cyan))',
                    run.status === 'failed' && 'hsl(var(--neon-red))',
                    run.status === 'pending' && 'hsl(var(--neon-amber))',
                    'hsl(var(--muted-foreground))'
                  )}, transparent)`
                }}
              />
              <div className="flex items-start justify-between p-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className={cn(
                      'flex h-6 w-6 items-center justify-center rounded-full',
                      run.status === 'completed' && 'bg-green-500/20',
                      run.status === 'running' && 'bg-cyan-500/20',
                      run.status === 'failed' && 'bg-red-500/20',
                      run.status === 'pending' && 'bg-yellow-500/20',
                      run.status === 'cancelled' && 'bg-gray-500/20'
                    )}>
                      {getStatusIcon(run.status)}
                    </span>
                    <h3 className="font-orbitron text-lg font-semibold text-foreground">
                      {run.run_name}
                    </h3>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2 line-clamp-1">
                    {run.objective}
                  </p>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {run.completed_at ? formatDuration(
                        new Date(run.completed_at).getTime() - new Date(run.started_at ?? run.created_at).getTime()
                      ) : '—'}
                    </span>
                    <span className="flex items-center gap-1">
                      <Zap className="h-3 w-3" />
                      {run.completed_steps}/{run.total_steps} steps
                    </span>
                    <span>{formatRelativeTime(run.created_at)}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="text-right hidden sm:block">
                    <Badge status={run.status} variant="status">{run.status}</Badge>
                  </div>
                  <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div className="px-4 pb-4 border-t border-border flex items-center justify-between">
                <Button variant="ghost" size="sm" asChild>
                  <Link href={`/runs/${run.id}`}>
                    View Details <ArrowRight className="ml-1 h-3 w-3" />
                  </Link>
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
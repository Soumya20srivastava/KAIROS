// Evaluations Page
'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  BarChart3,
  Target,
  Award,
  Clock,
  Zap,
  Plus,
  Search,
  Filter,
  MoreVertical,
  Download,
} from 'lucide-react';

const evaluations = [
  {
    id: 'eval_1',
    name: 'Objective Completion Rate',
    type: 'Automated',
    status: 'completed',
    score: 87,
    runs: 42,
    lastRun: '2 hours ago',
  },
  {
    id: 'eval_2',
    name: 'Tool Execution Accuracy',
    type: 'Automated',
    status: 'completed',
    score: 94,
    runs: 42,
    lastRun: '2 hours ago',
  },
  {
    id: 'eval_3',
    name: 'Plan Quality Assessment',
    type: 'Manual',
    status: 'pending',
    score: null,
    runs: 12,
    lastRun: '1 day ago',
  },
  {
    id: 'eval_4',
    name: 'Decision Confidence',
    type: 'Automated',
    status: 'running',
    score: null,
    runs: 28,
    lastRun: '5 minutes ago',
  },
  {
    id: 'eval_5',
    name: 'Error Recovery Rate',
    type: 'Automated',
    status: 'completed',
    score: 76,
    runs: 15,
    lastRun: '3 hours ago',
  },
];

export default function EvaluationsPage() {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'automated' | 'manual'>('all');

  const filteredEvaluations = evaluations
    .filter((e) => filter === 'all' || e.type.toLowerCase() === filter)
    .filter((e) =>
      e.name.toLowerCase().includes(search.toLowerCase())
    );

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-orbitron text-3xl font-bold tracking-tight text-foreground">
            Evaluations
          </h1>
          <p className="mt-1 text-sm text-muted-foreground font-techno tracking-wider">
            {evaluations.length} EVALUATIONS — {evaluations.filter(e => e.status === 'completed').length} COMPLETED
          </p>
        </div>
        <Button variant="primary">
          <Plus className="mr-2 h-4 w-4" />
          New Evaluation
        </Button>
      </div>

      {/* Summary Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-techno text-muted-foreground tracking-wider">AVG SCORE</p>
              <p className="font-orbitron text-3xl font-bold text-cyan-400">
                {Math.round(evaluations.filter(e => e.score !== null).reduce((a, b) => a + (b.score || 0), 0) / evaluations.filter(e => e.score !== null).length)}%
              </p>
            </div>
            <Target className="h-10 w-10 text-cyan-400/30" />
          </div>
        </Card>
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-techno text-muted-foreground tracking-wider">TOTAL RUNS</p>
              <p className="font-orbitron text-3xl font-bold text-primary">
                {evaluations.reduce((a, b) => a + b.runs, 0)}
              </p>
            </div>
            <Zap className="h-10 w-10 text-primary/30" />
          </div>
        </Card>
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-techno text-muted-foreground tracking-wider">COMPLETED</p>
              <p className="font-orbitron text-3xl font-bold text-green-400">
                {evaluations.filter(e => e.status === 'completed').length}
              </p>
            </div>
            <Award className="h-10 w-10 text-green-400/30" />
          </div>
        </Card>
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-techno text-muted-foreground tracking-wider">IN PROGRESS</p>
              <p className="font-orbitron text-3xl font-bold text-yellow-400">
                {evaluations.filter(e => e.status === 'running' || e.status === 'pending').length}
              </p>
            </div>
            <Clock className="h-10 w-10 text-yellow-400/30" />
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search evaluations..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex h-10 w-full rounded-md border border-input bg-background pl-10 pr-4 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as typeof filter)}
              className="flex h-10 w-full appearance-none rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <option value="all">All Types</option>
              <option value="automated">Automated</option>
              <option value="manual">Manual</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Evaluations List */}
      <div className="space-y-3">
        {filteredEvaluations.map((evaluation) => (
          <Card key={evaluation.id} className="relative overflow-hidden">
            <div
              className="absolute top-0 left-0 right-0 h-1"
              style={{
                background: `linear-gradient(90deg, transparent, ${evaluation.status === 'completed' ? 'hsl(var(--neon-green))' : evaluation.status === 'running' ? 'hsl(var(--neon-cyan))' : 'hsl(var(--neon-amber))'}, transparent)`
              }}
            />
            <div className="flex items-center justify-between p-4">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                  <BarChart3 className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-orbitron font-semibold text-foreground">{evaluation.name}</h3>
                  <p className="text-sm text-muted-foreground">{evaluation.type} Evaluation</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right hidden md:block">
                  <Badge
                    status={evaluation.status === 'completed' ? 'completed' : evaluation.status === 'running' ? 'running' : 'pending'}
                    variant="status"
                  >
                    {evaluation.status === 'completed' ? 'Completed' : evaluation.status === 'running' ? 'Running' : 'Pending'}
                  </Badge>
                </div>
                <div className="text-right hidden lg:block">
                  {evaluation.score !== null ? (
                    <span className="font-orbitron text-2xl font-bold text-primary">{evaluation.score}%</span>
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </div>
                <div className="text-right hidden lg:block">
                  <p className="text-xs font-techno text-muted-foreground">{evaluation.runs} runs</p>
                  <p className="text-[10px] font-techno text-muted-foreground">{evaluation.lastRun}</p>
                </div>
                <Button variant="ghost" size="icon">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="px-4 pb-4 border-t border-border flex items-center justify-between">
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Zap className="h-3 w-3" />
                  {evaluation.runs} executions
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  Last: {evaluation.lastRun}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm">
                  <Download className="mr-1 h-3 w-3" />
                  Report
                </Button>
                <Button variant="outline" size="sm">View</Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
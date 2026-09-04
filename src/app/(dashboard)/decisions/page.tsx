// Decisions Page
'use client';

import { useEffect, useState } from 'react';
import { databaseService } from '@/services/database';
import { useAuthStore } from '@/stores/auth';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatRelativeTime } from '@/lib/utils';
import { Filter, Search, Brain } from 'lucide-react';
import type { Decision } from '@/types';

export default function DecisionsPage() {
  const user = useAuthStore((state) => state.user);
  const [decisions, setDecisions] = useState<Decision[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => {
    async function fetchDecisions() {
      if (!user) return;
      try {
        setLoading(true);
        const data = await databaseService.getDecisions(user.id);
        setDecisions(data);
      } catch (err) {
        console.error('Failed to fetch decisions:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchDecisions();
  }, [user]);

  const decisionTypes = [...new Set(decisions.map(d => d.decision_type))];

  const filteredDecisions = decisions
    .filter((d) => filter === 'all' || d.decision_type === filter)
    .filter((d) =>
      d.reasoning?.toLowerCase().includes(search.toLowerCase()) ||
      JSON.stringify(d.chosen_option).toLowerCase().includes(search.toLowerCase())
    );

  if (!user) return null;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-orbitron text-3xl font-bold tracking-tight text-foreground">
            Decisions
          </h1>
          <p className="mt-1 text-sm text-muted-foreground font-techno tracking-wider">
            {decisions.length} DECISIONS RECORDED
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Brain className="h-5 w-5 text-muted-foreground" />
        </div>
      </div>

      <Card className="p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search decisions..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-10 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="flex h-10 w-full appearance-none rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <option value="all">All Types</option>
              {decisionTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>
        </div>
      </Card>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <div className="h-4 w-1/4 bg-muted rounded mb-2" />
              <div className="h-3 w-full bg-muted rounded" />
            </Card>
          ))}
        </div>
      ) : filteredDecisions.length === 0 ? (
        <Card className="text-center py-12">
          <Brain className="h-16 w-16 mx-auto text-muted-foreground/30 mb-4" />
          <h3 className="font-orbitron text-lg font-semibold text-foreground mb-2">
            No decisions recorded
          </h3>
          <p className="text-sm text-muted-foreground">
            Decisions made during agent runs will appear here
          </p>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredDecisions.map((decision) => (
            <Card key={decision.id}>
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="outline" size="sm">
                      <Brain className="mr-1 h-3 w-3" />
                      {decision.decision_type}
                    </Badge>
                    <span className="text-xs font-techno text-muted-foreground">
                      {formatRelativeTime(decision.created_at)}
                    </span>
                  </div>
                  <p className="text-sm text-foreground mb-2">
                    {decision.reasoning || 'No reasoning recorded'}
                  </p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    {decision.confidence_score !== null && (
                      <span>Confidence: {(decision.confidence_score * 100).toFixed(0)}%</span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="text-right">
                    <p className="font-mono text-xs text-primary">
                      {JSON.stringify(decision.chosen_option).slice(0, 50)}...
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
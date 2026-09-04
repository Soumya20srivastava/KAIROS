// Plans Page
'use client';

import { useEffect, useState } from 'react';
import { databaseService } from '@/services/database';
import { useAuthStore } from '@/stores/auth';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Link from 'next/link';
import { formatRelativeTime, getStatusColor } from '@/lib/utils';
import {
  Plus,
  Search,
  Filter,
  FileText,
  Target,
  ArrowRight,
  MoreVertical,
} from 'lucide-react';
import type { Plan } from '@/types';

export default function PlansPage() {
  const user = useAuthStore((state) => state.user);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'draft' | 'active' | 'completed' | 'failed'>('all');

  useEffect(() => {
    async function fetchPlans() {
      if (!user) return;
      try {
        setLoading(true);
        const data = await databaseService.getPlans(user.id);
        setPlans(data);
      } catch (err: unknown) {
        console.error('Failed to fetch plans:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchPlans();
  }, [user]);

  const filteredPlans = plans
    .filter((p) => filter === 'all' || p.status === filter)
    .filter((p) =>
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.description?.toLowerCase().includes(search.toLowerCase())
    );

  if (!user) return null;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-orbitron text-3xl font-bold tracking-tight text-foreground">
            Plans
          </h1>
          <p className="mt-1 text-sm text-muted-foreground font-techno tracking-wider">
            {plans.length} PLANS — {plans.filter(p => p.status === 'active').length} ACTIVE
          </p>
        </div>
        <Button variant="primary" asChild>
          <Link href="/plans/new">
            <Plus className="mr-2 h-4 w-4" />
            New Plan
          </Link>
        </Button>
      </div>

      {/* Search and Filter */}
      <Card className="p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search plans..."
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
              <option value="draft">Draft</option>
              <option value="active">Active</option>
              <option value="completed">Completed</option>
              <option value="failed">Failed</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Plans Grid */}
      {loading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} className="animate-pulse">
              <div className="h-4 w-3/4 bg-muted rounded mb-2" />
              <div className="h-3 w-full bg-muted rounded" />
              <div className="h-3 w-2/3 bg-muted rounded mt-1" />
            </Card>
          ))}
        </div>
      ) : filteredPlans.length === 0 ? (
        <Card className="text-center py-12">
          <FileText className="h-16 w-16 mx-auto text-muted-foreground/30 mb-4" />
          <h3 className="font-orbitron text-lg font-semibold text-foreground mb-2">
            No plans found
          </h3>
          <p className="text-sm text-muted-foreground mb-4">
            {search || filter !== 'all'
              ? 'Try adjusting your search or filter'
              : 'Create your first plan to get started'}
          </p>
          <Button variant="primary" asChild>
            <Link href="/plans/new">
              <Plus className="mr-2 h-4 w-4" />
              Create Plan
            </Link>
          </Button>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredPlans.map((plan) => (
            <Card key={plan.id} className="relative overflow-hidden">
              <div
                className="absolute top-0 left-0 right-0 h-1"
                style={{ background: `linear-gradient(90deg, transparent, ${getStatusColor(plan.status)}, transparent)` }}
              />
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge status={plan.status} variant="status" size="sm">{plan.status}</Badge>
                    {plan.objective_id && (
                      <Badge variant="outline" size="sm">
                        <Target className="mr-1 h-3 w-3" />
                        Objective
                      </Badge>
                    )}
                  </div>
                  <h3 className="font-orbitron text-lg font-semibold text-foreground mb-1">
                    {plan.title}
                  </h3>
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                    {plan.description || 'No description'}
                  </p>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span>{plan.steps?.length || 0} steps</span>
                    <span>{formatRelativeTime(plan.created_at)}</span>
                  </div>
                </div>
                <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </div>
              <div className="mt-4 pt-4 border-t border-border flex items-center justify-between">
                <Button variant="ghost" size="sm" asChild>
                  <Link href={`/plans/${plan.id}`}>
                    View <ArrowRight className="ml-1 h-3 w-3" />
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
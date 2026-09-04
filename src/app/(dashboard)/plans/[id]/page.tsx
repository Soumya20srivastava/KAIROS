'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, CheckCircle2, FileText, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { databaseService } from '@/services/database';
import { useAuthStore } from '@/stores/auth';
import { formatRelativeTime } from '@/lib/utils';
import type { Objective, Plan } from '@/types';

export default function ObjectiveDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const [objective, setObjective] = useState<Objective | null>(null);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      if (!user || !params?.id) return;

      try {
        setLoading(true);
        const [objectiveData, planData] = await Promise.all([
          databaseService.getObjective(params.id),
          databaseService.getPlans(user.id).then((items) => items.filter((plan) => plan.objective_id === params.id)),
        ]);

        setObjective(objectiveData);
        setPlans(planData);
      } catch (error) {
        console.error('Failed to load objective details:', error);
        router.push('/plans');
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
            <Link href="/plans"><ArrowLeft className="h-4 w-4" /></Link>
          </Button>
        </div>
        <Card className="p-6">
          <div className="flex items-center gap-3 text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span>Loading objective…</span>
          </div>
        </Card>
      </div>
    );
  }

  if (!objective) {
    return null;
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/plans"><ArrowLeft className="h-4 w-4" /></Link>
          </Button>
          <div>
            <h1 className="font-orbitron text-3xl font-bold tracking-tight text-foreground">{objective.title}</h1>
            <p className="mt-1 text-sm text-muted-foreground font-techno tracking-wider">OBJECTIVE DETAIL</p>
          </div>
        </div>
        <Badge status={objective.status} variant="status">{objective.status}</Badge>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.4fr_0.8fr]">
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <FileText className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h2 className="font-orbitron text-lg font-semibold text-foreground">Objective Summary</h2>
            </div>
          </div>

          <p className="text-sm leading-6 text-muted-foreground">
            {objective.description || 'No description provided.'}
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
            <span>Priority: {objective.priority}</span>
            <span>Created {formatRelativeTime(objective.created_at)}</span>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="font-orbitron text-lg font-semibold text-foreground mb-4">Related Plans</h3>
          {plans.length === 0 ? (
            <div className="text-sm text-muted-foreground">No plans linked to this objective yet.</div>
          ) : (
            <div className="space-y-3">
              {plans.map((plan) => (
                <div key={plan.id} className="rounded-md border border-border p-3 bg-muted/20">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-medium text-foreground">{plan.title}</span>
                    <Badge status={plan.status} variant="status" size="sm">{plan.status}</Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <CheckCircle2 className="h-5 w-5 text-green-400" />
          <h3 className="font-orbitron text-lg font-semibold text-foreground">Objective Status</h3>
        </div>
        <p className="text-sm text-muted-foreground">This objective is tracked and can be used to create new plans and runs.</p>
      </Card>
    </div>
  );
}

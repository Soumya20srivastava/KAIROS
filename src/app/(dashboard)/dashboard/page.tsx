// Dashboard Page
'use client';

import { useEffect, useState } from 'react';
import { databaseService } from '@/services/database';
import { useAuthStore } from '@/stores/auth';
import { StatCard } from '@/components/ui/stat-card';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { formatRelativeTime } from '@/lib/utils';
import {
  Target,
  FileText,
  Play,
  Zap,
  Activity,
  Settings,
  Plus,
  ArrowRight,
  Clock,
  CheckCircle,
  AlertCircle,
  XCircle,
} from 'lucide-react';
import type { DashboardStats } from '@/types';

export default function DashboardPage() {
  const user = useAuthStore((state) => state.user);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      if (!user) return;
      try {
        setLoading(true);
        const data = await databaseService.getDashboardStats(user.id);
        setStats(data);
      } catch {
        // Error handled by empty state
      } finally {
        setLoading(false);
      }
    }

    fetchStats();
  }, [user]);

  if (!user) return null;

  const statCards = [
    {
      title: 'Objectives',
      value: stats?.total_objectives || 0,
      icon: <Target className="h-5 w-5" />,
      trend: {
        value: stats?.active_objectives || 0,
        label: 'active',
      },
    },
    {
      title: 'Plans',
      value: stats?.total_plans || 0,
      icon: <FileText className="h-5 w-5" />,
      trend: {
        value: stats?.active_plans || 0,
        label: 'active',
      },
    },
    {
      title: 'Agent Runs',
      value: stats?.total_runs || 0,
      icon: <Zap className="h-5 w-5" />,
      trend: {
        value: stats?.successful_runs || 0,
        label: 'successful',
      },
    },
    {
      title: 'Tool Executions',
      value: stats?.total_tool_executions || 0,
      icon: <Activity className="h-5 w-5" />,
    },
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4 text-green-400" />;
      case 'running': return <Play className="h-4 w-4 text-cyan-400" />;
      case 'pending': return <Clock className="h-4 w-4 text-yellow-400" />;
      case 'failed': return <AlertCircle className="h-4 w-4 text-red-400" />;
      case 'cancelled': return <XCircle className="h-4 w-4 text-gray-400" />;
      case 'active': return <CheckCircle className="h-4 w-4 text-cyan-400" />;
      default: return <Activity className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const successRate = stats && stats.total_runs > 0
    ? Math.round((stats.successful_runs / stats.total_runs) * 100)
    : 0;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Welcome Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-orbitron text-3xl font-bold tracking-tight text-foreground">
            Welcome back, {user.display_name || user.username}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground font-techno tracking-wider">
            SYSTEM STATUS: OPERATIONAL
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link href="/plans/new">
              <Plus className="mr-2 h-4 w-4" />
              New Objective
            </Link>
          </Button>
          <Button variant="outline" size="sm" asChild>
            <Link href="/runs/new">
              <Plus className="mr-2 h-4 w-4" />
              Start Run
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat, index) => (
          <StatCard key={index} {...stat} loading={loading} />
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-4 lg:grid-cols-3">
        {/* Recent Activity */}
        <Card className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-orbitron text-lg font-semibold text-foreground">
              Recent Activity
            </h3>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/runs">
                View All <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </div>

          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-12 animate-pulse bg-muted rounded" />
              ))}
            </div>
          ) : stats?.recent_activity?.length === 0 ? (
            <div className="py-8 text-center">
              <Activity className="h-12 w-12 mx-auto text-muted-foreground/50 mb-3" />
              <p className="text-sm text-muted-foreground">No recent activity</p>
              <p className="text-xs text-muted-foreground/70 mt-1">
                Create an objective to get started
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {stats?.recent_activity?.slice(0, 8).map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-center justify-between p-3 rounded-md bg-muted/50 hover:bg-muted transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                      {getStatusIcon(activity.status)}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">{activity.title}</p>
                      <p className="text-xs text-muted-foreground capitalize">{activity.type}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge status={activity.status} variant="status" size="sm">
                      {activity.status}
                    </Badge>
                    <p className="text-[10px] font-techno text-muted-foreground mt-1">
                      {formatRelativeTime(activity.created_at)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Quick Actions / System Status */}
        <Card>
          <h3 className="font-orbitron text-lg font-semibold text-foreground mb-4">
            Quick Actions
          </h3>
          <div className="space-y-2">
            <Button variant="outline" className="w-full justify-start gap-3" asChild>
              <Link href="/plans/new">
                <Target className="h-4 w-4" />
                <span>Create New Objective</span>
              </Link>
            </Button>
            <Button variant="outline" className="w-full justify-start gap-3" asChild>
              <Link href="/plans">
                <FileText className="h-4 w-4" />
                <span>View All Plans</span>
              </Link>
            </Button>
            <Button variant="outline" className="w-full justify-start gap-3" asChild>
              <Link href="/runs/new">
                <Zap className="h-4 w-4" />
                <span>Start Agent Run</span>
              </Link>
            </Button>
            <Button variant="outline" className="w-full justify-start gap-3" asChild>
              <Link href="/tools">
                <Settings className="h-4 w-4" />
                <span>Manage Tools</span>
              </Link>
            </Button>
          </div>

          <div className="mt-6 pt-6 border-t border-border">
            <h4 className="font-orbitron text-sm font-semibold text-muted-foreground mb-3">
              System Health
            </h4>
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Data sync</span>
                <Badge status={stats && stats.total_objectives > 0 ? 'completed' : 'pending'} variant="status" size="sm">
                  {stats && stats.total_objectives > 0 ? 'Live' : 'Waiting'}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Objectives</span>
                <span className="font-medium text-foreground">{stats?.total_objectives ?? 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Runs</span>
                <span className="font-medium text-foreground">{stats?.total_runs ?? 0}</span>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Quick Stats Row */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-techno text-muted-foreground tracking-wider">
                SUCCESS RATE
              </p>
              <p className="font-orbitron text-3xl font-bold text-green-400">
                {successRate}%
              </p>
            </div>
            <CheckCircle className="h-10 w-10 text-green-400/30" />
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-techno text-muted-foreground tracking-wider">
                ACTIVE OBJECTIVES
              </p>
              <p className="font-orbitron text-3xl font-bold text-cyan-400">
                {stats?.active_objectives ?? 0}
              </p>
            </div>
            <Target className="h-10 w-10 text-cyan-400/30" />
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-techno text-muted-foreground tracking-wider">
                TOOL EVENTS
              </p>
              <p className="font-orbitron text-3xl font-bold text-primary">
                {stats?.total_tool_executions ?? 0}
              </p>
            </div>
            <Settings className="h-10 w-10 text-primary/30" />
          </div>
        </Card>
      </div>
    </div>
  );
}
// API Route: Dashboard Stats
import { createServerSupabaseClient } from '@/lib/supabase';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const supabase = createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch all stats in parallel
    const [
      objectivesResult,
      plansResult,
      runsResult,
      decisionsResult,
      toolExecsResult,
    ] = await Promise.all([
      supabase.from('objectives').select('id, status').eq('user_id', user.id),
      supabase.from('plans').select('id, status').eq('user_id', user.id),
      supabase.from('agent_runs').select('id, status').eq('user_id', user.id),
      supabase.from('decisions').select('id').eq('user_id', user.id),
      supabase.from('tool_executions').select('id, status').eq('user_id', user.id),
    ]);

    const objectives = objectivesResult.data || [];
    const plans = plansResult.data || [];
    const runs = runsResult.data || [];
    const decisions = decisionsResult.data || [];
    const toolExecs = toolExecsResult.data || [];

    // Recent activity
    const [recentObjectives, recentRuns] = await Promise.all([
      supabase.from('objectives').select('id, title, status, created_at').eq('user_id', user.id).order('created_at', { ascending: false }).limit(3),
      supabase.from('agent_runs').select('id, run_name, status, created_at').eq('user_id', user.id).order('created_at', { ascending: false }).limit(3),
    ]);

    const recentActivity = [
      ...(recentObjectives.data || []).map(o => ({ ...o, type: 'objective' as const })),
      ...(recentRuns.data || []).map(r => ({ ...r, type: 'run' as const })),
    ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).slice(0, 10);

    return NextResponse.json({
      total_objectives: objectives.length,
      active_objectives: objectives.filter(o => o.status === 'active').length,
      total_plans: plans.length,
      active_plans: plans.filter(p => p.status === 'active').length,
      total_runs: runs.length,
      successful_runs: runs.filter(r => r.status === 'completed').length,
      failed_runs: runs.filter(r => r.status === 'failed').length,
      total_decisions: decisions.length,
      total_tool_executions: toolExecs.length,
      recent_activity: recentActivity,
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
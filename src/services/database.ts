// Database Service for KAIROS
import { getSupabaseClient } from '@/lib/supabase';
import type { Objective, Plan, AgentRun, Decision, ToolExecution, Outcome, DashboardStats, ActivityItem, User } from '../types';

export class DatabaseService {
  private get supabase() {
    return getSupabaseClient();
  }

  // Objectives
  async createObjective(data: Partial<Objective>): Promise<Objective> {
    const { data: result, error } = await this.supabase
      .from('objectives')
      .insert({
        user_id: data.user_id,
        title: data.title,
        description: data.description,
        status: data.status || 'active',
        priority: data.priority || 0,
        metadata: data.metadata || {},
      })
      .select()
      .single();

    if (error) throw new Error(`Failed to create objective: ${error.message}`);
    return result as Objective;
  }

  async getObjectives(userId: string): Promise<Objective[]> {
    const { data, error } = await this.supabase
      .from('objectives')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw new Error(`Failed to fetch objectives: ${error.message}`);
    return (data || []) as Objective[];
  }

  async getObjective(id: string): Promise<Objective> {
    const { data, error } = await this.supabase
      .from('objectives')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw new Error(`Failed to fetch objective: ${error.message}`);
    return data as Objective;
  }

  async updateObjective(id: string, updates: Partial<Objective>): Promise<Objective> {
    const { data, error } = await this.supabase
      .from('objectives')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw new Error(`Failed to update objective: ${error.message}`);
    return data as Objective;
  }

  async deleteObjective(id: string): Promise<void> {
    const { error } = await this.supabase
      .from('objectives')
      .delete()
      .eq('id', id);

    if (error) throw new Error(`Failed to delete objective: ${error.message}`);
  }

  // Plans
  async createPlan(data: Partial<Plan>): Promise<Plan> {
    const { data: result, error } = await this.supabase
      .from('plans')
      .insert({
        user_id: data.user_id,
        objective_id: data.objective_id,
        title: data.title,
        description: data.description,
        status: data.status || 'draft',
        steps: data.steps || [],
        estimated_duration: data.estimated_duration,
        metadata: data.metadata || {},
      })
      .select()
      .single();

    if (error) throw new Error(`Failed to create plan: ${error.message}`);
    return result as Plan;
  }

  async getPlans(userId: string): Promise<Plan[]> {
    const { data, error } = await this.supabase
      .from('plans')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw new Error(`Failed to fetch plans: ${error.message}`);
    return (data || []) as Plan[];
  }

  async getPlan(id: string): Promise<Plan> {
    const { data, error } = await this.supabase
      .from('plans')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw new Error(`Failed to fetch plan: ${error.message}`);
    return data as Plan;
  }

  async updatePlan(id: string, updates: Partial<Plan>): Promise<Plan> {
    const { data, error } = await this.supabase
      .from('plans')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw new Error(`Failed to update plan: ${error.message}`);
    return data as Plan;
  }

  // Agent Runs
  async createAgentRun(data: Partial<AgentRun>): Promise<AgentRun> {
    const { data: result, error } = await this.supabase
      .from('agent_runs')
      .insert({
        user_id: data.user_id,
        objective_id: data.objective_id,
        plan_id: data.plan_id,
        run_name: data.run_name,
        objective: data.objective,
        status: data.status || 'pending',
        model: data.model || 'claude-3-5-sonnet-20241022',
        total_steps: data.total_steps || 0,
        completed_steps: 0,
        failed_steps: 0,
        tool_calls: data.tool_calls || [],
        result: data.result,
        error: data.error,
        started_at: data.started_at,
      })
      .select()
      .single();

    if (error) throw new Error(`Failed to create agent run: ${error.message}`);
    return result as AgentRun;
  }

  async getAgentRuns(userId: string): Promise<AgentRun[]> {
    const { data, error } = await this.supabase
      .from('agent_runs')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw new Error(`Failed to fetch agent runs: ${error.message}`);
    return (data || []) as AgentRun[];
  }

  async getAgentRun(id: string): Promise<AgentRun> {
    const { data, error } = await this.supabase
      .from('agent_runs')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw new Error(`Failed to fetch agent run: ${error.message}`);
    return data as AgentRun;
  }

  async updateAgentRun(id: string, updates: Partial<AgentRun>): Promise<AgentRun> {
    const { data, error } = await this.supabase
      .from('agent_runs')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw new Error(`Failed to update agent run: ${error.message}`);
    return data as AgentRun;
  }

  // Decisions
  async createDecision(data: Partial<Decision>): Promise<Decision> {
    const { data: result, error } = await this.supabase
      .from('decisions')
      .insert({
        user_id: data.user_id,
        agent_run_id: data.agent_run_id,
        decision_type: data.decision_type,
        context: data.context || {},
        chosen_option: data.chosen_option,
        alternatives: data.alternatives || [],
        reasoning: data.reasoning,
        confidence_score: data.confidence_score,
      })
      .select()
      .single();

    if (error) throw new Error(`Failed to create decision: ${error.message}`);
    return result as Decision;
  }

  async getDecisions(userId: string): Promise<Decision[]> {
    const { data, error } = await this.supabase
      .from('decisions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw new Error(`Failed to fetch decisions: ${error.message}`);
    return (data || []) as Decision[];
  }

  // Tool Executions
  async createToolExecution(data: Partial<ToolExecution>): Promise<ToolExecution> {
    const { data: result, error } = await this.supabase
      .from('tool_executions')
      .insert({
        user_id: data.user_id,
        agent_run_id: data.agent_run_id,
        tool_name: data.tool_name,
        parameters: data.parameters || {},
        result: data.result,
        status: data.status || 'pending',
        error: data.error,
      })
      .select()
      .single();

    if (error) throw new Error(`Failed to create tool execution: ${error.message}`);
    return result as ToolExecution;
  }

  async getToolExecutions(userId: string): Promise<ToolExecution[]> {
    const { data, error } = await this.supabase
      .from('tool_executions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw new Error(`Failed to fetch tool executions: ${error.message}`);
    return (data || []) as ToolExecution[];
  }

  async updateToolExecution(id: string, updates: Partial<ToolExecution>): Promise<ToolExecution> {
    const { data, error } = await this.supabase
      .from('tool_executions')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw new Error(`Failed to update tool execution: ${error.message}`);
    return data as ToolExecution;
  }

  // Outcomes
  async createOutcome(data: Partial<Outcome>): Promise<Outcome> {
    const { data: result, error } = await this.supabase
      .from('outcomes')
      .insert({
        user_id: data.user_id,
        objective_id: data.objective_id,
        agent_run_id: data.agent_run_id,
        title: data.title,
        summary: data.summary,
        status: data.status || 'pending',
        findings: data.findings || [],
        errors: data.errors || [],
        completed: data.completed ?? false,
        metadata: data.metadata || {},
      })
      .select()
      .single();

    if (error) throw new Error(`Failed to create outcome: ${error.message}`);
    return result as Outcome;
  }

  async getOutcomes(userId: string): Promise<Outcome[]> {
    const { data, error } = await this.supabase
      .from('outcomes')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw new Error(`Failed to fetch outcomes: ${error.message}`);
    return (data || []) as Outcome[];
  }

  async getOutcome(id: string): Promise<Outcome> {
    const { data, error } = await this.supabase
      .from('outcomes')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw new Error(`Failed to fetch outcome: ${error.message}`);
    return data as Outcome;
  }

  async updateOutcome(id: string, updates: Partial<Outcome>): Promise<Outcome> {
    const { data, error } = await this.supabase
      .from('outcomes')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw new Error(`Failed to update outcome: ${error.message}`);
    return data as Outcome;
  }

  // Dashboard
  async getDashboardStats(userId: string): Promise<DashboardStats> {
    const [objectives, plans, runs, decisions, toolExecs] = await Promise.all([
      this.getObjectives(userId),
      this.getPlans(userId),
      this.getAgentRuns(userId),
      this.getDecisions(userId),
      this.getToolExecutions(userId),
    ]);

    void decisions;

    const recentActivity: ActivityItem[] = [];
    
    objectives.slice(0, 3).forEach(o => {
      recentActivity.push({
        id: o.id,
        type: 'objective',
        title: o.title,
        status: o.status,
        created_at: o.created_at,
      });
    });
    
    runs.slice(0, 3).forEach(r => {
      recentActivity.push({
        id: r.id,
        type: 'run',
        title: r.run_name,
        status: r.status,
        created_at: r.created_at,
      });
    });

    recentActivity.sort((a, b) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );

    return {
      total_objectives: objectives.length,
      active_objectives: objectives.filter(o => o.status === 'active').length,
      total_plans: plans.length,
      active_plans: plans.filter(p => p.status === 'active').length,
      total_runs: runs.length,
      successful_runs: runs.filter(r => r.status === 'completed').length,
      failed_runs: runs.filter(r => r.status === 'failed').length,
      total_tool_executions: toolExecs.length,
      recent_activity: recentActivity.slice(0, 10),
    };
  }

  // Profile
  async updateProfile(userId: string, updates: Partial<User>): Promise<User> {
    const { data, error } = await this.supabase
      .from('profiles')
      .update({
        username: updates.username,
        display_name: updates.display_name,
        bio: updates.bio,
        avatar_url: updates.avatar_url,
      })
      .eq('id', userId)
      .select()
      .single();

    if (error) throw new Error(`Failed to update profile: ${error.message}`);
    return data as User;
  }
}

export const databaseService = new DatabaseService();
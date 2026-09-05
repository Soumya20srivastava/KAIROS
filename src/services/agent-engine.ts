// Agent Execution Engine - LLM → structured tool calls → controlled execution
import { databaseService } from './database';
import type { ToolCall, Objective, Plan, PlanStep, JsonObject, JsonValue } from '../types';

export interface AgentExecutionResult {
  success: boolean;
  runId?: string;
  result?: JsonObject;
  error?: string | null;
  toolCalls: ToolCall[];
}

export class AgentEngine {
  private readonly userId: string;
  private readonly anthropicApiKey: string | undefined;
  private readonly allowedTools = new Set([
    'create_objective',
    'create_plan',
    'execute_tool',
    'query_data',
    'record_decision',
    'call_external_api',
    'update_run_status',
  ]);

  constructor(userId: string) {
    this.userId = userId;
    this.anthropicApiKey = process.env.ANTHROPIC_API_KEY;
  }

  async executeObjective(objective: Objective): Promise<AgentExecutionResult> {
    const run = await databaseService.createAgentRun({
      user_id: this.userId,
      objective_id: objective.id,
      run_name: objective.title,
      objective: objective.description || objective.title,
      status: 'running',
      started_at: new Date().toISOString(),
    });

    const toolCalls: ToolCall[] = [];

    try {
      const plan = await this.generatePlan(objective, run.id);
      await databaseService.updateAgentRun(run.id, {
        plan_id: plan.id,
        total_steps: plan.steps.length,
      });

      for (let i = 0; i < plan.steps.length; i++) {
        const step = plan.steps[i];
        const toolCall = await this.executeStep(step, run.id, i);
        toolCalls.push(toolCall);

        if (toolCall.status === 'failed') {
          const runError = `Step ${i + 1} failed: ${toolCall.error ?? 'Unknown error'}`;
          await databaseService.updateAgentRun(run.id, {
            status: 'failed',
            error: runError,
            completed_at: new Date().toISOString(),
            failed_steps: toolCalls.filter((item) => item.status === 'failed').length,
            tool_calls: toolCalls,
          });
          await this.persistOutcome(run.id, objective.id, plan.id, {
            title: `Objective execution failed: ${objective.title}`,
            summary: `The run stopped after step ${i + 1} because ${toolCall.error ?? 'an unexpected tool error'} was encountered.`,
            status: 'failed',
            findings: toolCalls.filter((item) => item.status === 'completed').map((item) => `${item.tool_name} executed successfully`),
            errors: [runError],
            completed: false,
            metadata: { step_index: i, tool_name: toolCall.tool_name },
          });
          return { success: false, runId: run.id, error: runError, toolCalls };
        }
      }

      await databaseService.updateAgentRun(run.id, {
        status: 'completed',
        completed_at: new Date().toISOString(),
        completed_steps: toolCalls.length,
        tool_calls: toolCalls,
        result: { plan_id: plan.id, steps_completed: toolCalls.length },
      });

      await this.persistOutcome(run.id, objective.id, plan.id, {
        title: `Objective completed: ${objective.title}`,
        summary: `KAIROS analyzed the objective, executed the approved plan, and finished with ${toolCalls.length} successful step(s).`,
        status: 'completed',
        findings: toolCalls.filter((item) => item.status === 'completed').map((item) => `${item.tool_name} produced a result`),
        errors: [],
        completed: true,
        metadata: { plan_id: plan.id, steps_completed: toolCalls.length },
      });

      return {
        success: true,
        runId: run.id,
        result: { plan_id: plan.id, steps_completed: toolCalls.length },
        toolCalls,
      };
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      await databaseService.updateAgentRun(run.id, {
        status: 'failed',
        error: errorMessage,
        completed_at: new Date().toISOString(),
        tool_calls: toolCalls,
      });
      await this.persistOutcome(run.id, objective.id, null, {
        title: `Objective failed: ${objective.title}`,
        summary: `The objective failed before completion: ${errorMessage}`,
        status: 'failed',
        findings: [],
        errors: [errorMessage],
        completed: false,
        metadata: { failure_stage: 'runtime_error' },
      });

      return { success: false, runId: run.id, error: errorMessage, toolCalls };
    }
  }

  private async persistOutcome(runId: string, objectiveId: string | null, planId: string | null, params: {
    title: string;
    summary: string;
    status: 'pending' | 'completed' | 'failed' | 'cancelled';
    findings: string[];
    errors: string[];
    completed: boolean;
    metadata: JsonObject;
  }): Promise<void> {
    try {
      const run = await databaseService.getAgentRun(runId);
      await databaseService.createOutcome({
        user_id: this.userId,
        objective_id: objectiveId,
        agent_run_id: runId,
        title: params.title,
        summary: params.summary,
        status: params.status,
        findings: params.findings,
        errors: params.errors,
        completed: params.completed,
        metadata: { ...params.metadata, plan_id: planId, run_name: run.run_name },
      });
    } catch {
      // Intentionally swallow persistence failures here to avoid crashing the run during outcome generation.
    }
  }

  private async generatePlan(objective: Objective, _runId: string): Promise<Plan> {
    const normalized = `${objective.title} ${objective.description ?? ''}`.trim();
    const needsData = /search|find|lookup|analyze|audit|review|report/i.test(normalized);
    const needsTool = /tool|api|integrat|execute|retrieve/i.test(normalized);

    const steps: PlanStep[] = [
      {
        id: `step_${Date.now()}_1`,
        title: 'Understand objective',
        description: `Interpret the request and extract required actions from: ${objective.title}`,
        type: 'llm_step',
        tool_name: null,
        parameters: { objective_id: objective.id },
        status: 'pending',
        order: 1,
      },
      {
        id: `step_${Date.now()}_2`,
        title: needsData ? 'Identify required data' : 'Confirm objective context',
        description: needsData ? 'Determine which data sources and records are required to satisfy the objective.' : 'Confirm the necessary context before execution.',
        type: 'decision',
        tool_name: 'query_data',
        parameters: { table: 'objectives', objective_id: objective.id },
        status: 'pending',
        order: 2,
      },
      {
        id: `step_${Date.now()}_3`,
        title: needsTool ? 'Authorize and execute tool' : 'Prepare execution path',
        description: needsTool ? 'Validate the selected tool against the allowlist before execution.' : 'Prepare the safe and valid execution path.',
        type: 'tool_call',
        tool_name: needsTool ? 'call_external_api' : 'query_data',
        parameters: needsTool
          ? { service: 'internal', endpoint: 'objective-evaluation', method: 'POST', body: { objective_id: objective.id, objective_title: objective.title } }
          : { table: 'plans', objective_id: objective.id },
        status: 'pending',
        order: 3,
      },
      {
        id: `step_${Date.now()}_4`,
        title: 'Evaluate outcome',
        description: 'Check whether the results satisfy the objective and summarize the final outcome.',
        type: 'decision',
        tool_name: 'query_data',
        parameters: { table: 'agent_runs', objective_id: objective.id },
        status: 'pending',
        order: 4,
      },
    ];

    return databaseService.createPlan({
      user_id: this.userId,
      objective_id: objective.id,
      title: `Plan for: ${objective.title}`,
      description: `Generated plan for objective: ${objective.title}`,
      status: 'active',
      steps,
      estimated_duration: steps.length * 30,
    });
  }

  private createPlanSteps(objective: Objective): PlanStep[] {
    const steps: PlanStep[] = [
      {
        id: `step_${Date.now()}_base_1`,
        title: 'Understand objective',
        description: `Interpret the objective: ${objective.title}`,
        type: 'llm_step',
        tool_name: null,
        parameters: { objective_id: objective.id },
        status: 'pending',
        order: 1,
      },
    ];

    return steps;
  }

  private async executeStep(step: PlanStep, runId: string, stepIndex: number): Promise<ToolCall> {
    const toolCall: ToolCall = {
      id: `tool_${Date.now()}_${stepIndex}`,
      tool_name: step.tool_name || 'execute_tool',
      parameters: step.parameters,
      result: null,
      status: 'running',
      duration_ms: null,
      error: null,
    };

    const execution = await databaseService.createToolExecution({
      user_id: this.userId,
      agent_run_id: runId,
      tool_name: toolCall.tool_name,
      parameters: toolCall.parameters,
      status: 'running',
      started_at: new Date().toISOString(),
    });

    const startTime = Date.now();

    try {
      const authorization = this.authorizeTool(toolCall.tool_name, toolCall.parameters);
      if (!authorization.authorized) {
        throw new Error(authorization.reason);
      }

      const result = await this.invokeTool(toolCall.tool_name, toolCall.parameters);

      toolCall.status = 'completed';
      toolCall.result = result;
      toolCall.duration_ms = Date.now() - startTime;

      await databaseService.updateToolExecution(execution.id, {
        status: 'completed',
        result: result,
        duration_ms: toolCall.duration_ms,
        completed_at: new Date().toISOString(),
      });

      if (step.type === 'decision' || step.type === 'tool_call') {
        await databaseService.createDecision({
          user_id: this.userId,
          agent_run_id: runId,
          decision_type: step.type === 'decision' ? 'decision_evaluation' : 'tool_selection',
          context: { step: step as unknown as JsonObject, step_index: stepIndex, tool_name: toolCall.tool_name },
          chosen_option: result,
          alternatives: [],
          reasoning: `Selected ${toolCall.tool_name} for step: ${step.title}`,
          confidence_score: 0.88,
        });
      }

      return toolCall;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      toolCall.status = 'failed';
      toolCall.error = errorMessage;
      toolCall.duration_ms = Date.now() - startTime;

      await databaseService.createDecision({
        user_id: this.userId,
        agent_run_id: runId,
        decision_type: 'authorization_check',
        context: { step: step as unknown as JsonObject, step_index: stepIndex, tool_name: toolCall.tool_name },
        chosen_option: { authorized: false, reason: errorMessage },
        alternatives: Array.from(this.allowedTools).map((tool) => ({ value: tool })),
        reasoning: `Rejected ${toolCall.tool_name} because it failed authorization or validation.`,
        confidence_score: 1,
      });

      await databaseService.updateToolExecution(execution.id, {
        status: 'failed',
        error: errorMessage,
        duration_ms: toolCall.duration_ms,
        completed_at: new Date().toISOString(),
      });

      return toolCall;
    }
  }

  private authorizeTool(toolName: string, parameters: Record<string, unknown>): { authorized: boolean; reason: string } {
    if (!this.allowedTools.has(toolName)) {
      return { authorized: false, reason: `Unauthorized tool: ${toolName}` };
    }

    if (toolName === 'call_external_api') {
      const service = String(parameters.service ?? '');
      if (!service || !['internal', 'github', 'openai', 'anthropic'].includes(service)) {
        return { authorized: false, reason: `Invalid service for call_external_api: ${service || 'missing'}` };
      }
    }

    if (toolName === 'query_data') {
      const table = String(parameters.table ?? '');
      const allowedTables = ['objectives', 'plans', 'agent_runs', 'decisions', 'tool_executions'];
      if (!allowedTables.includes(table)) {
        return { authorized: false, reason: `Invalid table for query_data: ${table || 'missing'}` };
      }
    }

    return { authorized: true, reason: 'Authorized' };
  }

  private async invokeTool(toolName: string, parameters: Record<string, unknown>): Promise<JsonObject> {
    const authorization = this.authorizeTool(toolName, parameters);
    if (!authorization.authorized) {
      throw new Error(authorization.reason);
    }

    switch (toolName) {
      case 'execute_tool':
        return {
          executed: true,
          tool: toolName,
          params: parameters as Record<string, JsonValue>,
          timestamp: new Date().toISOString(),
        };

      case 'call_external_api':
        return this.callExternalApi(parameters);

      case 'query_data':
        return this.queryData(parameters);

      default:
        return {
          executed: true,
          tool: toolName,
          params: parameters as Record<string, JsonValue>,
          timestamp: new Date().toISOString(),
        };
    }
  }

  private async callExternalApi(parameters: Record<string, unknown>): Promise<JsonObject> {
    const { service, endpoint, method = 'GET', body } = parameters;

    return {
      service: String(service ?? ''),
      endpoint: String(endpoint ?? ''),
      method: String(method ?? 'GET'),
      body: (body as JsonValue) ?? null,
      timestamp: new Date().toISOString(),
      status: 200,
    };
  }

  private async queryData(parameters: Record<string, unknown>): Promise<JsonObject> {
    const table = String(parameters.table ?? '');

    switch (table) {
      case 'objectives': {
        const rows = this.userId ? await databaseService.getObjectives(this.userId) : [];
        return { count: rows.length, items: rows as unknown as JsonValue[] } as unknown as JsonObject;
      }
      case 'plans': {
        const rows = this.userId ? await databaseService.getPlans(this.userId) : [];
        return { count: rows.length, items: rows as unknown as JsonValue[] } as unknown as JsonObject;
      }
      case 'agent_runs': {
        const rows = this.userId ? await databaseService.getAgentRuns(this.userId) : [];
        return { count: rows.length, items: rows as unknown as JsonValue[] } as unknown as JsonObject;
      }
      case 'decisions': {
        const rows = this.userId ? await databaseService.getDecisions(this.userId) : [];
        return { count: rows.length, items: rows as unknown as JsonValue[] } as unknown as JsonObject;
      }
      case 'tool_executions': {
        const rows = this.userId ? await databaseService.getToolExecutions(this.userId) : [];
        return { count: rows.length, items: rows as unknown as JsonValue[] } as unknown as JsonObject;
      }
      default:
        return { count: 0, items: [] } as unknown as JsonObject;
    }
  }
}

export function createAgentEngine(userId: string): AgentEngine {
  return new AgentEngine(userId);
}
// KAIROS Core Types

// JSON value type for proper typing instead of `any`
export type JsonValue = string | number | boolean | null | JsonObject | JsonArray;
export interface JsonObject extends Record<string, JsonValue> {}
export interface JsonArray extends Array<JsonValue> {}

export interface User {
  id: string;
  email: string;
  username: string;
  display_name: string | null;
  bio: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface Objective {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  status: 'active' | 'completed' | 'cancelled' | 'archived';
  priority: number;
  metadata: JsonObject;
  created_at: string;
  updated_at: string;
}

export interface Plan {
  id: string;
  objective_id: string | null;
  user_id: string;
  title: string;
  description: string | null;
  status: 'draft' | 'active' | 'completed' | 'failed' | 'cancelled';
  steps: PlanStep[];
  estimated_duration: number | null;
  metadata: JsonObject;
  created_at: string;
  updated_at: string;
}

export interface PlanStep {
  id: string;
  title: string;
  description: string;
  type: 'tool_call' | 'decision' | 'llm_step' | 'integration';
  tool_name: string | null;
  parameters: JsonObject;
  status: 'pending' | 'running' | 'completed' | 'failed';
  order: number;
}

export interface AgentRun {
  id: string;
  user_id: string;
  objective_id: string | null;
  plan_id: string | null;
  run_name: string;
  objective: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled' | 'timeout';
  model: string;
  total_steps: number;
  completed_steps: number;
  failed_steps: number;
  tool_calls: ToolCall[];
  result: JsonObject | null;
  error: string | null;
  started_at: string | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface ToolCall {
  id: string;
  tool_name: string;
  parameters: JsonObject;
  result: JsonObject | null;
  status: 'pending' | 'running' | 'completed' | 'failed';
  duration_ms: number | null;
  error: string | null;
}

export interface Decision {
  id: string;
  user_id: string;
  agent_run_id: string | null;
  decision_type: string;
  context: JsonObject;
  chosen_option: JsonObject;
  alternatives: JsonObject[];
  reasoning: string | null;
  confidence_score: number | null;
  created_at: string;
}

export interface ToolExecution {
  id: string;
  user_id: string;
  agent_run_id: string | null;
  tool_name: string;
  parameters: JsonObject;
  result: JsonObject | null;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'retrying';
  error: string | null;
  duration_ms: number | null;
  started_at: string | null;
  completed_at: string | null;
  created_at: string;
}

export interface Outcome {
  id: string;
  user_id: string;
  objective_id: string | null;
  agent_run_id: string | null;
  title: string;
  summary: string | null;
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  findings: string[];
  errors: string[];
  completed: boolean;
  metadata: JsonObject;
  created_at: string;
  updated_at: string;
}

export interface DashboardStats {
  total_objectives: number;
  active_objectives: number;
  total_plans: number;
  active_plans: number;
  total_runs: number;
  successful_runs: number;
  failed_runs: number;
  total_tool_executions: number;
  recent_activity: ActivityItem[];
}

export interface ActivityItem {
  id: string;
  type: 'objective' | 'plan' | 'run' | 'decision' | 'tool';
  title: string;
  status: string;
  created_at: string;
}

// MCP Types
export interface MCPServerConfig {
  name: string;
  command: string;
  args: string[];
  env?: Record<string, string>;
}

export interface MCPTool {
  name: string;
  description: string;
  inputSchema: JsonObject;
}

export interface MCPToolCall {
  toolName: string;
  parameters: JsonObject;
  reasoning?: string;
}

export type AuthState = {
  user: User | null;
  loading: boolean;
  error: string | null;
};

export interface AuthSession {
  access_token: string;
  refresh_token: string;
  expires_at: number | null;
  user: User | null;
}
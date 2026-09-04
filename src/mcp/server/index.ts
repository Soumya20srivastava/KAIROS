// MCP Server - Exposes KAIROS tools to LLM agents
// Uses the Model Context Protocol to expose tools

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  ListToolsRequestSchema,
  CallToolRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';

// Type for CallToolResult - manually defined based on MCP spec
type CallToolResult = {
  content: Array<{ type: 'text'; text: string } | { type: 'image'; data: string; mimeType: string }>;
  isError?: boolean;
};

// Available MCP Tools
const tools = [
  {
    name: 'create_objective',
    description: 'Create a new automation objective for the user',
    inputSchema: {
      type: 'object',
      properties: {
        title: { type: 'string', description: 'Title of the objective' },
        description: { type: 'string', description: 'Detailed description' },
        priority: { type: 'number', description: 'Priority level 1-5', default: 0 },
      },
      required: ['title'],
    },
  },
  {
    name: 'create_plan',
    description: 'Create a structured plan for an objective',
    inputSchema: {
      type: 'object',
      properties: {
        objective_id: { type: 'string', description: 'ID of the parent objective' },
        title: { type: 'string', description: 'Plan title' },
        description: { type: 'string', description: 'Plan description' },
        steps: {
          type: 'array',
          description: 'Plan steps',
          items: {
            type: 'object',
            properties: {
              title: { type: 'string' },
              description: { type: 'string' },
              type: { type: 'string', enum: ['tool_call', 'decision', 'llm_step', 'integration'] },
              tool_name: { type: 'string' },
              parameters: { type: 'object' },
            },
          },
        },
      },
      required: ['objective_id', 'title'],
    },
  },
  {
    name: 'execute_tool',
    description: 'Execute a registered tool with given parameters',
    inputSchema: {
      type: 'object',
      properties: {
        tool_name: { type: 'string', description: 'Name of the tool to execute' },
        parameters: { type: 'object', description: 'Tool parameters' },
        agent_run_id: { type: 'string', description: 'Associated agent run ID' },
      },
      required: ['tool_name', 'parameters'],
    },
  },
  {
    name: 'query_data',
    description: 'Query user data from database',
    inputSchema: {
      type: 'object',
      properties: {
        table: { type: 'string', enum: ['objectives', 'plans', 'agent_runs', 'decisions', 'tool_executions'] },
        filters: { type: 'object' },
      },
      required: ['table'],
    },
  },
  {
    name: 'record_decision',
    description: 'Record a decision made during agent execution',
    inputSchema: {
      type: 'object',
      properties: {
        agent_run_id: { type: 'string' },
        decision_type: { type: 'string' },
        context: { type: 'object' },
        chosen_option: { type: 'object' },
        alternatives: { type: 'array' },
        reasoning: { type: 'string' },
        confidence_score: { type: 'number' },
      },
      required: ['decision_type', 'chosen_option'],
    },
  },
  {
    name: 'call_external_api',
    description: 'Call an external API/service integration',
    inputSchema: {
      type: 'object',
      properties: {
        service: { type: 'string', description: 'Service name (github, openai, anthropic, etc)' },
        endpoint: { type: 'string' },
        method: { type: 'string', enum: ['GET', 'POST', 'PUT', 'DELETE'], default: 'GET' },
        body: { type: 'object' },
        headers: { type: 'object' },
      },
      required: ['service', 'endpoint'],
    },
  },
  {
    name: 'update_run_status',
    description: 'Update the status of an agent run',
    inputSchema: {
      type: 'object',
      properties: {
        run_id: { type: 'string' },
        status: { type: 'string', enum: ['pending', 'running', 'completed', 'failed', 'cancelled', 'timeout'] },
        result: { type: 'object' },
        error: { type: 'string' },
      },
      required: ['run_id', 'status'],
    },
  },
];

// Built-in tool implementations
type ToolImpl = (params: Record<string, unknown>) => Promise<Record<string, unknown>>;
const toolImplementations: Record<string, ToolImpl> = {
  async create_objective(params: Record<string, unknown>) {
    return { success: true, objective_id: (params.objective_id as string) || `obj_${Date.now()}` };
  },
  async create_plan(params: Record<string, unknown>) {
    return { success: true, plan_id: (params.plan_id as string) || `plan_${Date.now()}` };
  },
  async execute_tool(params: Record<string, unknown>) {
    return { success: true, result: { executed: true, tool: params.tool_name as string } };
  },
  async query_data(_params: Record<string, unknown>) {
    return { success: true, data: [] };
  },
  async record_decision(params: Record<string, unknown>) {
    return { success: true, decision_id: (params.decision_id as string) || `dec_${Date.now()}` };
  },
  async call_external_api(params: Record<string, unknown>) {
    return { success: true, data: { service: params.service as string, endpoint: params.endpoint as string } };
  },
  async update_run_status(params: Record<string, unknown>) {
    return { success: true, run_id: params.run_id as string, status: params.status as string };
  },
};

export function createMCPServer() {
  const server = new Server(
    {
      name: 'kairos',
      version: '1.0.0',
    },
    {
      capabilities: {
        tools: {},
      },
    }
  );

  server.setRequestHandler(ListToolsRequestSchema, async () => {
    return { tools };
  });

  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;

    const implementation = toolImplementations[name];
    if (!implementation) {
      return {
        content: [
          {
            type: 'text',
            text: `Unknown tool: ${name}`,
          },
        ],
        isError: true,
      } as CallToolResult;
    }

    try {
      const result = await implementation(args || {});
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(result, null, 2),
          },
        ],
        isError: false,
      } as CallToolResult;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return {
        content: [
          {
            type: 'text',
            text: `Tool execution failed: ${errorMessage}`,
          },
        ],
        isError: true,
      } as CallToolResult;
    }
  });

  return server;
}

export async function startMCPServer() {
  const server = createMCPServer();
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('KAIROS MCP Server running on stdio');
  return server;
}

// If run directly
if (require.main === module) {
  startMCPServer();
}
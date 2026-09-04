// Tools Page
'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Search,
  Play,
  Code2,
  Globe,
  Database,
  FileText,
  Zap,
  X,
  RefreshCw,
  Target,
  Filter,
} from 'lucide-react';

const availableTools = [
  {
    id: 'create_objective',
    name: 'create_objective',
    description: 'Create a new automation objective',
    category: 'Core',
    icon: Target,
    parameters: { title: 'string', description: 'string?', priority: 'number?' },
  },
  {
    id: 'create_plan',
    name: 'create_plan',
    description: 'Generate a structured plan for an objective',
    category: 'Core',
    icon: FileText,
    parameters: { objective_id: 'string', title: 'string', steps: 'PlanStep[]' },
  },
  {
    id: 'execute_tool',
    name: 'execute_tool',
    description: 'Execute a registered tool with parameters',
    category: 'Execution',
    icon: Play,
    parameters: { tool_name: 'string', parameters: 'object', agent_run_id: 'string?' },
  },
  {
    id: 'query_data',
    name: 'query_data',
    description: 'Query user data from database',
    category: 'Data',
    icon: Database,
    parameters: { table: 'string', filters: 'object?' },
  },
  {
    id: 'record_decision',
    name: 'record_decision',
    description: 'Record a decision made during agent execution',
    category: 'Core',
    icon: Code2,
    parameters: { decision_type: 'string', context: 'object', chosen_option: 'object' },
  },
  {
    id: 'call_external_api',
    name: 'call_external_api',
    description: 'Call external API/service integration',
    category: 'Integration',
    icon: Globe,
    parameters: { service: 'string', endpoint: 'string', method: 'string?', body: 'object?' },
  },
  {
    id: 'update_run_status',
    name: 'update_run_status',
    description: 'Update the status of an agent run',
    category: 'Execution',
    icon: Zap,
    parameters: { run_id: 'string', status: 'string', result: 'object?', error: 'string?' },
  },
];

export default function ToolsPage() {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<string>('all');
  const [testTool, setTestTool] = useState<string | null>(null);
  const [testParams, setTestParams] = useState<string>('{}');
  const [testResult, setTestResult] = useState<string | null>(null);
  const [testing, setTesting] = useState(false);

  const categories = ['all', ...new Set(availableTools.map(t => t.category))];

  const filteredTools = availableTools
    .filter((t) => category === 'all' || t.category === category)
    .filter((t) =>
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.description.toLowerCase().includes(search.toLowerCase())
    );

  const handleTest = async (toolName: string) => {
    setTesting(true);
    setTestResult(null);
    try {
      const params = JSON.parse(testParams);
      // Simulate tool execution
      await new Promise(resolve => setTimeout(resolve, 500));
      setTestResult(JSON.stringify({ success: true, tool: toolName, params, timestamp: new Date().toISOString() }, null, 2));
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setTestResult(`Error: ${errorMessage}`);
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="font-orbitron text-3xl font-bold tracking-tight text-foreground">
          Tools
        </h1>
        <p className="mt-1 text-sm text-muted-foreground font-techno tracking-wider">
          {availableTools.length} TOOLS REGISTERED — MCP INTEGRATION ACTIVE
        </p>
      </div>

      <Card className="p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search tools..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="flex h-10 w-full appearance-none rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat.charAt(0).toUpperCase() + cat.slice(1)}
                </option>
              ))}
            </select>
          </div>
        </div>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredTools.map((tool) => {
          const Icon = tool.icon;
          return (
            <Card key={tool.id} className="relative">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-orbitron font-semibold text-foreground">{tool.name}</h3>
                    <Badge variant="outline" size="sm">{tool.category}</Badge>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setTestTool(tool.id)}
                  className="opacity-50 hover:opacity-100"
                >
                  <Play className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-sm text-muted-foreground mb-3">{tool.description}</p>
              <div className="flex flex-wrap gap-1 mb-3">
                {Object.entries(tool.parameters).map(([key, type]) => (
                  <Badge key={key} variant="outline" size="sm" className="text-[10px]">
                    {key}: {type}
                  </Badge>
                ))}
              </div>
              <div className="pt-3 border-t border-border flex items-center justify-between">
                <span className="text-xs font-techno text-muted-foreground">MCP</span>
                <Badge status="running" variant="status" size="sm">Online</Badge>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Test Modal */}
      {testTool && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80">
          <div className="nerv-panel w-full max-w-2xl max-h-[80vh] overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-border">
              <h3 className="font-orbitron text-lg font-semibold">Test Tool: {testTool}</h3>
              <Button variant="ghost" size="icon" onClick={() => setTestTool(null)}>
                <X className="h-5 w-5" />
              </Button>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">
                  Parameters (JSON)
                </label>
                <textarea
                  value={testParams}
                  onChange={(e) => setTestParams(e.target.value)}
                  className="w-full h-40 rounded-md border border-input bg-background px-3 py-2 text-sm font-mono focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  placeholder='{"param": "value"}'
                />
              </div>
              <div className="flex gap-2">
                <Button
                  variant="primary"
                  onClick={() => handleTest(testTool)}
                  loading={testing}
                >
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Execute
                </Button>
                <Button variant="outline" onClick={() => setTestTool(null)} disabled={testing}>
                  Cancel
                </Button>
              </div>
              {testResult && (
                <div className="rounded-md bg-background/50 border border-border p-3 font-mono text-xs max-h-60 overflow-auto">
                  {testResult}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
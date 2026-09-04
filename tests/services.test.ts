// Services Tests
import { authService } from '@/services/auth';
import { databaseService } from '@/services/database';
import { createAgentEngine } from '@/services/agent-engine';
import { getSupabaseClient } from '@/lib/supabase';

const mockSupabase = getSupabaseClient();

describe('AuthService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockSupabase.auth.signUp.mockResolvedValue({
      data: { user: null, session: null },
      error: null,
    });
    mockSupabase.auth.signInWithPassword.mockResolvedValue({
      data: { user: null, session: null },
      error: null,
    });
    mockSupabase.auth.signOut.mockResolvedValue({ error: null });
  });

  describe('register', () => {
    it('should throw error if registration fails', async () => {
      mockSupabase.auth.signUp.mockResolvedValue({
        data: { user: null, session: null },
        error: { message: 'Email already exists' },
      });

      await expect(authService.register('test@test.com', 'password123', 'testuser')).rejects.toThrow('Email already exists');
    });

    it('should allow successful registration when email verification is required before a session exists', async () => {
      const createdUser = {
        id: 'user-1',
        email: 'test@test.com',
        user_metadata: { username: 'testuser', display_name: 'Test User' },
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      };

      mockSupabase.auth.signUp.mockResolvedValue({
        data: { user: createdUser, session: null },
        error: null,
      });

      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: {
            id: 'user-1',
            username: 'testuser',
            display_name: 'Test User',
            bio: null,
            avatar_url: null,
            created_at: '2024-01-01T00:00:00Z',
            updated_at: '2024-01-01T00:00:00Z',
          },
          error: null,
        }),
      });

      const result = await authService.register('test@test.com', 'password123', 'testuser');

      expect(result.user?.username).toBe('testuser');
      expect(result.access_token).toBe('');
      expect(result.refresh_token).toBe('');
    });
  });

  describe('login', () => {
    it('should throw error if login fails', async () => {
      mockSupabase.auth.signInWithPassword.mockResolvedValue({
        data: { user: null, session: null },
        error: { message: 'Invalid credentials' },
      });

      await expect(authService.login('test@test.com', 'wrongpassword')).rejects.toThrow('Invalid credentials');
    });
  });

  describe('logout', () => {
    it('should call signOut', async () => {
      await authService.logout();
      expect(mockSupabase.auth.signOut).toHaveBeenCalled();
    });
  });
});

describe('DatabaseService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockSupabase.from.mockReset();
  });

  describe('createObjective', () => {
    it('should call supabase insert with correct data', async () => {
      const mockObjective = {
        id: 'obj-1',
        user_id: 'user-1',
        title: 'Test Objective',
        description: 'Description',
        status: 'active',
        priority: 1,
        metadata: {},
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      };

      const query = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: mockObjective, error: null }),
        insert: jest.fn().mockReturnThis(),
        update: jest.fn().mockReturnThis(),
        delete: jest.fn().mockReturnThis(),
      };
      mockSupabase.from.mockReturnValue(query);

      const result = await databaseService.createObjective({
        user_id: 'user-1',
        title: 'Test Objective',
        description: 'Description',
        priority: 1,
      });

      expect(result.title).toBe('Test Objective');
      expect(mockSupabase.from).toHaveBeenCalledWith('objectives');
    });
  });

  describe('getDashboardStats', () => {
    it('should return empty stats for new user', async () => {
      jest.spyOn(databaseService, 'getObjectives').mockResolvedValue([]);
      jest.spyOn(databaseService, 'getPlans').mockResolvedValue([]);
      jest.spyOn(databaseService, 'getAgentRuns').mockResolvedValue([]);
      jest.spyOn(databaseService, 'getDecisions').mockResolvedValue([]);
      jest.spyOn(databaseService, 'getToolExecutions').mockResolvedValue([]);

      const stats = await databaseService.getDashboardStats('user-1');

      expect(stats.total_objectives).toBe(0);
      expect(stats.total_plans).toBe(0);
      expect(stats.total_runs).toBe(0);
      expect(stats.total_tool_executions).toBe(0);
      expect(stats.recent_activity).toEqual([]);
    });
  });
});

describe('AgentEngine', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createAgentEngine', () => {
    it('should create an agent engine instance', () => {
      const engine = createAgentEngine('user-1');
      expect(engine).toBeInstanceOf(Object);
      expect(typeof engine.executeObjective).toBe('function');
    });
  });

  describe('executeObjective', () => {
    it('should execute objective and return result', async () => {
      const engine = createAgentEngine('user-1');

      jest.spyOn(databaseService, 'createAgentRun').mockResolvedValue({
        id: 'run-1',
        user_id: 'user-1',
        objective_id: 'obj-1',
        plan_id: null,
        run_name: 'Test Run',
        objective: 'Test objective',
        status: 'running',
        model: 'claude-3-5-sonnet-20241022',
        total_steps: 0,
        completed_steps: 0,
        failed_steps: 0,
        tool_calls: [],
        result: null,
        error: null,
        started_at: new Date().toISOString(),
        completed_at: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

      jest.spyOn(databaseService, 'createPlan').mockResolvedValue({
        id: 'plan-1',
        user_id: 'user-1',
        objective_id: 'obj-1',
        title: 'Test Plan',
        description: 'Plan description',
        status: 'active',
        steps: [
          { id: 'step-1', title: 'Step 1', description: 'Step 1 description', type: 'llm_step', tool_name: null, parameters: {}, status: 'pending', order: 1 },
        ],
        estimated_duration: 30,
        metadata: {},
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

      jest.spyOn(databaseService, 'updateAgentRun').mockResolvedValue({
        id: 'run-1',
        user_id: 'user-1',
        objective_id: 'obj-1',
        plan_id: 'plan-1',
        run_name: 'Test Run',
        objective: 'Test objective',
        status: 'completed',
        model: 'claude-3-5-sonnet-20241022',
        total_steps: 1,
        completed_steps: 1,
        failed_steps: 0,
        tool_calls: [],
        result: { plan_id: 'plan-1', steps_completed: 1 },
        error: null,
        started_at: new Date().toISOString(),
        completed_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

      jest.spyOn(databaseService, 'createToolExecution').mockResolvedValue({
        id: 'tool-1',
        user_id: 'user-1',
        agent_run_id: 'run-1',
        tool_name: 'execute_tool',
        parameters: {},
        result: null,
        status: 'running',
        error: null,
        duration_ms: null,
        started_at: new Date().toISOString(),
        completed_at: null,
        created_at: new Date().toISOString(),
      });

      jest.spyOn(databaseService, 'updateToolExecution').mockResolvedValue({
        id: 'tool-1',
        user_id: 'user-1',
        agent_run_id: 'run-1',
        tool_name: 'execute_tool',
        parameters: {},
        result: { executed: true },
        status: 'completed',
        error: null,
        duration_ms: 12,
        started_at: new Date().toISOString(),
        completed_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
      });

      const objective = {
        id: 'obj-1',
        user_id: 'user-1',
        title: 'Test Objective',
        description: 'Test description',
        status: 'active' as const,
        priority: 1,
        metadata: {},
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const result = await engine.executeObjective(objective);

      expect(result).toHaveProperty('success');
      expect(result).toHaveProperty('runId', 'run-1');
      expect(result).toHaveProperty('toolCalls');
    });

    it('should block unauthorized tools and persist an outcome', async () => {
      const engine = createAgentEngine('user-1');
      const createRunSpy = jest.spyOn(databaseService, 'createAgentRun').mockResolvedValue({
        id: 'run-auth',
        user_id: 'user-1',
        objective_id: 'obj-auth',
        plan_id: null,
        run_name: 'Unauthorized Tool Run',
        objective: 'Test unauthorized tool scenario',
        status: 'running',
        model: 'claude-3-5-sonnet-20241022',
        total_steps: 0,
        completed_steps: 0,
        failed_steps: 0,
        tool_calls: [],
        result: null,
        error: null,
        started_at: new Date().toISOString(),
        completed_at: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

      const createPlanSpy = jest.spyOn(databaseService, 'createPlan').mockResolvedValue({
        id: 'plan-auth',
        user_id: 'user-1',
        objective_id: 'obj-auth',
        title: 'Plan with authorization gate',
        description: 'Ensures the system denies unsafe tool access.',
        status: 'active',
        steps: [
          { id: 'step-auth', title: 'Authorization Check', description: 'Validate tool access', type: 'tool_call', tool_name: 'unauthorized_tool', parameters: { cmd: 'rm -rf /' }, status: 'pending', order: 1 },
        ],
        estimated_duration: 30,
        metadata: {},
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

      const createDecisionSpy = jest.spyOn(databaseService, 'createDecision').mockResolvedValue({
        id: 'decision-auth',
        user_id: 'user-1',
        agent_run_id: 'run-auth',
        decision_type: 'authorization_check',
        context: { step: { title: 'Authorization Check' }, step_index: 0, tool_name: 'unauthorized_tool' },
        chosen_option: { authorized: false, reason: 'Unauthorized tool: unauthorized_tool' },
        alternatives: ['create_objective', 'create_plan', 'execute_tool', 'query_data', 'record_decision', 'call_external_api', 'update_run_status'],
        reasoning: 'Rejected unauthorized_tool because it failed authorization or validation.',
        confidence_score: 1,
        created_at: new Date().toISOString(),
      });
      const updateAgentRunSpy = jest.spyOn(databaseService, 'updateAgentRun').mockResolvedValue({
        id: 'run-auth',
        user_id: 'user-1',
        objective_id: 'obj-auth',
        plan_id: 'plan-auth',
        run_name: 'Unauthorized Tool Run',
        objective: 'Test unauthorized tool scenario',
        status: 'failed',
        model: 'claude-3-5-sonnet-20241022',
        total_steps: 1,
        completed_steps: 0,
        failed_steps: 1,
        tool_calls: [],
        result: null,
        error: 'Unauthorized tool: unauthorized_tool',
        started_at: new Date().toISOString(),
        completed_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
      const createToolExecutionSpy = jest.spyOn(databaseService, 'createToolExecution').mockResolvedValue({
        id: 'tool-auth',
        user_id: 'user-1',
        agent_run_id: 'run-auth',
        tool_name: 'unauthorized_tool',
        parameters: { cmd: 'rm -rf /' },
        result: null,
        status: 'running',
        error: null,
        duration_ms: null,
        started_at: new Date().toISOString(),
        completed_at: null,
        created_at: new Date().toISOString(),
      });
      const updateToolExecutionSpy = jest.spyOn(databaseService, 'updateToolExecution').mockResolvedValue({
        id: 'tool-auth',
        user_id: 'user-1',
        agent_run_id: 'run-auth',
        tool_name: 'unauthorized_tool',
        parameters: { cmd: 'rm -rf /' },
        result: null,
        status: 'failed',
        error: 'Unauthorized tool: unauthorized_tool',
        duration_ms: 5,
        started_at: new Date().toISOString(),
        completed_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
      });
      const getAgentRunSpy = jest.spyOn(databaseService, 'getAgentRun').mockResolvedValue({
        id: 'run-auth',
        user_id: 'user-1',
        objective_id: 'obj-auth',
        plan_id: 'plan-auth',
        run_name: 'Unauthorized Tool Run',
        objective: 'Test unauthorized tool scenario',
        status: 'failed',
        model: 'claude-3-5-sonnet-20241022',
        total_steps: 1,
        completed_steps: 0,
        failed_steps: 1,
        tool_calls: [],
        result: null,
        error: 'Unauthorized tool: unauthorized_tool',
        started_at: new Date().toISOString(),
        completed_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
      const createOutcomeSpy = jest.spyOn(databaseService, 'createOutcome').mockResolvedValue({
        id: 'outcome-auth',
        user_id: 'user-1',
        objective_id: 'obj-auth',
        agent_run_id: 'run-auth',
        title: 'Objective execution blocked by authorization',
        summary: 'The execution was denied because unauthorized_tool is not approved for this user.',
        status: 'failed',
        findings: ['Unauthorized tool blocked'],
        errors: ['Unauthorized tool: unauthorized_tool'],
        completed: false,
        metadata: {},
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

      const objective = {
        id: 'obj-auth',
        user_id: 'user-1',
        title: 'Block unsafe tool execution',
        description: 'This objective must fail safely when the tool is not allowed.',
        status: 'active' as const,
        priority: 1,
        metadata: {},
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const result = await engine.executeObjective(objective);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Unauthorized tool');
      expect(createDecisionSpy).toHaveBeenCalledWith(expect.objectContaining({
        decision_type: 'authorization_check',
      }));
      expect(updateAgentRunSpy).toHaveBeenCalled();
      expect(getAgentRunSpy).toHaveBeenCalled();
      expect(createOutcomeSpy).toHaveBeenCalled();
      expect(createRunSpy).toHaveBeenCalled();
      expect(createPlanSpy).toHaveBeenCalled();
      expect(createToolExecutionSpy).toHaveBeenCalled();
      expect(updateToolExecutionSpy).toHaveBeenCalled();
    });
  });
});
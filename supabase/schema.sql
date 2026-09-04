-- KAIROS Database Schema
-- Supabase / PostgreSQL

-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Profiles (extends auth.users)
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    username TEXT UNIQUE NOT NULL,
    display_name TEXT,
    bio TEXT,
    avatar_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT username_length CHECK (char_length(username) >= 3 AND char_length(username) <= 30),
    CONSTRAINT username_format CHECK (username ~ '^[a-zA-Z0-9_]+$')
);

-- Objectives
CREATE TABLE public.objectives (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled', 'archived')),
    priority INTEGER NOT NULL DEFAULT 1 CHECK (priority BETWEEN 1 AND 5),
    metadata JSONB NOT NULL DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Plans
CREATE TABLE public.plans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    objective_id UUID NOT NULL REFERENCES public.objectives(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'completed', 'failed', 'cancelled')),
    steps JSONB NOT NULL DEFAULT '[]',
    estimated_duration INTEGER,
    metadata JSONB NOT NULL DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Agent Runs
CREATE TABLE public.agent_runs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    objective_id UUID REFERENCES public.objectives(id) ON DELETE SET NULL,
    plan_id UUID REFERENCES public.plans(id) ON DELETE SET NULL,
    run_name TEXT NOT NULL,
    objective TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'running', 'completed', 'failed', 'cancelled', 'timeout')),
    model TEXT NOT NULL DEFAULT 'claude-3-5-sonnet-20241022',
    total_steps INTEGER NOT NULL DEFAULT 0,
    completed_steps INTEGER NOT NULL DEFAULT 0,
    failed_steps INTEGER NOT NULL DEFAULT 0,
    tool_calls JSONB NOT NULL DEFAULT '[]',
    result JSONB,
    error TEXT,
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Decisions
CREATE TABLE public.decisions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    agent_run_id UUID REFERENCES public.agent_runs(id) ON DELETE CASCADE,
    decision_type TEXT NOT NULL,
    context JSONB NOT NULL DEFAULT '{}',
    chosen_option JSONB NOT NULL,
    alternatives JSONB NOT NULL DEFAULT '[]',
    reasoning TEXT,
    confidence_score DECIMAL(3,2) CHECK (confidence_score BETWEEN 0 AND 1),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Tool Executions
CREATE TABLE public.tool_executions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    agent_run_id UUID REFERENCES public.agent_runs(id) ON DELETE CASCADE,
    tool_name TEXT NOT NULL,
    parameters JSONB NOT NULL DEFAULT '{}',
    result JSONB,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'running', 'completed', 'failed', 'retrying')),
    error TEXT,
    duration_ms INTEGER,
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Outcomes
CREATE TABLE public.outcomes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    objective_id UUID REFERENCES public.objectives(id) ON DELETE SET NULL,
    agent_run_id UUID REFERENCES public.agent_runs(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    summary TEXT,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'cancelled')),
    findings JSONB NOT NULL DEFAULT '[]',
    errors JSONB NOT NULL DEFAULT '[]',
    completed BOOLEAN NOT NULL DEFAULT false,
    metadata JSONB NOT NULL DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX idx_objectives_user_id ON public.objectives(user_id);
CREATE INDEX idx_objectives_status ON public.objectives(status);
CREATE INDEX idx_plans_user_id ON public.plans(user_id);
CREATE INDEX idx_plans_objective_id ON public.plans(objective_id);
CREATE INDEX idx_agent_runs_user_id ON public.agent_runs(user_id);
CREATE INDEX idx_agent_runs_status ON public.agent_runs(status);
CREATE INDEX idx_decisions_user_id ON public.decisions(user_id);
CREATE INDEX idx_decisions_agent_run_id ON public.decisions(agent_run_id);
CREATE INDEX idx_tool_executions_user_id ON public.tool_executions(user_id);
CREATE INDEX idx_tool_executions_agent_run_id ON public.tool_executions(agent_run_id);
CREATE INDEX idx_outcomes_user_id ON public.outcomes(user_id);
CREATE INDEX idx_outcomes_agent_run_id ON public.outcomes(agent_run_id);

-- Updated at triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER profiles_updated_at BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER objectives_updated_at BEFORE UPDATE ON public.objectives
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER plans_updated_at BEFORE UPDATE ON public.plans
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER agent_runs_updated_at BEFORE UPDATE ON public.agent_runs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER outcomes_updated_at BEFORE UPDATE ON public.outcomes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.objectives ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agent_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.decisions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tool_executions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.outcomes ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Users can only access their own data
CREATE POLICY "profiles_select_own" ON public.profiles FOR SELECT
    USING (auth.uid() = id);
CREATE POLICY "profiles_insert_own" ON public.profiles FOR INSERT
    WITH CHECK (auth.uid() = id);
CREATE POLICY "profiles_update_own" ON public.profiles FOR UPDATE
    USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

CREATE POLICY "objectives_select_own" ON public.objectives FOR SELECT
    USING (auth.uid() = user_id);
CREATE POLICY "objectives_insert_own" ON public.objectives FOR INSERT
    WITH CHECK (auth.uid() = user_id);
CREATE POLICY "objectives_update_own" ON public.objectives FOR UPDATE
    USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "objectives_delete_own" ON public.objectives FOR DELETE
    USING (auth.uid() = user_id);

CREATE POLICY "plans_select_own" ON public.plans FOR SELECT
    USING (auth.uid() = user_id);
CREATE POLICY "plans_insert_own" ON public.plans FOR INSERT
    WITH CHECK (auth.uid() = user_id);
CREATE POLICY "plans_update_own" ON public.plans FOR UPDATE
    USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "plans_delete_own" ON public.plans FOR DELETE
    USING (auth.uid() = user_id);

CREATE POLICY "agent_runs_select_own" ON public.agent_runs FOR SELECT
    USING (auth.uid() = user_id);
CREATE POLICY "agent_runs_insert_own" ON public.agent_runs FOR INSERT
    WITH CHECK (auth.uid() = user_id);
CREATE POLICY "agent_runs_update_own" ON public.agent_runs FOR UPDATE
    USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "agent_runs_delete_own" ON public.agent_runs FOR DELETE
    USING (auth.uid() = user_id);

CREATE POLICY "decisions_select_own" ON public.decisions FOR SELECT
    USING (auth.uid() = user_id);
CREATE POLICY "decisions_insert_own" ON public.decisions FOR INSERT
    WITH CHECK (auth.uid() = user_id);
CREATE POLICY "decisions_delete_own" ON public.decisions FOR DELETE
    USING (auth.uid() = user_id);

CREATE POLICY "tool_executions_select_own" ON public.tool_executions FOR SELECT
    USING (auth.uid() = user_id);
CREATE POLICY "tool_executions_insert_own" ON public.tool_executions FOR INSERT
    WITH CHECK (auth.uid() = user_id);
CREATE POLICY "tool_executions_update_own" ON public.tool_executions FOR UPDATE
    USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "tool_executions_delete_own" ON public.tool_executions FOR DELETE
    USING (auth.uid() = user_id);

CREATE POLICY "outcomes_select_own" ON public.outcomes FOR SELECT
    USING (auth.uid() = user_id);
CREATE POLICY "outcomes_insert_own" ON public.outcomes FOR INSERT
    WITH CHECK (auth.uid() = user_id);
CREATE POLICY "outcomes_update_own" ON public.outcomes FOR UPDATE
    USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "outcomes_delete_own" ON public.outcomes FOR DELETE
    USING (auth.uid() = user_id);

-- Trigger to auto-create profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, username, display_name)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'username', 
                 split_part(NEW.email, '@', 1) || '_' || substr(NEW.id::text, 1, 8)),
        COALESCE(NEW.raw_user_meta_data->>'display_name', 
                 split_part(NEW.email, '@', 1))
    );
    RETURN NEW;
END;
$$ language 'plpgsql' SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_user();
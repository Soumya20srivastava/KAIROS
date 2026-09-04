import Link from 'next/link';
import { ArrowRight, Bot, BrainCircuit, Gauge, ShieldCheck, Sparkles, Workflow } from 'lucide-react';
import { Button } from '@/components/ui/button';

const features = [
  {
    icon: BrainCircuit,
    title: 'AI planning',
    description: 'Turn business goals into structured plans and execution paths with guided context.',
  },
  {
    icon: Workflow,
    title: 'Multi-step execution',
    description: 'Coordinate agent runs, decisions, and tool use across a complete automation workflow.',
  },
  {
    icon: Gauge,
    title: 'Operational visibility',
    description: 'Track objective health, run progress, failed steps, and recent activity in real time.',
  },
  {
    icon: ShieldCheck,
    title: 'Safe by default',
    description: 'Keep your automation constrained to approved workflows and user-scoped execution.',
  },
];

export default function HomePage() {
  return (
    <main className="min-h-screen text-foreground">
      <div className="mx-auto flex min-h-screen max-w-7xl flex-col px-5 py-6 sm:px-6 lg:px-10">
        <header className="flex items-center justify-between border-b border-primary/20 pb-4 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <div className="relative flex h-11 w-11 items-center justify-center rounded-xl border border-primary/50 bg-gradient-to-br from-primary via-red-700 to-secondary text-lg font-black text-white shadow-[0_0_25px_rgba(96,11,18,0.55)]">
              <span className="font-orbitron tracking-[0.18em]">K</span>
              <span className="absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full bg-red-700 pulse-glow" />
            </div>
            <div>
              <div className="font-orbitron text-xl font-black tracking-[0.24em] text-white cyberpunk-title">KAIROS</div>
            </div>
          </div>

          <nav className="hidden items-center gap-6 text-sm text-muted-foreground md:flex">
            <Link href="#features" className="transition hover:text-white">Features</Link>
            <Link href="#workflow" className="transition hover:text-white">Workflow</Link>
            <Link href="#platform" className="transition hover:text-white">Platform</Link>
          </nav>

          <div className="flex items-center gap-3">
            <Button variant="ghost" asChild className="border border-white/10 bg-white/0 hover:bg-white/5 text-white">
              <Link href="/login">Sign in</Link>
            </Button>
            <Button variant="primary" asChild className="shadow-[0_0_20px_rgba(96,11,18,0.45)] hover:shadow-[0_0_28px_rgba(96,11,18,0.7)]">
              <Link href="/register">Create account</Link>
            </Button>
          </div>
        </header>

        <section className="grid flex-1 items-center gap-10 py-14 lg:grid-cols-[1.15fr_0.85fr] lg:py-20">
          <div>
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/40 bg-primary/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.28em] text-red-500 shadow-[0_0_20px_rgba(96,11,18,0.2)]">
              <Sparkles className="h-3.5 w-3.5" />
              AI automation platform
            </div>

            <h1 className="max-w-xl font-orbitron text-4xl font-black tracking-[-0.04em] text-white md:text-6xl cyberpunk-title">
              Turn work into <span className="text-gradient-red">structured</span> intelligent action.
            </h1>

            <p className="mt-6 max-w-xl text-lg leading-8 text-zinc-300">
              KAIROS converts objectives into plans, agent runs, tool execution, and measurable outcomes with a brutally clean control layer for modern operations.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Button variant="primary" size="lg" asChild className="min-w-[170px] shadow-[0_0_24px_rgba(96,11,18,0.6)] hover:shadow-[0_0_32px_rgba(96,11,18,0.8)]">
                <Link href="/register" className="flex items-center">
                  Start free
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button variant="outline" size="lg" asChild className="border-white/10 bg-white/0 text-white hover:bg-white/5">
                <Link href="/login">View dashboard</Link>
              </Button>
            </div>

            <div className="mt-10 flex flex-wrap gap-6 text-sm text-zinc-300">
              <div className="flex items-center gap-2">
                <Bot className="h-4 w-4 text-red-400" />
                Agent-driven workflows
              </div>
              <div className="flex items-center gap-2">
                <Workflow className="h-4 w-4 text-red-400" />
                Planning + execution
              </div>
              <div className="flex items-center gap-2">
                <Gauge className="h-4 w-4 text-red-400" />
                Live operational metrics
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="absolute inset-0 -z-10 rounded-[2rem] bg-gradient-to-br from-red-900/25 via-red-950/20 to-transparent blur-3xl" />
            <div className="cyberpunk-card rounded-[2rem] p-5 shadow-[0_0_30px_rgba(96,11,18,0.12)] sm:p-6">
              <div className="rounded-2xl border border-primary/20 bg-[#14090c]/90 p-5">
                <div className="mb-5 flex items-center justify-between">
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.28em] text-red-500">Mission control</p>
                    <h2 className="mt-2 font-orbitron text-2xl font-black tracking-tight text-white">Operational layer</h2>
                  </div>
                  <div className="rounded-full border border-emerald-500/40 bg-emerald-500/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-emerald-300 shadow-[0_0_14px_rgba(16,185,129,0.3)]">
                    Live
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="rounded-xl border border-red-700/20 bg-red-900/5 p-4">
                    <div className="flex items-center justify-between text-sm text-zinc-300">
                      <span>Objective queue</span>
                      <span className="text-red-500">Ready</span>
                    </div>
                    <div className="mt-2 text-lg font-semibold text-white">Strategy builds from your goals</div>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    {[
                      ['Plan', 'Structured execution'],
                      ['Runs', 'Triggered on demand'],
                      ['Decisions', 'Human-aware routing'],
                      ['Signals', 'Operational feedback'],
                    ].map(([label, value]) => (
                      <div key={label} className="rounded-xl border border-white/10 bg-white/5 p-3">
                        <p className="text-[10px] uppercase tracking-[0.18em] text-zinc-400">{label}</p>
                        <p className="mt-2 text-sm font-medium text-zinc-100">{value}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="features" className="pb-16">
          <div className="mb-8 text-center">
            <p className="text-xs uppercase tracking-[0.32em] text-red-500">Core capabilities</p>
            <h2 className="mt-3 font-orbitron text-3xl font-black tracking-tight text-white cyberpunk-title">Built to orchestrate real work</h2>
          </div>

          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {features.map(({ icon: Icon, title, description }) => (
              <div key={title} className="cyberpunk-card rounded-2xl p-5 transition duration-300 hover:-translate-y-1 hover:border-red-400/50 hover:shadow-[0_0_25px_rgba(255,60,80,0.18)]">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl border border-red-700/25 bg-red-700/10 text-red-500 shadow-[0_0_18px_rgba(96,11,18,0.18)]">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-semibold text-white">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-zinc-300">{description}</p>
              </div>
            ))}
          </div>
        </section>

        <section id="workflow" className="pb-20">
          <div className="cyberpunk-card rounded-3xl p-6 md:p-8">
            <div className="mb-8 text-center">
              <p className="text-xs uppercase tracking-[0.32em] text-red-500">Workflow</p>
              <h2 className="mt-3 font-orbitron text-3xl font-black tracking-tight text-white cyberpunk-title">From objective to outcome</h2>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
              {[
                ['01', 'Define objective', 'Capture the goal, context, constraints, and decision scope.'],
                ['02', 'Plan execution', 'Transform intent into structured steps, priorities, and agent tasks.'],
                ['03', 'Monitor outcomes', 'Watch runs, decisions, and tools execute with transparent reporting.'],
              ].map(([step, title, description]) => (
                <div key={step} className="rounded-2xl border border-white/10 bg-black/20 p-5">
                  <div className="text-sm font-medium uppercase tracking-[0.22em] text-red-500">{step}</div>
                  <h3 className="mt-3 text-xl font-semibold text-white">{title}</h3>
                  <p className="mt-2 text-sm leading-6 text-zinc-300">{description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

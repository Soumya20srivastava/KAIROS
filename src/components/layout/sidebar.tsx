// Sidebar Component
'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { useUser } from '@/stores/auth';

const navSections = [
  {
    title: 'MAIN',
    items: [
      { href: '/dashboard', label: 'Dashboard', icon: '📊' },
      { href: '/plans', label: 'Plans', icon: '📋' },
      { href: '/decisions', label: 'Decisions', icon: '🎯' },
      { href: '/runs', label: 'Agent Runs', icon: '⚡' },
    ],
  },
  {
    title: 'TOOLS & EVAL',
    items: [
      { href: '/tools', label: 'Tools', icon: '🔧' },
      { href: '/evaluations', label: 'Evaluations', icon: '📈' },
    ],
  },
  {
    title: 'SYSTEM',
    items: [
      { href: '/settings', label: 'Settings', icon: '⚙️' },
    ],
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const user = useUser();

  if (!user) return null;

  return (
    <aside className="fixed left-0 top-16 bottom-0 w-64 border-r border-border bg-card/30 backdrop-blur-sm hidden md:block">
      <div className="flex h-full flex-col">
        {/* System Status */}
        <div className="p-4">
          <div className="nerv-panel p-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-techno text-muted-foreground tracking-wider">
                SYSTEM STATUS
              </span>
              <span className="status-indicator" />
            </div>
            <div className="mt-2 space-y-1">
              <div className="flex justify-between text-[10px] font-techno">
                <span className="text-muted-foreground">MCP</span>
                <span className="text-neon-cyan">ONLINE</span>
              </div>
              <div className="flex justify-between text-[10px] font-techno">
                <span className="text-muted-foreground">LLM</span>
                <span className="text-neon-cyan">READY</span>
              </div>
              <div className="flex justify-between text-[10px] font-techno">
                <span className="text-muted-foreground">DB</span>
                <span className="text-neon-cyan">CONNECTED</span>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 space-y-4">
          {navSections.map((section) => (
            <div key={section.title}>
              <p className="px-3 mb-1.5 text-[10px] font-techno font-medium text-muted-foreground tracking-wider">
                {section.title}
              </p>
              <div className="space-y-0.5">
                {section.items.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-all duration-200',
                        isActive
                          ? 'text-primary bg-primary/10 border border-primary/30'
                          : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                      )}
                    >
                      <span className="text-base">{item.icon}</span>
                      <span>{item.label}</span>
                      {isActive && (
                        <span className="ml-auto h-1.5 w-1.5 rounded-full bg-neon-cyan pulse-glow" />
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Footer */}
        <div className="p-3 border-t border-border">
          <p className="px-3 text-[10px] font-techno text-muted-foreground">
            KAIROS v1.0.0
          </p>
          <p className="px-3 text-[10px] font-techno text-muted-foreground">
            © 2026 NERV Systems
          </p>
        </div>
      </div>
    </aside>
  );
}
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, FileSpreadsheet, GitBranch, Users, MessageSquare, Moon, Sun } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTheme } from '@/contexts/ThemeContext';

interface NavItem {
  id: string;
  label: string;
  icon: React.ElementType;
  path: string;
  badge?: number;
}

const navigation: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, path: '/' },
  { id: 'event-logs', label: 'Event Logs', icon: FileSpreadsheet, path: '/event-logs' },
  { id: 'process-map', label: 'Process Map', icon: GitBranch, path: '/process-map' },
  { id: 'user-segments', label: 'User Segments', icon: Users, path: '/user-segments' },
  { id: 'interviews', label: 'AI Interviews', icon: MessageSquare, path: '/interviews' },
];

export function Sidebar() {
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="w-60 bg-surface-1 border-r border-surface-3 flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-surface-3">
        <h1 className="text-xl font-bold text-accent-blue">
          ROAI
        </h1>
        <p className="text-xs text-muted mt-1">Return on AI</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {navigation.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;

          return (
            <Link
              key={item.id}
              to={item.path}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors relative',
                isActive
                  ? 'bg-accent-blue/10 text-accent-blue before:absolute before:left-0 before:top-1 before:bottom-1 before:w-1 before:bg-accent-blue before:rounded-r'
                  : 'text-muted hover:bg-surface-2 hover:text-foreground'
              )}
            >
              <Icon className="w-5 h-5" />
              <span>{item.label}</span>
              {item.badge && (
                <span className="ml-auto bg-accent-rose text-white text-xs rounded-full px-2 py-0.5">
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-surface-3">
        <button
          onClick={toggleTheme}
          className="flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium text-muted hover:bg-surface-2 hover:text-foreground w-full transition-colors"
        >
          {theme === 'dark' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
          <span>{theme === 'dark' ? 'Dark Mode' : 'Light Mode'}</span>
        </button>
      </div>
    </div>
  );
}

import { NavLink, Outlet } from 'react-router-dom';
import { WORKSPACE_TABS } from '../../utils/workspaces';

const tabClass = ({ isActive }) =>
  `whitespace-nowrap rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
    isActive
      ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300'
      : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-gray-800'
  }`;

// Shared shell for a workspace: a secondary tab row; pages render below with
// their own containers untouched.
export default function WorkspaceLayout({ workspace, title, extraTabs = [] }) {
  const tabs = [...(WORKSPACE_TABS[workspace] || []), ...extraTabs];
  return (
    <>
      <div className="border-b border-gray-200/70 bg-white/50 dark:border-gray-800/70 dark:bg-gray-950/50 print:hidden">
        <div className="mx-auto flex max-w-5xl items-center gap-3 overflow-x-auto px-4 py-2">
          <span className="hidden shrink-0 text-sm font-bold sm:block">{title}</span>
          <div className="flex gap-1">
            {tabs.map((t) => (
              <NavLink key={t.to} to={t.to} end={t.end} className={tabClass}>
                {t.label}
              </NavLink>
            ))}
          </div>
        </div>
      </div>
      <Outlet />
    </>
  );
}

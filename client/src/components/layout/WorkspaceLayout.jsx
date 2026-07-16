import { NavLink, Outlet } from 'react-router-dom';
import { WORKSPACE_TABS } from '../../utils/workspaces';
import { CONTAINER } from '../common/motion';

// Underline tabs (GitHub / Stripe style): the active page reads through a
// crisp indicator and text weight, not a colored pill.
const tabClass = ({ isActive }) =>
  `whitespace-nowrap border-b-2 px-3 py-2.5 text-sm transition-colors duration-150 ${
    isActive
      ? 'border-indigo-500 font-semibold text-gray-900 dark:text-gray-100'
      : 'border-transparent font-medium text-gray-500 hover:border-gray-300 hover:text-gray-900 dark:text-gray-400 dark:hover:border-gray-700 dark:hover:text-gray-100'
  }`;

// Shared shell for a workspace: a secondary tab row, then the page. The row
// shares CONTAINER with <Page>, so a tab sits directly above the content it
// labels instead of floating on a wider measure.
export default function WorkspaceLayout({ workspace, title, extraTabs = [] }) {
  const tabs = [...(WORKSPACE_TABS[workspace] || []), ...extraTabs];
  return (
    <>
      <div className="border-b border-gray-200/70 bg-gray-50/80 dark:border-gray-800/70 dark:bg-gray-950/80 print:hidden">
        <div className={`scroll-ios flex items-center gap-3 overflow-x-auto ${CONTAINER}`}>
          <span className="hidden shrink-0 text-sm font-semibold text-gray-900 dark:text-gray-100 sm:block">{title}</span>
          <div className="flex">
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

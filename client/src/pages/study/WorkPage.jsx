import useViewSwitch from '../../hooks/useViewSwitch';
import AssignmentsPage from './AssignmentsPage';
import ProjectsPage from './ProjectsPage';

// "Work" = everything a student owes: assignments and group projects.
export default function WorkPage() {
  const { active, switcher } = useViewSwitch(
    [
      { key: 'assignments', label: 'Assignments' },
      { key: 'projects', label: 'Projects' },
    ],
    'assignments'
  );

  return (
    <>
      {switcher}
      {active === 'projects' ? <ProjectsPage /> : <AssignmentsPage />}
    </>
  );
}

import useViewSwitch from '../../hooks/useViewSwitch';
import AlbumsListPage from '../AlbumsListPage';
import EntertainmentPage from '../EntertainmentPage';

// "Memories" = the batch's shared history: photo albums + the nostalgia archive.
export default function MemoriesPage() {
  const { active, switcher } = useViewSwitch(
    [
      { key: 'gallery', label: 'Gallery' },
      { key: 'archive', label: 'Archive' },
    ],
    'gallery'
  );

  return (
    <>
      {switcher}
      {active === 'archive' ? <EntertainmentPage /> : <AlbumsListPage />}
    </>
  );
}

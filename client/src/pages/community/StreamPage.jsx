import useViewSwitch from '../../hooks/useViewSwitch';
import FeedPage from './FeedPage';
import DiscussionsPage from './DiscussionsPage';

// One social stream: the feed, with long-form discussions as a second view.
export default function StreamPage() {
  const { active, switcher } = useViewSwitch(
    [
      { key: 'feed', label: 'Feed' },
      { key: 'discussions', label: 'Discussions' },
    ],
    'feed'
  );

  return (
    <>
      {switcher}
      {active === 'discussions' ? <DiscussionsPage /> : <FeedPage />}
    </>
  );
}

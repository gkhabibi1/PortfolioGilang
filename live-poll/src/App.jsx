import React, { useState, useEffect } from 'react';
import PollManager from './pages/PollManager';
import PresentationView from './pages/PresentationView';
import StudentVoteView from './pages/StudentVoteView';

export default function App() {
  const [route, setRoute] = useState({ page: 'dashboard', pollId: null });

  // Parsing URL: Hash, Query Params, & Pathname (/dashboard, /host, /vote)
  useEffect(() => {
    function resolveRoute() {
      const pathname = window.location.pathname.toLowerCase();
      const hash = window.location.hash.replace(/^#\/?/, '');
      const hashParts = hash.split('/').filter(Boolean);
      const urlParams = new URLSearchParams(window.location.search);
      const queryPollId = urlParams.get('id') || urlParams.get('poll') || null;

      // 1. Cek Rute Vote
      if (
        pathname.includes('/vote') ||
        hashParts[0] === 'vote' ||
        urlParams.get('view') === 'vote'
      ) {
        const idFromPath = pathname.match(/\/vote\/([a-zA-Z0-9_-]+)/)?.[1];
        const idFromHash = hashParts[0] === 'vote' ? hashParts[1] : null;
        const targetId = queryPollId || idFromPath || idFromHash || 'demo-poll-01';
        setRoute({ page: 'vote', pollId: targetId });
        return;
      }

      // 2. Cek Rute Host / Presentation
      if (
        pathname.includes('/host') ||
        pathname.includes('/presentation') ||
        hashParts[0] === 'presentation' ||
        hashParts[0] === 'host' ||
        urlParams.get('view') === 'host' ||
        urlParams.get('view') === 'presentation'
      ) {
        const idFromPath = pathname.match(/\/(?:host|presentation)\/([a-zA-Z0-9_-]+)/)?.[1];
        const idFromHash = (hashParts[0] === 'presentation' || hashParts[0] === 'host') ? hashParts[1] : null;
        const targetId = queryPollId || idFromPath || idFromHash || 'demo-poll-01';
        setRoute({ page: 'presentation', pollId: targetId });
        return;
      }

      // 3. Default: Dashboard Pengelola
      setRoute({ page: 'dashboard', pollId: null });
    }

    resolveRoute();
    window.addEventListener('hashchange', resolveRoute);
    window.addEventListener('popstate', resolveRoute);
    return () => {
      window.removeEventListener('hashchange', resolveRoute);
      window.removeEventListener('popstate', resolveRoute);
    };
  }, []);

  const navigate = (page, pollId) => {
    if (page === 'dashboard') {
      window.location.hash = '';
      setRoute({ page: 'dashboard', pollId: null });
    } else if (page === 'presentation') {
      window.location.hash = `/presentation/${pollId}`;
      setRoute({ page: 'presentation', pollId });
    } else if (page === 'vote') {
      window.location.hash = `/vote/${pollId}`;
      setRoute({ page: 'vote', pollId });
    }
  };

  if (route.page === 'presentation' && route.pollId) {
    return <PresentationView pollId={route.pollId} onNavigate={navigate} />;
  }

  if (route.page === 'vote' && route.pollId) {
    return <StudentVoteView pollId={route.pollId} onNavigate={navigate} />;
  }

  return <PollManager onNavigate={navigate} />;
}

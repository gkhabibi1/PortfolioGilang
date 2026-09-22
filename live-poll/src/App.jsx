import React, { useState, useEffect } from 'react';
import PollManager from './pages/PollManager';
import PresentationView from './pages/PresentationView';
import StudentVoteView from './pages/StudentVoteView';

export default function App() {
  const [route, setRoute] = useState({ page: 'dashboard', pollId: null });

  // Parsing URL Hash: e.g. #/presentation/xyz or #/vote/xyz
  useEffect(() => {
    function parseHash() {
      const hash = window.location.hash.replace(/^#\/?/, '');
      const parts = hash.split('/').filter(Boolean);

      if (parts[0] === 'presentation' && parts[1]) {
        setRoute({ page: 'presentation', pollId: parts[1] });
      } else if (parts[0] === 'vote' && parts[1]) {
        setRoute({ page: 'vote', pollId: parts[1] });
      } else {
        setRoute({ page: 'dashboard', pollId: null });
      }
    }

    parseHash();
    window.addEventListener('hashchange', parseHash);
    return () => window.removeEventListener('hashchange', parseHash);
  }, []);

  const navigate = (page, pollId) => {
    if (page === 'dashboard') {
      window.location.hash = '';
    } else if (page === 'presentation') {
      window.location.hash = `/presentation/${pollId}`;
    } else if (page === 'vote') {
      window.location.hash = `/vote/${pollId}`;
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

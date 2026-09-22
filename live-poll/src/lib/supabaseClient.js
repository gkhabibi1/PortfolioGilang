import { createClient } from '@supabase/supabase-js';

// Baca dari Vite ENV atau fallback Next.js ENV
const rawUrl = (import.meta.env?.VITE_SUPABASE_URL || import.meta.env?.NEXT_PUBLIC_SUPABASE_URL || '').trim();
const rawKey = (import.meta.env?.VITE_SUPABASE_ANON_KEY || import.meta.env?.NEXT_PUBLIC_SUPABASE_ANON_KEY || '').trim();

export const isSupabaseConfigured = Boolean(
  rawUrl &&
  rawKey &&
  rawUrl.startsWith('http') &&
  !rawUrl.includes('your-project-id') &&
  rawKey.length > 20
);

// Fallback Mock In-Memory Store & BroadcastChannel for seamless local offline testing
const LOCAL_STORAGE_KEY_POLLS = 'livepoll_mock_polls';
const LOCAL_STORAGE_KEY_VOTES = 'livepoll_mock_votes';

const DEFAULT_POLLS = [
  {
    id: 'demo-poll-01',
    title: 'Polling Kuliah Web Development',
    question: 'Framework frontend apa yang paling ingin Anda kuasai di tahun 2025?',
    is_active: true,
    created_at: new Date().toISOString(),
    options: [
      { id: 'opt-1', poll_id: 'demo-poll-01', text: 'React.js / Next.js', order_index: 1 },
      { id: 'opt-2', poll_id: 'demo-poll-01', text: 'Vue.js / Nuxt.js', order_index: 2 },
      { id: 'opt-3', poll_id: 'demo-poll-01', text: 'Svelte / SvelteKit', order_index: 3 },
      { id: 'opt-4', poll_id: 'demo-poll-01', text: 'Vanilla JS & Web Standards', order_index: 4 },
    ]
  }
];

function getStoredPolls() {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY_POLLS);
    if (!raw) {
      localStorage.setItem(LOCAL_STORAGE_KEY_POLLS, JSON.stringify(DEFAULT_POLLS));
      return DEFAULT_POLLS;
    }
    return JSON.parse(raw);
  } catch {
    return DEFAULT_POLLS;
  }
}

function getStoredVotes(pollId) {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY_VOTES);
    const all = raw ? JSON.parse(raw) : [];
    return pollId ? all.filter(v => v.poll_id === pollId) : all;
  } catch {
    return [];
  }
}

function addStoredVote(vote) {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY_VOTES);
    const all = raw ? JSON.parse(raw) : [];
    all.push(vote);
    localStorage.setItem(LOCAL_STORAGE_KEY_VOTES, JSON.stringify(all));
  } catch (e) {
    console.error(e);
  }
}

// Simulasi Supabase Client jika belum ada kredensial Supabase Cloud
function createMockClient() {
  const presenceRooms = new Map();

  return {
    from: (table) => {
      return {
        select: (columns = '*') => {
          let currentPollId = null;
          let isSingle = false;

          const queryObj = {
            eq: (field, val) => {
              if (field === 'id' || field === 'poll_id') {
                currentPollId = val;
              }
              return queryObj;
            },
            order: () => queryObj,
            single: async () => {
              isSingle = true;
              return queryObj.then((res) => ({ data: res.data?.[0] || null, error: null }));
            },
            then: (resolve) => {
              const polls = getStoredPolls();
              if (table === 'polls') {
                const filtered = currentPollId ? polls.filter(p => p.id === currentPollId) : polls;
                resolve({ data: isSingle ? (filtered[0] || null) : filtered, error: null });
              } else if (table === 'poll_options') {
                const poll = polls.find(p => p.id === currentPollId) || polls[0];
                resolve({ data: poll ? poll.options : [], error: null });
              } else if (table === 'poll_votes') {
                const votes = getStoredVotes(currentPollId);
                resolve({ data: votes, error: null });
              } else {
                resolve({ data: [], error: null });
              }
            }
          };
          return queryObj;
        },
        insert: async (data) => {
          if (table === 'poll_votes') {
            const row = {
              id: 'vote-' + Math.random().toString(36).substring(2, 9),
              created_at: new Date().toISOString(),
              ...data
            };
            addStoredVote(row);

            // Broadcast via BroadcastChannel
            const bc = new BroadcastChannel(`poll_room_${data.poll_id}`);
            bc.postMessage({ type: 'NEW_VOTE', payload: row });
            setTimeout(() => bc.close(), 100);

            return { data: [row], error: null };
          }
          if (table === 'polls') {
            const polls = getStoredPolls();
            const newPoll = {
              id: data.id || 'poll-' + Math.random().toString(36).substring(2, 9),
              title: data.title,
              question: data.question,
              is_active: true,
              created_at: new Date().toISOString(),
              options: []
            };
            polls.unshift(newPoll);
            localStorage.setItem(LOCAL_STORAGE_KEY_POLLS, JSON.stringify(polls));
            return { data: [newPoll], error: null };
          }
          if (table === 'poll_options') {
            const polls = getStoredPolls();
            const poll = polls.find(p => p.id === data.poll_id);
            if (poll) {
              const opt = {
                id: 'opt-' + Math.random().toString(36).substring(2, 9),
                ...data
              };
              poll.options = poll.options || [];
              poll.options.push(opt);
              localStorage.setItem(LOCAL_STORAGE_KEY_POLLS, JSON.stringify(polls));
              return { data: [opt], error: null };
            }
          }
          return { data: null, error: null };
        }
      };
    },

    channel: (channelName) => {
      const bc = new BroadcastChannel(channelName);
      const callbacks = {
        postgres_changes: [],
        presence_sync: []
      };

      if (!presenceRooms.has(channelName)) {
        presenceRooms.set(channelName, new Map());
      }
      const roomPresence = presenceRooms.get(channelName);
      let myTrackId = null;

      bc.onmessage = (event) => {
        const msg = event.data;
        if (msg.type === 'NEW_VOTE') {
          callbacks.postgres_changes.forEach(cb => cb({ new: msg.payload }));
        } else if (msg.type === 'PRESENCE_JOIN') {
          roomPresence.set(msg.trackId, msg.data);
          callbacks.presence_sync.forEach(cb => cb());
        } else if (msg.type === 'PRESENCE_LEAVE') {
          roomPresence.delete(msg.trackId);
          callbacks.presence_sync.forEach(cb => cb());
        }
      };

      const channelObj = {
        on: (type, filterOrOpts, handler) => {
          const fn = typeof filterOrOpts === 'function' ? filterOrOpts : handler;
          if (type === 'postgres_changes') {
            callbacks.postgres_changes.push(fn);
          } else if (type === 'presence') {
            callbacks.presence_sync.push(fn);
          }
          return channelObj;
        },
        presenceState: () => {
          const result = {};
          roomPresence.forEach((val, key) => {
            result[key] = [val];
          });
          return result;
        },
        track: async (presenceData) => {
          myTrackId = 'user_' + Math.random().toString(36).substring(2, 9);
          roomPresence.set(myTrackId, presenceData);
          callbacks.presence_sync.forEach(cb => cb());
          bc.postMessage({ type: 'PRESENCE_JOIN', trackId: myTrackId, data: presenceData });
          return 'ok';
        },
        subscribe: (cb) => {
          if (cb) setTimeout(() => cb('SUBSCRIBED'), 10);
          return channelObj;
        },
        unsubscribe: () => {
          if (myTrackId) {
            bc.postMessage({ type: 'PRESENCE_LEAVE', trackId: myTrackId });
            roomPresence.delete(myTrackId);
          }
          bc.close();
        }
      };
      return channelObj;
    },

    removeChannel: (channel) => {
      if (channel && channel.unsubscribe) {
        channel.unsubscribe();
      }
    }
  };
}

// Inisialisasi Supabase Asli jika URL dan Key valid, atau mock jika kosong
export const supabase = isConfiguredRealSupabase(rawUrl, rawKey)
  ? createClient(rawUrl, rawKey)
  : createMockClient();

function isConfiguredRealSupabase(url, key) {
  return Boolean(
    url &&
    key &&
    url.startsWith('https://') &&
    !url.includes('your-project-id') &&
    key.length > 25
  );
}

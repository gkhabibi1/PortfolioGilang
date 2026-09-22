import { createClient } from '@supabase/supabase-js';

// Baca dari Vite ENV atau fallback Next.js ENV
const rawUrl = (import.meta.env?.VITE_SUPABASE_URL || import.meta.env?.NEXT_PUBLIC_SUPABASE_URL || '').trim();
const rawKey = (import.meta.env?.VITE_SUPABASE_ANON_KEY || import.meta.env?.NEXT_PUBLIC_SUPABASE_ANON_KEY || '').trim();

export const isSupabaseConfigured = Boolean(
  rawUrl &&
  rawKey &&
  rawUrl.startsWith('https://') &&
  !rawUrl.includes('your-project-id') &&
  rawKey.length > 25
);

// Fallback Mock Store & BroadcastChannel
const LOCAL_STORAGE_KEY_POLLS = 'livepoll_mock_polls';
const LOCAL_STORAGE_KEY_OPTIONS = 'livepoll_mock_options';
const LOCAL_STORAGE_KEY_VOTES = 'livepoll_mock_votes';

const DEFAULT_POLLS = [
  {
    id: 'demo-poll-01',
    title: 'Polling Kuliah Web Development',
    question: 'Framework frontend apa yang paling ingin Anda kuasai di tahun 2025?',
    is_active: true,
    created_at: new Date().toISOString()
  }
];

const DEFAULT_OPTIONS = [
  { id: 'opt-1', poll_id: 'demo-poll-01', text: 'React.js / Next.js', order_index: 1 },
  { id: 'opt-2', poll_id: 'demo-poll-01', text: 'Vue.js / Nuxt.js', order_index: 2 },
  { id: 'opt-3', poll_id: 'demo-poll-01', text: 'Svelte / SvelteKit', order_index: 3 },
  { id: 'opt-4', poll_id: 'demo-poll-01', text: 'Vanilla JS & Web Standards', order_index: 4 }
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

function getStoredOptions(pollId) {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY_OPTIONS);
    let all = raw ? JSON.parse(raw) : null;
    if (!all) {
      all = DEFAULT_OPTIONS;
      localStorage.setItem(LOCAL_STORAGE_KEY_OPTIONS, JSON.stringify(all));
    }
    return pollId ? all.filter(o => o.poll_id === pollId) : all;
  } catch {
    return DEFAULT_OPTIONS;
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
              if (table === 'polls') {
                const polls = getStoredPolls();
                const filtered = currentPollId ? polls.filter(p => p.id === currentPollId) : polls;
                resolve({ data: isSingle ? (filtered[0] || null) : filtered, error: null });
              } else if (table === 'poll_options') {
                const options = getStoredOptions(currentPollId);
                resolve({ data: options, error: null });
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

        insert: (data) => {
          const items = Array.isArray(data) ? data : [data];
          let createdRows = [];

          if (table === 'poll_votes') {
            createdRows = items.map(item => ({
              id: item.id || 'vote-' + Math.random().toString(36).substring(2, 9),
              created_at: new Date().toISOString(),
              ...item
            }));
            createdRows.forEach(row => {
              addStoredVote(row);
              const bc = new BroadcastChannel(`poll_room_${row.poll_id}`);
              bc.postMessage({ type: 'NEW_VOTE', payload: row });
              setTimeout(() => bc.close(), 100);
            });
          } else if (table === 'polls') {
            const polls = getStoredPolls();
            createdRows = items.map(item => ({
              id: item.id || 'poll-' + Math.random().toString(36).substring(2, 9),
              title: item.title,
              question: item.question,
              is_active: true,
              created_at: new Date().toISOString()
            }));
            createdRows.forEach(row => polls.unshift(row));
            localStorage.setItem(LOCAL_STORAGE_KEY_POLLS, JSON.stringify(polls));
          } else if (table === 'poll_options') {
            const allOpts = getStoredOptions();
            createdRows = items.map(item => ({
              id: item.id || 'opt-' + Math.random().toString(36).substring(2, 9),
              ...item
            }));
            createdRows.forEach(row => allOpts.push(row));
            localStorage.setItem(LOCAL_STORAGE_KEY_OPTIONS, JSON.stringify(allOpts));
          }

          const insertResult = {
            data: createdRows,
            error: null,
            select: () => Promise.resolve({ data: createdRows, error: null }),
            then: (resolve) => resolve({ data: createdRows, error: null })
          };

          return insertResult;
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

import { Post, AngerEvent, Category, PostWithAnger } from '../types';

const STORAGE_KEY_POSTS = 'angry_web_posts';
const STORAGE_KEY_EVENTS = 'angry_web_events';
const STORAGE_KEY_DEVICE = 'angry_web_device_id';

// Utility to generate random alphanumeric ID
const generateId = (length: number = 6) => {
  return Math.random().toString(36).substring(2, 2 + length).toUpperCase();
};

// Ensure persistent device hash
export const getDeviceHash = (): string => {
  let hash = localStorage.getItem(STORAGE_KEY_DEVICE);
  if (!hash) {
    hash = crypto.randomUUID();
    localStorage.setItem(STORAGE_KEY_DEVICE, hash);
  }
  return hash;
};

// Simulated DB operations
export const db = {
  getPosts: async (deviceHash: string): Promise<PostWithAnger[]> => {
    const posts: Post[] = JSON.parse(localStorage.getItem(STORAGE_KEY_POSTS) || '[]');
    const events: AngerEvent[] = JSON.parse(localStorage.getItem(STORAGE_KEY_EVENTS) || '[]');
    
    return posts.map(post => ({
      ...post,
      anger_count: events.filter(e => e.post_id === post.id).length,
      has_angered: events.some(e => e.post_id === post.id && e.device_hash === deviceHash)
    }));
  },

  createPost: async (content: string, category: Category, deviceHash: string, countryCode: string = 'UN'): Promise<Post> => {
    const posts: Post[] = JSON.parse(localStorage.getItem(STORAGE_KEY_POSTS) || '[]');
    const newPost: Post = {
      id: crypto.randomUUID(),
      content,
      category,
      temp_username: generateId(6),
      device_hash: deviceHash,
      country_code: countryCode,
      created_at: Date.now()
    };
    posts.unshift(newPost);
    localStorage.setItem(STORAGE_KEY_POSTS, JSON.stringify(posts));
    return newPost;
  },

  addAnger: async (postId: string, deviceHash: string, countryCode: string = 'US'): Promise<void> => {
    const events: AngerEvent[] = JSON.parse(localStorage.getItem(STORAGE_KEY_EVENTS) || '[]');
    
    // Check if device already angered
    if (events.some(e => e.post_id === postId && e.device_hash === deviceHash)) {
      return;
    }

    const newEvent: AngerEvent = {
      id: crypto.randomUUID(),
      post_id: postId,
      device_hash: deviceHash,
      country_code: countryCode,
      created_at: Date.now()
    };
    events.push(newEvent);
    localStorage.setItem(STORAGE_KEY_EVENTS, JSON.stringify(events));
  },

  getAllDataForExport: () => {
    const posts = localStorage.getItem(STORAGE_KEY_POSTS) || '[]';
    const events = localStorage.getItem(STORAGE_KEY_EVENTS) || '[]';
    return { posts: JSON.parse(posts), events: JSON.parse(events) };
  }
};
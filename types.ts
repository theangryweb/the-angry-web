export type Category = 'Life' | 'Politics' | 'Tech' | 'Sports' | 'Culture' | 'Fashion' | 'Food';

export interface Post {
  id: string;
  content: string;
  category: Category;
  temp_username: string;
  device_hash: string;
  country_code: string;
  created_at: number;
}

export interface AngerEvent {
  id: string;
  post_id: string;
  device_hash: string;
  country_code: string;
  created_at: number;
}

export interface PostWithAnger extends Post {
  anger_count: number;
  has_angered: boolean;
}
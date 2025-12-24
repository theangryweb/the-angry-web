import React from 'react';
import { PostWithAnger } from '../types';

interface PostCardProps {
  post: PostWithAnger;
  isAngriest: boolean;
  onAnger: (id: string) => void;
}

export const PostCard: React.FC<PostCardProps> = ({ post, isAngriest, onAnger }) => {
  const formattedDate = new Date(post.created_at).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  return (
    <div 
      className={`p-6 md:p-8 mb-8 transition-all border relative ${
        isAngriest ? 'angriest-highlight' : 'bg-black border-zinc-900'
      }`}
    >
      {isAngriest && (
        <div className="absolute -top-3 left-6 bg-red-600 text-white px-3 py-1 text-xs font-bold uppercase tracking-widest">
          Top-Tier Rage
        </div>
      )}
      
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <span className="px-2 py-0.5 bg-zinc-900 text-[10px] font-bold uppercase tracking-wider text-zinc-300 border border-zinc-800">
            {post.category}
          </span>
          <span className="text-[10px] text-zinc-400 font-mono uppercase tracking-widest">
            {post.temp_username}
          </span>
        </div>
        <span className="text-[10px] text-zinc-400">
          {formattedDate}
        </span>
      </div>

      <p className="text-xl md:text-2xl leading-relaxed text-zinc-100 mb-8 whitespace-pre-wrap">
        {post.content}
      </p>

      <div className="flex items-center gap-4">
        <button
          onClick={() => !post.has_angered && onAnger(post.id)}
          disabled={post.has_angered}
          className={`flex items-center gap-2 px-6 py-2 border transition-all ${
            post.has_angered
              ? 'bg-zinc-900 text-zinc-600 border-zinc-800 cursor-default opacity-50'
              : 'bg-transparent text-red-500 border-red-900 hover:border-red-600 hover:bg-red-950 active:scale-95'
          }`}
        >
          <span className="text-xl">🔥</span>
          <span className="font-bold uppercase tracking-tight">Valid</span>
          <span className="ml-2 px-2 py-0.5 bg-red-900/30 text-red-500 rounded-full text-sm">
            {post.anger_count}
          </span>
        </button>
        
        {post.has_angered && (
          <span className="text-[10px] text-zinc-400 italic">One validation per post, sorry not sorry</span>
        )}
      </div>
    </div>
  );
};
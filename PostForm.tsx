import React, { useState } from 'react';
import { Category } from '../types';

interface PostFormProps {
  onSubmit: (content: string, category: Category) => void;
}

const CATEGORIES: Category[] = ['Life', 'Politics', 'Tech', 'Sports', 'Culture', 'Fashion', 'Food'];

export const PostForm: React.FC<PostFormProps> = ({ onSubmit }) => {
  const [content, setContent] = useState('');
  const [category, setCategory] = useState<Category>('Life');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;
    onSubmit(content, category);
    setContent('');
  };

  return (
    <form onSubmit={handleSubmit} className="mb-12 space-y-4">
      <div className="flex flex-col relative">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="VENT, RANT, RAVE IT ALL"
          className="w-full min-h-[160px] p-4 text-xl bg-zinc-900 text-white border border-zinc-800 rounded-none focus:outline-none focus:border-red-600 transition-colors resize-none placeholder-zinc-600"
          required
        />
        <div className="absolute bottom-2 right-4 text-[9px] text-zinc-700 uppercase tracking-widest font-mono">
          Country location detected automatically
        </div>
      </div>
      
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setCategory(cat)}
              className={`px-3 py-1 text-sm border transition-all ${
                category === cat 
                  ? 'bg-white text-black border-white' 
                  : 'bg-black text-zinc-400 border-zinc-800 hover:border-zinc-600'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
        
        <button
          type="submit"
          disabled={!content.trim()}
          className="px-8 py-3 bg-red-600 text-white font-bold hover:bg-red-700 disabled:opacity-30 disabled:cursor-not-allowed transition-all uppercase tracking-widest text-xs"
        >
          POST ANGER
        </button>
      </div>
    </form>
  );
};
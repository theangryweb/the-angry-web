import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { db, getDeviceHash } from './services/db';
import { PostWithAnger, Category } from './types';
import { PostForm } from './components/PostForm';
import { PostCard } from './components/PostCard';
import { GoogleGenAI } from "@google/genai";

const App: React.FC = () => {
  const [posts, setPosts] = useState<PostWithAnger[]>([]);
  const [loading, setLoading] = useState(true);
  const [country, setCountry] = useState('UN');
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const deviceHash = useMemo(() => getDeviceHash(), []);

  const generateInsight = useCallback(async (currentPosts: PostWithAnger[]) => {
    if (currentPosts.length === 0) {
      setAiAnalysis("The Web is currently silent. No anger to digest.");
      return;
    }
    
    setIsAnalyzing(true);
    setAiAnalysis(null);
    
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const topStories = currentPosts.slice(0, 5).map(p => `[${p.category}] ${p.content}`).join('\n---\n');
    
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Analyze these recent angry stories from "The Angry Web" and provide a one-sentence, punchy, cynical summary of the collective mood. Do not use corporate speak. Be raw and sociological.\n\nStories:\n${topStories}`,
      });
      setAiAnalysis(response.text || "silence is golden, but anger is louder.");
    } catch (err) {
      setAiAnalysis("The web is too angry to be analyzed right now.");
    } finally {
      setIsAnalyzing(false);
    }
  }, []);

  const fetchData = async () => {
    const data = await db.getPosts(deviceHash);
    const sorted = [...data].sort((a, b) => {
      const isAIn24h = Date.now() - a.created_at < 86400000;
      const isBIn24h = Date.now() - b.created_at < 86400000;
      if (isAIn24h && !isBIn24h) return -1;
      if (!isAIn24h && isBIn24h) return 1;
      if (b.anger_count !== a.anger_count) return b.anger_count - a.anger_count;
      return b.created_at - a.created_at;
    });
    setPosts(sorted);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
    fetch('https://ipapi.co/json/')
      .then(res => res.json())
      .then(data => setCountry(data.country_code || 'UN'))
      .catch(() => setCountry('UN'));
  }, []);

  const handlePostSubmit = async (content: string, category: Category) => {
    await db.createPost(content, category, deviceHash, country);
    fetchData();
  };

  const handleAnger = async (postId: string) => {
    await db.addAnger(postId, deviceHash, country);
    fetchData();
  };

  const exportCSV = () => {
    const headers = ['Country Code', 'Time of Post', '# of Rages', 'Author ID', 'Content'];
    const rows = posts.map(p => [
      p.country_code || 'UN',
      new Date(p.created_at).toISOString(),
      p.anger_count,
      p.temp_username,
      `"${p.content.replace(/"/g, '""')}"`
    ]);

    const csvContent = [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `the_angry_web_data_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const angriestId = posts.length > 0 ? posts[0].id : null;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 md:py-32 bg-black min-h-screen text-white">
      <header className="mb-16 md:mb-28 flex flex-col items-center justify-center text-center">
        {/* Container for Title + Logo: always side-by-side (flex-row) */}
        <div className="flex flex-row items-center justify-center gap-[2vw] md:gap-10 w-full">
          {/* h1 uses vw for smallest screens to ensure it never overflows horizontally */}
          <h1 className="text-[7.5vw] sm:text-5xl md:text-7xl lg:text-[6.5rem] font-extrabold tracking-tighter text-white leading-[0.85] whitespace-nowrap">
            THE ANGRY WEB
          </h1>
          <img 
            src="logo.png" 
            alt="The Angry Web Logo" 
            className="h-[7.5vw] sm:h-12 md:h-20 lg:h-24 w-auto object-contain shrink-0"
            onError={(e) => {
              const img = e.currentTarget;
              img.style.display = 'none';
              const parent = img.parentElement;
              if (parent) {
                const placeholder = document.createElement('div');
                placeholder.className = "flex items-center justify-center border border-zinc-800 h-[7.5vw] w-[15vw] sm:h-12 sm:w-24 md:h-20 md:w-40 lg:h-24 lg:w-48 text-[1.5vw] sm:text-[10px] text-zinc-600 uppercase tracking-widest shrink-0";
                placeholder.innerText = "Logo here";
                parent.appendChild(placeholder);
              }
            }}
          />
        </div>
        <p className="text-zinc-500 font-medium tracking-[0.05em] uppercase text-[2.5vw] sm:text-[10px] md:text-xl mt-4 md:mt-6 opacity-80">
          “SILENCE IS GOLDEN, BUT ANGER IS LOUDER.”
        </p>
      </header>

      <section className="mb-20 max-w-3xl mx-auto">
        <h3 className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-4">Add to the noise</h3>
        <PostForm onSubmit={handlePostSubmit} />
      </section>

      <main className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-8 pb-4 border-b border-zinc-900">
          <h2 className="text-sm font-bold uppercase tracking-widest text-zinc-300">
            The Web ({posts.length})
          </h2>
          <button 
            onClick={exportCSV}
            className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 hover:text-white transition-colors"
          >
            Export Dataset
          </button>
        </div>

        {loading ? (
          <div className="py-24 text-center text-zinc-400 font-mono text-xs uppercase tracking-widest animate-pulse">
            Detecting your Country location to index the rage...
          </div>
        ) : (
          <div>
            {posts.length > 0 ? (
              posts.map((post) => (
                <PostCard 
                  key={post.id} 
                  post={post} 
                  isAngriest={post.id === angriestId && post.anger_count > 0} 
                  onAnger={handleAnger}
                />
              ))
            ) : (
              <div className="py-24 text-center border border-dashed border-zinc-800">
                <p className="text-zinc-400 font-medium italic">The internet is suspiciously calm.</p>
              </div>
            )}
          </div>
        )}

        <div className="mt-20 mb-20">
          {!aiAnalysis && !isAnalyzing ? (
            <button
              onClick={() => generateInsight(posts)}
              className="w-full bg-red-600 hover:bg-red-700 text-white py-6 md:py-8 text-xl md:text-3xl font-black uppercase tracking-widest shadow-xl transform active:scale-[0.98] transition-all"
            >
              Rage Calculator
            </button>
          ) : (
            <div className="p-6 md:p-10 bg-zinc-900 text-white border-l-8 border-red-600">
              <div className="flex justify-between items-start mb-4">
                <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-red-500">The Result</span>
                <button 
                  onClick={() => generateInsight(posts)}
                  className="text-[10px] uppercase font-bold text-zinc-400 hover:text-white underline underline-offset-4"
                >
                  Recalculate
                </button>
              </div>
              {isAnalyzing ? (
                <div className="space-y-2 animate-pulse">
                  <div className="h-4 bg-zinc-800 w-3/4"></div>
                  <div className="h-4 bg-zinc-800 w-1/2"></div>
                </div>
              ) : (
                <p className="text-lg md:text-xl font-medium italic leading-relaxed">
                  "{aiAnalysis}"
                </p>
              )}
            </div>
          )}
        </div>
      </main>

      <footer className="mt-32 pb-12 text-center text-zinc-400 text-[9px] uppercase tracking-[0.3em] leading-loose">
        <div className="flex justify-center gap-4 mb-4">
          <span className="w-8 h-[1px] bg-zinc-900 self-center"></span>
          <span>Anonymous Public Experiment</span>
          <span className="w-8 h-[1px] bg-zinc-900 self-center"></span>
        </div>
        <p>&copy; {new Date().getFullYear()} THE ANGRY WEB</p>
        <p className="mt-1">Indexed by Country location for the raw data of human emotion.</p>
      </footer>
    </div>
  );
};

export default App;
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Newspaper, ChevronLeft, ChevronRight, ExternalLink, RefreshCw, Clock } from 'lucide-react';

export default function NewsPage() {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const articlesPerPage = 5;
  const maxPages = 10;

  const fetchNews = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/news', { cache: 'no-store' });
      const data = await response.json();
      setNews(data.slice(0, articlesPerPage * maxPages));
    } catch (error) {
      console.error('Error fetching news:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNews();
  }, []);

  const totalPages = Math.min(maxPages, Math.ceil(news.length / articlesPerPage));
  const currentArticles = news.slice(currentPage * articlesPerPage, (currentPage + 1) * articlesPerPage);

  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-LB', { 
        day: 'numeric', 
        month: 'short', 
        year: 'numeric' 
      });
    } catch (e) {
      return dateString;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto space-y-12 pb-20 px-4"
    >
      {/* Header */}
      <div className="text-center space-y-4">
        <h2 className="text-4xl lg:text-6xl font-serif tracking-tight">FMCG <span className="italic font-normal text-stone-400 text-5xl lg:text-7xl">News.</span></h2>
        <p className="text-lg text-stone-500 font-medium max-w-xl mx-auto">
          The latest from Lebanon's retail, supermarket, and convenience sectors.
        </p>
      </div>

      <div className="flex justify-between items-center bg-stone-50 p-4 rounded-3xl border border-stone-100">
        <div className="flex items-center space-x-3">
          <Newspaper className="text-amber-500" size={20} />
          <span className="text-xs font-black uppercase tracking-widest text-stone-400">Live Feed</span>
        </div>
        <button 
          onClick={fetchNews}
          disabled={loading}
          className="p-2 hover:bg-white rounded-full transition-all text-stone-400 hover:text-stone-900 border border-transparent hover:border-stone-200"
        >
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>

      <div className="space-y-6">
        {loading ? (
          Array(5).fill(0).map((_, i) => (
            <div key={i} className="bg-white p-8 rounded-[2rem] border border-stone-100 shadow-sm animate-pulse space-y-4">
              <div className="h-4 bg-stone-100 rounded-full w-3/4"></div>
              <div className="h-3 bg-stone-50 rounded-full w-full"></div>
              <div className="h-3 bg-stone-50 rounded-full w-1/2"></div>
            </div>
          ))
        ) : news.length > 0 ? (
          <AnimatePresence mode="wait">
            <motion.div
              key={currentPage}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              {currentArticles.map((article, idx) => (
                <article
                  key={idx}
                  className="group bg-white p-6 rounded-[2rem] border border-stone-100 shadow-sm hover:shadow-xl hover:border-amber-200 transition-all duration-500 relative overflow-hidden flex gap-5 items-start"
                >
                  <div className="absolute top-0 right-0 p-6 text-stone-50 group-hover:text-amber-50 transition-colors">
                    <Newspaper size={72} strokeWidth={0.5} />
                  </div>

                  {/* Place photo */}
                  {article.photoUrl && (
                    <div className="flex-shrink-0 w-20 h-20 rounded-2xl overflow-hidden border border-stone-100 shadow-sm mt-1">
                      <img
                        src={article.photoUrl}
                        alt=""
                        className="w-full h-full object-cover"
                        onError={e => { e.currentTarget.parentElement.style.display = 'none'; }}
                      />
                    </div>
                  )}

                  <div className="relative z-10 space-y-3 flex-1 min-w-0">
                    <div className="flex items-center space-x-3 text-stone-400">
                      <Clock size={14} />
                      <span className="text-[10px] font-black uppercase tracking-widest">{formatDate(article.pubDate)}</span>
                    </div>

                    <h3 className="text-xl font-bold text-stone-800 leading-tight group-hover:text-amber-600 transition-colors">
                      {article.title}
                    </h3>

                    <p className="text-stone-500 leading-relaxed text-sm line-clamp-3">
                      {article.contentSnippet}
                    </p>

                    <div className="pt-2 flex items-center justify-between">
                      <a
                        href={article.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center space-x-2 text-xs font-black uppercase tracking-widest text-stone-900 group-hover:text-amber-600 border-b-2 border-stone-100 group-hover:border-amber-200 pb-1 transition-all"
                      >
                        <span>Read Article</span>
                        <ExternalLink size={12} />
                      </a>
                    </div>
                  </div>
                </article>
              ))}
            </motion.div>
          </AnimatePresence>
        ) : (
          <div className="text-center py-20 bg-stone-50 rounded-[4rem] border-2 border-dashed border-stone-100">
            <Newspaper size={40} className="mx-auto text-stone-200 mb-6" />
            <p className="text-stone-400 font-medium italic">No news available at the moment.</p>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center space-x-8 pt-8">
          <button
            onClick={() => setCurrentPage(prev => Math.max(0, prev - 1))}
            disabled={currentPage === 0}
            className={`p-4 rounded-2xl border transition-all ${currentPage === 0 ? 'border-transparent text-stone-200' : 'border-stone-100 text-stone-400 hover:bg-stone-900 hover:text-white hover:shadow-xl shadow-sm bg-white'}`}
          >
            <ChevronLeft size={20} />
          </button>
          
          <div className="flex items-center space-x-2">
            {[...Array(totalPages)].map((_, i) => (
              <div 
                key={i} 
                className={`w-1.5 h-1.5 rounded-full transition-all duration-500 ${currentPage === i ? 'bg-amber-500 w-8' : 'bg-stone-200'}`}
              />
            ))}
          </div>

          <button
            onClick={() => setCurrentPage(prev => Math.min(totalPages - 1, prev + 1))}
            disabled={currentPage === totalPages - 1}
            className={`p-4 rounded-2xl border transition-all ${currentPage === totalPages - 1 ? 'border-transparent text-stone-200' : 'border-stone-100 text-stone-400 hover:bg-stone-900 hover:text-white hover:shadow-xl shadow-sm bg-white'}`}
          >
            <ChevronRight size={20} />
          </button>
        </div>
      )}
    </motion.div>
  );
}

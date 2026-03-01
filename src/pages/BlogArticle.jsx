import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Calendar, Clock, Share2, Tag as TagIcon, 
  Facebook, Twitter, Linkedin, Link as LinkIcon, Loader2
} from 'lucide-react';
import { Navbar } from '../components/sections/Navbar';
import { useTheme } from '../context/ThemeContext';
import apiClient from '../api/client'; // 👈 Import your API client

export const BlogArticle = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isCopied, setIsCopied] = useState(false);
  const [error, setError] = useState('');

  // --- API FETCH LOGIC ---
  useEffect(() => {
    const fetchArticle = async () => {
      setLoading(true);
      try {
        const response = await apiClient.get(`/blogs/${slug}`);
        setPost(response.data);
      } catch (err) {
        console.error("Failed to load article:", err);
        setError("Article not found or unavailable.");
      } finally {
        setLoading(false);
      }
    };

    fetchArticle();
  }, [slug]);

  // --- SHARE FUNCTIONALITY ---
  const currentUrl = window.location.href;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(currentUrl);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleSocialShare = (platform) => {
    let shareUrl = '';
    const text = encodeURIComponent(`Check out this article: ${post?.title}`);
    const url = encodeURIComponent(currentUrl);

    switch (platform) {
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${url}`;
        break;
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?url=${url}&text=${text}`;
        break;
      case 'linkedin':
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${url}`;
        break;
      default:
        return;
    }
    
    // Open in a small popup window
    window.open(shareUrl, `${platform}-share`, 'width=600,height=400');
  };

  // --- LOADING & ERROR STATES ---
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center transition-colors duration-300">
        <Loader2 size={48} className="animate-spin text-orange-500 mb-4" />
        <p className="text-slate-500 dark:text-slate-400 font-medium">Loading article...</p>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center transition-colors duration-300">
        <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-4">{error}</h2>
        <button onClick={() => navigate('/blog')} className="text-orange-600 font-bold hover:underline">
          Return to Blog
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 transition-colors duration-300">
      <Navbar theme={theme} setTheme={toggleTheme} />

      <main className="pt-24 pb-20">
        
        {/* --- ARTICLE HEADER --- */}
        <header className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-10">
          <button onClick={() => navigate('/blog')} className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-orange-600 dark:text-slate-400 dark:hover:text-orange-500 transition-colors mb-8">
            <ArrowLeft size={16} /> Back to Blog
          </button>

          <div className="flex items-center gap-3 mb-6">
            <span className="px-3 py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 rounded-full text-xs font-bold uppercase tracking-wider border border-orange-200 dark:border-orange-800">
              {post.category}
            </span>
            <span className="flex items-center gap-1 text-xs font-bold text-slate-400 dark:text-slate-500">
              <Clock size={14} /> {post.readTime || '5 min read'}
            </span>
          </div>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-black text-slate-900 dark:text-white leading-[1.15] mb-8">
            {post.title}
          </h1>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 border-b border-slate-200 dark:border-slate-800 pb-8">
            <div className="flex items-center gap-4">
              <img src={post.author?.avatar || 'https://via.placeholder.com/150'} alt={post.author?.name} className="w-12 h-12 rounded-full border-2 border-slate-100 dark:border-slate-800 object-cover" />
              <div>
                <p className="font-bold text-slate-900 dark:text-white text-base leading-tight">{post.author?.name || 'Admin'}</p>
                {post.author?.role && <p className="text-sm text-slate-500 dark:text-slate-400">{post.author.role}</p>}
              </div>
            </div>
            
            <div className="flex items-center gap-6 text-sm font-medium text-slate-500 dark:text-slate-400">
              <span className="flex items-center gap-1.5">
                <Calendar size={16}/> 
                {new Date(post.publishedAt || post.createdAt).toLocaleDateString('en-IN', { month: 'long', day: 'numeric', year: 'numeric' })}
              </span>
              
              {/* Header Share Button */}
              <button onClick={handleCopyLink} className="hover:text-orange-500 transition-colors relative flex items-center gap-1" title="Copy Link">
                <Share2 size={18} />
                {isCopied && <span className="absolute -top-8 -left-4 bg-slate-800 text-white text-[10px] px-2 py-1 rounded">Copied!</span>}
              </button>
            </div>
          </div>
        </header>

        {/* --- FEATURED IMAGE --- */}
        {post.featuredImage && (
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mb-12">
            <img 
              src={post.featuredImage} 
              alt={post.title} 
              className="w-full h-auto max-h-[600px] object-cover rounded-3xl shadow-xl shadow-slate-200/50 dark:shadow-none"
            />
          </div>
        )}

        {/* --- ARTICLE BODY (Rich Text Content) --- */}
        <article 
          className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 blog-content"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />

        {/* --- ARTICLE FOOTER (Tags & Share) --- */}
        <footer className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 mt-16 pt-8 border-t border-slate-200 dark:border-slate-800">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            
            {/* Tags */}
            <div className="flex flex-wrap items-center gap-2">
              <TagIcon size={18} className="text-slate-400 mr-1" />
              {post.tags && post.tags.length > 0 ? post.tags.map((tag, idx) => (
                <span key={idx} className="bg-slate-100 dark:bg-slate-800/50 text-slate-600 dark:text-slate-300 px-3 py-1 rounded-lg text-sm font-medium border border-slate-200 dark:border-slate-700 hover:border-orange-300 transition-colors cursor-pointer">
                  #{tag}
                </span>
              )) : (
                <span className="text-sm text-slate-400">No tags</span>
              )}
            </div>

            {/* Social Share Buttons */}
            <div className="flex items-center gap-3">
              <span className="text-sm font-bold text-slate-500 mr-2">Share:</span>
              <button onClick={() => handleSocialShare('facebook')} className="w-10 h-10 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-[#1877F2] hover:text-white transition-colors">
                <Facebook size={18}/>
              </button>
              <button onClick={() => handleSocialShare('twitter')} className="w-10 h-10 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-[#1DA1F2] hover:text-white transition-colors">
                <Twitter size={18}/>
              </button>
              <button onClick={() => handleSocialShare('linkedin')} className="w-10 h-10 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-[#0A66C2] hover:text-white transition-colors">
                <Linkedin size={18}/>
              </button>
              <button onClick={handleCopyLink} className="relative w-10 h-10 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-orange-500 hover:text-white transition-colors">
                <LinkIcon size={18}/>
                {isCopied && <span className="absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] px-2 py-1 rounded">Copied!</span>}
              </button>
            </div>
          </div>

          {/* Author Bio Box */}
          <div className="mt-12 bg-slate-50 dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row gap-6 items-center sm:items-start text-center sm:text-left">
            <img src={post.author?.avatar || 'https://via.placeholder.com/150'} alt={post.author?.name} className="w-20 h-20 rounded-full border-4 border-white dark:border-slate-800 shadow-sm object-cover" />
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Written By</p>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">{post.author?.name || 'Admin'}</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed max-w-lg">
                Thank you for reading! We hope you found this article helpful. Check out our other posts for more insights.
              </p>
            </div>
          </div>
        </footer>

      </main>

      {/* --- RICH TEXT SCOPED CSS --- */}
      <style dangerouslySetInnerHTML={{__html: `
        .blog-content {
          font-family: ui-sans-serif, system-ui, sans-serif;
          font-size: 1.125rem; /* 18px */
          line-height: 1.8;
          color: ${theme === 'dark' ? '#cbd5e1' : '#334155'};
        }
        
        .blog-content p {
          margin-bottom: 1.5rem;
        }
        
        .blog-content .lead {
          font-size: 1.25rem;
          color: ${theme === 'dark' ? '#f1f5f9' : '#0f172a'};
          font-weight: 500;
          line-height: 1.6;
          margin-bottom: 2.5rem;
        }

        .blog-content h1, .blog-content h2 {
          font-family: ui-serif, Georgia, serif;
          font-size: 2rem;
          font-weight: 800;
          color: ${theme === 'dark' ? '#ffffff' : '#0f172a'};
          margin-top: 3rem;
          margin-bottom: 1.25rem;
          line-height: 1.3;
        }

        .blog-content h3 {
          font-size: 1.5rem;
          font-weight: 700;
          color: ${theme === 'dark' ? '#f8fafc' : '#1e293b'};
          margin-top: 2.5rem;
          margin-bottom: 1rem;
        }

        .blog-content a {
          color: #f97316; /* orange-500 */
          text-decoration: underline;
          text-underline-offset: 4px;
          font-weight: 600;
          transition: color 0.2s;
        }
        
        .blog-content a:hover {
          color: #ea580c; /* orange-600 */
        }

        .blog-content blockquote {
          border-left: 4px solid #f97316;
          padding-left: 1.5rem;
          margin: 2.5rem 0;
          font-style: italic;
          font-size: 1.35rem;
          color: ${theme === 'dark' ? '#e2e8f0' : '#475569'};
          background: ${theme === 'dark' ? 'rgba(15, 23, 42, 0.5)' : '#f8fafc'};
          padding: 1.5rem;
          border-radius: 0 1rem 1rem 0;
        }

        .blog-content ul {
          list-style-type: disc;
          padding-left: 1.5rem;
          margin-bottom: 1.5rem;
        }
        
        .blog-content ol {
          list-style-type: decimal;
          padding-left: 1.5rem;
          margin-bottom: 1.5rem;
        }

        .blog-content li {
          margin-bottom: 0.5rem;
        }

        .blog-content img {
          width: 100%;
          border-radius: 1rem;
          margin-top: 2.5rem;
          margin-bottom: 1rem;
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
        }
        
        .blog-content figcaption {
          text-align: center;
          font-size: 0.875rem;
          color: ${theme === 'dark' ? '#94a3b8' : '#64748b'};
          margin-bottom: 2.5rem;
        }

        .blog-content .video-container {
          position: relative;
          padding-bottom: 56.25%; /* 16:9 Aspect Ratio */
          height: 0;
          overflow: hidden;
          border-radius: 1rem;
          margin: 2.5rem 0;
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
        }
        
        .blog-content .video-container iframe {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
        }

        .blog-content .audio-player {
          margin: 2rem 0;
          background: ${theme === 'dark' ? '#1e293b' : '#f1f5f9'};
          padding: 1rem;
          border-radius: 1rem;
          border: 1px solid ${theme === 'dark' ? '#334155' : '#e2e8f0'};
        }
        
        .blog-content audio {
          width: 100%;
          height: 40px;
          outline: none;
        }
      `}} />
    </div>
  );
};
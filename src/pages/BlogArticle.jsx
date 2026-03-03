import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
  ArrowLeft, Calendar, Share2, Tag as TagIcon, 
  Facebook, Twitter, Linkedin, Link as LinkIcon, Loader2, MessageCircle, ThumbsUp
} from 'lucide-react';
import { Navbar } from '../components/sections/Navbar';
import { useTheme } from '../context/ThemeContext';
import { AuthContext } from '../context/AuthContext'; // To get logged-in user for comments
import apiClient from '../api/client';

export const BlogArticle = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { theme, toggleTheme } = useTheme();
  const { user } = useContext(AuthContext); // Optional: Check if user is logged in to comment/like
  
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Real API Interaction States
  const [likesCount, setLikesCount] = useState(0);
  const [hasLiked, setHasLiked] = useState(false);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  
  const [isCopied, setIsCopied] = useState(false);

  // --- API FETCH & SEO LOGIC ---
  useEffect(() => {
    const fetchArticle = async () => {
      setLoading(true);
      try {
        const response = await apiClient.get(`/blogs/${slug}`);
        const articleData = response.data;
        setPost(articleData);
        
        // Initialize interactive states from real data
        setLikesCount(articleData.likes || 0);
        setComments(articleData.comments || []);
        // If your API returns whether the current user liked it:
        // setHasLiked(articleData.hasLikedByUser || false);

        // --- DYNAMIC SEO INJECTION ---
        document.title = `${articleData.title} | SahakarStree`;
        
        let metaDesc = document.querySelector('meta[name="description"]');
        if (!metaDesc) {
          metaDesc = document.createElement('meta');
          metaDesc.name = "description";
          document.head.appendChild(metaDesc);
        }
        metaDesc.content = articleData.excerpt || articleData.title;

      } catch (err) {
        console.error("Failed to load article:", err);
        setError("Article not found or unavailable.");
      } finally {
        setLoading(false);
      }
    };

    fetchArticle();
    return () => { document.title = 'SahakarStree'; };
  }, [slug]);

  // --- GOOGLE TRANSLATE INJECTION ---
  useEffect(() => {
    if (!window.googleTranslateElementInit) {
      window.googleTranslateElementInit = () => {
        new window.google.translate.TranslateElement(
          { pageLanguage: 'en', layout: window.google.translate.TranslateElement.InlineLayout.SIMPLE },
          'google_translate_element'
        );
      };
      const script = document.createElement('script');
      script.src = "//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
      script.async = true;
      document.body.appendChild(script);
    }
  }, []);

  // --- SMART CONTENT PARSER ---
  const parseContent = (htmlContent) => {
    if (!htmlContent) return '';
    return htmlContent.replace(
      /<p>\s*(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})\s*<\/p>/gi,
      '<div class="video-container"><iframe src="https://www.youtube.com/embed/$1" frameborder="0" allowfullscreen></iframe></div>'
    );
  };

  // --- INTERACTIVE ACTIONS (REAL API) ---
  const handleLike = async () => {
    // Optimistic UI update
    const previousHasLiked = hasLiked;
    setHasLiked(!hasLiked);
    setLikesCount(prev => hasLiked ? prev - 1 : prev + 1);

    try {
      // Hit your real backend endpoint to toggle the like
      await apiClient.post(`/blogs/${post._id}/like`);
    } catch (error) {
      // Revert if API fails
      setHasLiked(previousHasLiked);
      setLikesCount(prev => previousHasLiked ? prev + 1 : prev - 1);
      console.error("Failed to toggle like", error);
    }
  };

  const handleCommentSubmit = async () => {
    if (!newComment.trim()) return;
    setIsSubmittingComment(true);
    try {
      // Send comment to your real backend
      const response = await apiClient.post(`/blogs/${post._id}/comments`, { text: newComment });
      
      // Assume backend returns the newly created comment object, or the whole updated list
      const addedComment = response.data.comment || {
        _id: Date.now().toString(),
        user: { name: user?.name || 'Guest User' },
        text: newComment,
        createdAt: new Date().toISOString()
      };
      
      setComments([addedComment, ...comments]);
      setNewComment('');
    } catch (error) {
      console.error("Failed to post comment", error);
      alert(t('blog.commentError', 'Failed to post comment. Please try again.'));
    } finally {
      setIsSubmittingComment(false);
    }
  };

  // --- SHARE FUNCTIONALITY ---
  const currentUrl = window.location.href;

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: post?.title,
          text: post?.excerpt || `Check out this article on SahakarStree`,
          url: currentUrl,
        });
      } catch (err) {
        console.log('Error natively sharing', err);
      }
    } else {
      handleCopyLink();
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(currentUrl);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleSocialShare = (platform) => {
    const text = encodeURIComponent(`Check out this article: ${post?.title}`);
    const url = encodeURIComponent(currentUrl);
    let shareUrl = '';

    switch (platform) {
      case 'facebook': shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${url}`; break;
      case 'twitter': shareUrl = `https://twitter.com/intent/tweet?url=${url}&text=${text}`; break;
      case 'linkedin': shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${url}`; break;
      case 'whatsapp': shareUrl = `https://api.whatsapp.com/send?text=${text}%20${url}`; break;
      default: return;
    }
    window.open(shareUrl, `${platform}-share`, 'width=600,height=400');
  };

  // --- LOADING & ERROR STATES ---
  if (loading) return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center">
      <Loader2 size={48} className="animate-spin text-orange-500 mb-4" />
      <p className="text-slate-500 font-medium">{t('blog.loadingArticle', 'Loading article...')}</p>
    </div>
  );

  if (error || !post) return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center">
      <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-4">{error}</h2>
      <button onClick={() => navigate('/blog')} className="text-orange-600 font-bold hover:underline">
        {t('blog.backToBlog', 'Return to Blog')}
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 transition-colors duration-300">
      <Navbar theme={theme} setTheme={toggleTheme} />

      <main className="pt-20 pb-16">
        
        {/* --- COMPACT HEADER (Medium Style) --- */}
        <header className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-2">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <button onClick={() => navigate('/blog')} className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-orange-600 transition-colors">
              <ArrowLeft size={16} /> {t('blog.backToBlog', 'Back to Blog')}
            </button>
            <div id="google_translate_element" className="scale-90 origin-left sm:origin-right"></div>
          </div>

          <h1 className="text-3xl md:text-5xl font-serif font-black text-slate-900 dark:text-white leading-[1.15] tracking-tight mb-4">
            {post.title}
          </h1>

{/* Combined Author + Actions Row */}
{/* Author + Meta Single Row */}
<div className="flex items-center justify-between border-y border-slate-100 dark:border-slate-800 py-4 mb-8">

  {/* Left Side → Avatar + Author */}
  <div className="flex items-center gap-3">
    <img
      src={post.author?.avatar || 'https://via.placeholder.com/150'}
      alt={post.author?.name}
      className="w-10 h-10 rounded-full object-cover bg-slate-100"
    />

    <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
      {post.author?.name || 'Admin'}
    </p>
  </div>

  {/* Right Side → Read Time + Date */}
  <div className="text-sm text-slate-500 dark:text-slate-400 flex items-center gap-2">
    <span>{post.readTime || '5 min read'}</span>
    <span>·</span>
    <span>
      {new Date(post.publishedAt || post.createdAt).toLocaleDateString(
        t('locale', 'en-IN'),
        { month: 'short', day: 'numeric', year: 'numeric' }
      )}
    </span>
  </div>

</div>

        </header>

        {/* --- CONSTRAINED FEATURED IMAGE --- */}
        {post.featuredImage && (
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 mb-10">
            {post.excerpt && (
              <p className="text-lg md:text-xl text-slate-500 dark:text-slate-400 font-medium mb-6 leading-snug">
                {post.excerpt}
              </p>
            )}          
            <img 
              src={post.featuredImage} 
              alt={post.title} 
              className="w-full aspect-video md:aspect-[2/1] max-h-[450px] object-cover rounded-2xl bg-slate-100"
            />
          </div>
        )}

        {/* --- ARTICLE BODY (Rich Text Content) --- */}
        <article 
          className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 blog-content"
          dangerouslySetInnerHTML={{ __html: parseContent(post.content) }}
        />

        {/* --- ARTICLE FOOTER (Tags) --- */}
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
            <div className="flex flex-wrap items-center gap-2">
              <TagIcon size={16} className="text-slate-400 mr-1" />
              {post.tags && post.tags.length > 0 ? post.tags.map((tag, idx) => (
                <span key={idx} className="bg-slate-100 dark:bg-slate-800/50 text-slate-600 dark:text-slate-300 px-3 py-1 rounded-lg text-xs font-medium border border-slate-200 dark:border-slate-700">
                  #{tag}
                </span>
              )) : null}
            </div>
        </div>

        {/* --- REVIEWS / COMMENTS SECTION (REAL API) --- */}
        <section id="comments" className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 mt-16 pt-8 border-t border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2 mb-6">
            <MessageCircle size={22} className="text-orange-500" />
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{t('blog.commentsTitle', 'Discussion & Reviews')} ({comments.length})</h3>
          </div>

          {/* Add Review Box */}
          <div className="bg-slate-50 dark:bg-slate-900 p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800 mb-8">
            <textarea 
              rows="3"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder={t('blog.addCommentPlaceholder', 'What did you think about this article?')}
              className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 dark:text-white resize-none mb-3"
            ></textarea>
            <div className="flex justify-end">
              <button 
                onClick={handleCommentSubmit}
                disabled={isSubmittingComment || !newComment.trim()}
                className="bg-orange-600 hover:bg-orange-700 disabled:opacity-50 text-white text-sm font-bold px-5 py-2.5 rounded-lg transition-colors flex items-center gap-2"
              >
                {isSubmittingComment && <Loader2 size={14} className="animate-spin" />}
                {t('blog.postComment', 'Post Review')}
              </button>
            </div>
          </div>

          {/* Comments List */}
          <div className="space-y-6">
            {comments.length > 0 ? comments.map((comment, index) => (
              <div key={comment._id || index} className="flex gap-4">
                <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center font-bold text-slate-500 shrink-0 uppercase">
                  {comment.user?.name ? comment.user.name.charAt(0) : 'U'}
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-bold text-slate-900 dark:text-white text-sm">{comment.user?.name || 'Guest User'}</h4>
                    <span className="text-xs text-slate-400">
                      {new Date(comment.createdAt).toLocaleDateString(t('locale', 'en-IN'), { month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                  <p className="text-sm text-slate-600 dark:text-slate-400 whitespace-pre-wrap">{comment.text}</p>
                </div>
              </div>
            )) : (
              <p className="text-slate-500 dark:text-slate-400 text-sm text-center py-6">
                {t('blog.noComments', 'No reviews yet. Be the first to share your thoughts!')}
              </p>
            )}
          </div>
        </section>

      </main>

      {/* --- RICH TEXT SCOPED CSS --- */}
      <style dangerouslySetInnerHTML={{__html: `
        .blog-content {
          font-family: ui-sans-serif, system-ui, sans-serif;
          font-size: 1.125rem; /* 18px */
          line-height: 1.8;
          color: ${theme === 'dark' ? '#cbd5e1' : '#334155'};
        }
        .blog-content p { margin-bottom: 1.5rem; }
        .blog-content h1, .blog-content h2 {
          font-family: ui-serif, Georgia, serif;
          font-size: 1.75rem;
          font-weight: 800;
          color: ${theme === 'dark' ? '#ffffff' : '#0f172a'};
          margin-top: 2.5rem;
          margin-bottom: 1rem;
          line-height: 1.3;
        }
        .blog-content h3 {
          font-size: 1.35rem;
          font-weight: 700;
          color: ${theme === 'dark' ? '#f8fafc' : '#1e293b'};
          margin-top: 2rem;
          margin-bottom: 1rem;
        }
        .blog-content a { color: #f97316; text-decoration: underline; text-underline-offset: 4px; font-weight: 600; }
        .blog-content blockquote {
          border-left: 4px solid #f97316; margin: 2rem 0; font-style: italic; font-size: 1.25rem;
          color: ${theme === 'dark' ? '#e2e8f0' : '#475569'};
          background: ${theme === 'dark' ? 'rgba(15, 23, 42, 0.5)' : '#f8fafc'};
          padding: 1.5rem; border-radius: 0 1rem 1rem 0;
        }

        /* FIX: Images now fully respect rich text resizing & alignment */
        .blog-content img {
          max-width: 100%;
          height: auto;
          display: inline-block;
          border-radius: 0.75rem;
          margin-top: 1rem;
          margin-bottom: 1rem;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }

        .blog-content .video-container {
          position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden;
          border-radius: 1rem; margin: 2rem 0;
        }
        .blog-content .video-container iframe { position: absolute; top: 0; left: 0; width: 100%; height: 100%; }

        body { top: 0 !important; }
        .skiptranslate iframe { display: none !important; }
      `}} />
    </div>
  );
};
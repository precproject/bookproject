import React, { useState, useEffect, useRef } from 'react';
import { Plus, Edit, Trash2, Eye, Loader2, X, Save, Image as ImageIcon  } from 'lucide-react';
import { adminService } from '../../api/service/adminService';
import JoditEditor from 'jodit-react'; // 🔥 The Modern React 19 Alternative
import apiClient from '../../api/client';

export const DashboardBlogs = () => {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const editor = useRef(null); // Required for Jodit
  
  const defaultForm = {
    _id: null, title: '', slug: '', excerpt: '', content: '', featuredImage: '',
    category: 'Technology', tags: '', readTime: '5 min read', authorName: 'Admin', isPublished: true
  };
  const [formData, setFormData] = useState(defaultForm);

  const fetchBlogs = async () => {
    setLoading(true);
    try {
      const response = await adminService.getBlogsAdmin({ limit: 50 });
      setBlogs(response.blogs || []);
    } catch (error) {
      console.error("Failed to fetch blogs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchBlogs(); }, []);

  const handleOpenAdd = () => { setFormData(defaultForm); setIsModalOpen(true); };
  
  const handleOpenEdit = (blog) => {
    setFormData({
      ...blog,
      authorName: blog.author?.name || 'Admin',
      tags: blog.tags?.join(', ') || ''
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this article permanently?")) return;
    try {
      await adminService.deleteBlog(id);
      fetchBlogs();
    } catch (error) {
      alert("Failed to delete.");
    }
  };

    // --- NATIVE IMAGE UPLOADER FOR FEATURED IMAGE ---
  const handleFeaturedImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    setIsUploading(true);
    try {
      const uploadData = new FormData();
      uploadData.append('image', file);
      
      const response = await adminService.uploadImage(uploadData);
      setFormData({ ...formData, featuredImage: response.imageUrl });
    } catch (error) {
      alert("Failed to upload image. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      // AUTO-GENERATE SLUG FROM TITLE
      const generatedSlug = formData.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');  

      const payload = {
        ...formData,
        slug: formData.slug || generatedSlug,
        tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean),
        author: { name: formData.authorName }
      };

      if (formData._id) await adminService.updateBlog(formData._id, payload);
      else await adminService.createBlog(payload);
      
      setIsModalOpen(false);
      fetchBlogs();
    } catch (error) {
      alert(error.response?.data?.message || "Failed to save.");
    } finally {
      setIsSaving(false);
    }
  };


  // --- JODIT EDITOR SECURE BACKEND UPLOAD CONFIG ---
  const editorConfig = {
    height: 500,
    theme: 'default',
    placeholder: 'Start writing your amazing article here...',
    uploader: {
      url: `${apiClient.defaults.baseURL}/upload`, // Connect directly to our secure backend
      format: 'json',
      method: 'POST',
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}` // Pass the admin token
      },
      filesVariableName: 'image',
      isSuccess: function (resp) { return !resp.error; },
      process: function (resp) {
        return {
          files: [resp.imageUrl],
          path: resp.imageUrl,
          baseurl: '',
          error: 0,
          msg: resp.message
        };
      }
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-10">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Blog Manager</h1>
          <p className="text-sm text-slate-500 mt-1">Write, edit, and publish articles.</p>
        </div>
        <button onClick={handleOpenAdd} className="flex items-center gap-2 bg-emerald-800 text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-md hover:bg-emerald-900 transition-all">
          <Plus size={18} /> New Article
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto min-h-[300px]">
          {loading ? (
             <div className="flex justify-center items-center h-64 text-slate-500"><Loader2 className="animate-spin" size={32} /></div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider">
                  <th className="p-4 font-bold border-b">Article</th>
                  <th className="p-4 font-bold border-b">Category / Tags</th>
                  <th className="p-4 font-bold border-b">Status</th>
                  <th className="p-4 font-bold border-b text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {blogs.map((blog) => (
                  <tr key={blog._id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <img src={blog.featuredImage || 'https://via.placeholder.com/50'} className="w-12 h-12 object-cover rounded-lg bg-slate-100" alt=""/>
                        <div>
                          <p className="font-bold text-slate-800 text-sm">{blog.title}</p>
                          <p className="text-xs text-slate-500">{new Date(blog.publishedAt).toLocaleDateString()}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <p className="text-sm font-bold text-slate-700">{blog.category}</p>
                      <p className="text-xs text-slate-500">{blog.tags?.join(', ')}</p>
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded-md text-xs font-bold ${blog.isPublished ? 'bg-emerald-50 text-emerald-700' : 'bg-yellow-50 text-yellow-700'}`}>
                        {blog.isPublished ? 'Published' : 'Draft'}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <button onClick={() => window.open(`/blog/${blog.slug}`, '_blank')} className="p-2 text-slate-400 hover:text-blue-600"><Eye size={16} /></button>
                      <button onClick={() => handleOpenEdit(blog)} className="p-2 text-slate-400 hover:text-emerald-600"><Edit size={16} /></button>
                      <button onClick={() => handleDelete(blog._id)} className="p-2 text-slate-400 hover:text-red-600"><Trash2 size={16} /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Editor Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}></div>
          <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-6xl flex flex-col max-h-[95vh]">
            
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <h2 className="text-xl font-bold">{formData._id ? 'Edit Article' : 'Write Article'}</h2>
              <button onClick={() => setIsModalOpen(false)}><X className="text-slate-400 hover:text-slate-700" /></button>
            </div>

            <form onSubmit={handleSave} className="overflow-y-auto flex-1 p-6 space-y-6 bg-slate-50/50">
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                
                {/* Left: Main Content (Wider for the editor) */}
                <div className="lg:col-span-3 space-y-4">
                  <div>
                    <label className="text-sm font-bold text-slate-700">Article Title</label>
                    <input required type="text" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full p-3 mt-1 border border-slate-200 rounded-xl outline-none focus:border-emerald-500" placeholder="e.g. The Future of Farming" />
                  </div>
                  <div>
                    <label className="text-sm font-bold text-slate-700">Short Excerpt (For display card)</label>
                    <textarea required value={formData.excerpt} onChange={e => setFormData({...formData, excerpt: e.target.value})} className="w-full p-3 mt-1 border border-slate-200 rounded-xl h-20 outline-none focus:border-emerald-500" placeholder="A brief summary..." />
                  </div>
                  <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
                    <label className="text-sm font-bold text-slate-700 p-3 block border-b bg-slate-50">Article Content</label>
                    
                    {/* 🔥 MODERN JODIT EDITOR */}
                    <div className="min-h-[400px]">
                      <JoditEditor
                        ref={editor}
                        value={formData.content}
                        config={editorConfig}
                        onBlur={newContent => setFormData({...formData, content: newContent})}
                        onChange={() => {}} // Keep empty for performance, rely on onBlur
                      />
                    </div>

                  </div>
                </div>

                {/* Right: Settings */}
                <div className="space-y-4">
                  <div className="bg-white p-4 border border-slate-200 rounded-xl shadow-sm">
                    <h3 className="font-bold text-slate-800 mb-3 text-sm">Publishing Details</h3>
                    <label className="text-xs font-bold text-slate-500">Category</label>
                    <select value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className="w-full p-2.5 mt-1 mb-3 border border-slate-200 rounded-lg outline-none">
                      <option>Technology</option><option>Business</option><option>Mindset</option><option>Finance</option>
                    </select>
                    
                    <label className="text-xs font-bold text-slate-500">Author Name</label>
                    <input type="text" value={formData.authorName} onChange={e => setFormData({...formData, authorName: e.target.value})} className="w-full p-2.5 mt-1 mb-3 border border-slate-200 rounded-lg outline-none" />
                    
                    <label className="text-xs font-bold text-slate-500">Read Time</label>
                    <input type="text" value={formData.readTime} onChange={e => setFormData({...formData, readTime: e.target.value})} className="w-full p-2.5 mt-1 mb-3 border border-slate-200 rounded-lg outline-none" placeholder="e.g. 5 min read" />
                    
                    <label className="text-xs font-bold text-slate-500">Tags (comma separated)</label>
                    <input type="text" value={formData.tags} onChange={e => setFormData({...formData, tags: e.target.value})} className="w-full p-2.5 mt-1 mb-3 border border-slate-200 rounded-lg outline-none" placeholder="AI, Farming, Tips" />
                  </div>

                  <div className="bg-white p-4 border border-slate-200 rounded-xl shadow-sm">
                    <h3 className="font-bold text-slate-800 mb-3 text-sm">Featured Image</h3>

                    {formData.featuredImage ? (
                      <div className="relative mb-3">
                        <img src={formData.featuredImage} alt="Preview" className="w-full h-32 object-cover rounded-lg border border-slate-200" />
                        <button type="button" onClick={() => setFormData({...formData, featuredImage: ''})} className="absolute top-2 right-2 bg-white text-red-500 p-1 rounded-md shadow-md hover:bg-red-50">
                          <Trash2 size={14}/>
                        </button>
                      </div>
                    ) : (
                      <div className="border-2 border-dashed border-slate-300 rounded-xl p-4 text-center mb-3 bg-slate-50">
                        {isUploading ? (
                          <div className="flex flex-col items-center text-emerald-600"><Loader2 className="animate-spin mb-2" size={24} /><span className="text-xs font-bold">Uploading...</span></div>
                        ) : (
                          <>
                            <ImageIcon className="mx-auto text-slate-400 mb-2" size={24} />
                            <label className="cursor-pointer text-sm font-bold text-emerald-600 hover:text-emerald-700">
                              Browse File
                              <input type="file" accept="image/*" className="hidden" onChange={handleFeaturedImageUpload} />
                            </label>
                          </>
                        )}
                      </div>
                    )}

                  </div>

                  <div className="bg-white p-4 border border-slate-200 rounded-xl shadow-sm flex justify-between items-center">
                    <span className="font-bold text-sm text-slate-800">Publish Article</span>
                    <input type="checkbox" checked={formData.isPublished} onChange={e => setFormData({...formData, isPublished: e.target.checked})} className="w-5 h-5 accent-emerald-600 cursor-pointer" />
                  </div>
                </div>

              </div>
              
              <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-2.5 border rounded-xl font-bold text-slate-600 hover:bg-slate-50">Cancel</button>
                <button type="submit" disabled={isSaving || !formData.content} className="px-6 py-2.5 bg-emerald-800 text-white rounded-xl font-bold hover:bg-emerald-900 disabled:opacity-50 flex items-center gap-2">
                  {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />} Save Article
                </button>
              </div>
            </form>

          </div>
        </div>
      )}
    </div>
  );
};
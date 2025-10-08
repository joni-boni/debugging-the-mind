import React, { useState, useEffect } from 'react';
import { wordpressService, wordpressHelpers } from '../services/wordpressService';
import { Calendar, User, Tag, MessageCircle } from 'lucide-react';

// BlogPost Komponente für einzelne Posts
export const BlogPost = ({ postId }) => {
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        setLoading(true);
        const postData = await wordpressService.getPost(postId);
        setPost(postData);
      } catch (err) {
        setError('Fehler beim Laden des Posts');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (postId) {
      fetchPost();
    }
  }, [postId]);

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
        {error}
      </div>
    );
  }

  if (!post) return null;

  return (
    <article className="max-w-4xl mx-auto p-6">
      <h1 
        className="text-4xl font-bold text-gray-900 mb-4"
        dangerouslySetInnerHTML={{ __html: post.title.rendered }}
      />
      
      <div className="flex items-center text-gray-600 mb-6 space-x-4">
        <div className="flex items-center">
          <Calendar className="w-4 h-4 mr-2" />
          {wordpressHelpers.formatDate(post.date)}
        </div>
        <div className="flex items-center">
          <User className="w-4 h-4 mr-2" />
          Autor
        </div>
      </div>

      <div 
        className="prose prose-lg max-w-none"
        dangerouslySetInnerHTML={{ __html: post.content.rendered }}
      />
    </article>
  );
};

// BlogList Komponente für Post-Übersicht
export const BlogList = ({ postsPerPage = 6 }) => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoading(true);
        const postsData = await wordpressService.getPosts({
          per_page: postsPerPage,
          page: currentPage,
          _embed: true // Für Featured Images und Autor-Daten
        });
        setPosts(postsData);
      } catch (err) {
        setError('Fehler beim Laden der Posts');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, [currentPage, postsPerPage]);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="bg-white rounded-lg shadow-md p-6 animate-pulse">
            <div className="h-4 bg-gray-200 rounded mb-4"></div>
            <div className="h-4 bg-gray-200 rounded mb-2"></div>
            <div className="h-4 bg-gray-200 rounded mb-4 w-3/4"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 m-6">
        {error}
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <h2 className="text-3xl font-bold text-gray-900 mb-8">Neueste Beiträge</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {posts.map((post) => (
          <div key={post.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
            {/* Featured Image */}
            {wordpressHelpers.getFeaturedImageUrl(post) && (
              <img 
                src={wordpressHelpers.getFeaturedImageUrl(post, 'medium')} 
                alt={post.title.rendered}
                className="w-full h-48 object-cover"
              />
            )}
            
            <div className="p-6">
              <h3 
                className="text-xl font-semibold text-gray-900 mb-3 line-clamp-2"
                dangerouslySetInnerHTML={{ __html: post.title.rendered }}
              />
              
              <p className="text-gray-600 mb-4">
                {post.excerpt.rendered 
                  ? wordpressHelpers.stripHtml(post.excerpt.rendered)
                  : wordpressHelpers.createExcerpt(post.content.rendered, 20)
                }
              </p>
              
              <div className="flex items-center justify-between text-sm text-gray-500">
                <span>{wordpressHelpers.formatDate(post.date)}</span>
                <div className="flex items-center">
                  <MessageCircle className="w-4 h-4 mr-1" />
                  Kommentare
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {/* Pagination */}
      <div className="flex justify-center mt-8 space-x-2">
        <button
          onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
          disabled={currentPage === 1}
          className="px-4 py-2 bg-blue-600 text-white rounded disabled:bg-gray-300"
        >
          Vorherige
        </button>
        <span className="px-4 py-2 bg-gray-100 rounded">
          Seite {currentPage}
        </span>
        <button
          onClick={() => setCurrentPage(prev => prev + 1)}
          className="px-4 py-2 bg-blue-600 text-white rounded"
        >
          Nächste
        </button>
      </div>
    </div>
  );
};

// WordPressPage Komponente für statische Seiten
export const WordPressPage = ({ pageId, slug }) => {
  const [page, setPage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPage = async () => {
      try {
        setLoading(true);
        let pageData;
        
        if (pageId) {
          pageData = await wordpressService.getPage(pageId);
        } else if (slug) {
          // Seite über Slug finden
          const pages = await wordpressService.getPages({ slug });
          pageData = pages[0];
        }
        
        setPage(pageData);
      } catch (err) {
        setError('Fehler beim Laden der Seite');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (pageId || slug) {
      fetchPage();
    }
  }, [pageId, slug]);

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
        {error}
      </div>
    );
  }

  if (!page) return null;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 
        className="text-4xl font-bold text-gray-900 mb-6"
        dangerouslySetInnerHTML={{ __html: page.title.rendered }}
      />
      
      <div 
        className="prose prose-lg max-w-none"
        dangerouslySetInnerHTML={{ __html: page.content.rendered }}
      />
    </div>
  );
};
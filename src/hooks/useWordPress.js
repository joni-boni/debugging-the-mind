import { useState, useEffect } from 'react';
import { wordpressService } from '../services/wordpressService';

// Custom Hook für WordPress Posts
export const useWordPressPosts = (params = {}) => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await wordpressService.getPosts({
        _embed: true,
        ...params
      });
      setPosts(data);
    } catch (err) {
      setError(err.message || 'Fehler beim Laden der Posts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, [JSON.stringify(params)]);

  return { posts, loading, error, refetch: fetchPosts };
};

// Custom Hook für einzelnen WordPress Post
export const useWordPressPost = (postId) => {
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPost = async () => {
      if (!postId) return;
      
      try {
        setLoading(true);
        setError(null);
        const data = await wordpressService.getPost(postId);
        setPost(data);
      } catch (err) {
        setError(err.message || 'Fehler beim Laden des Posts');
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [postId]);

  return { post, loading, error };
};

// Custom Hook für WordPress Pages
export const useWordPressPages = (params = {}) => {
  const [pages, setPages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPages = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await wordpressService.getPages(params);
        setPages(data);
      } catch (err) {
        setError(err.message || 'Fehler beim Laden der Seiten');
      } finally {
        setLoading(false);
      }
    };

    fetchPages();
  }, [JSON.stringify(params)]);

  return { pages, loading, error };
};

// Custom Hook für WordPress Kategorien
export const useWordPressCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await wordpressService.getCategories();
        setCategories(data);
      } catch (err) {
        setError(err.message || 'Fehler beim Laden der Kategorien');
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  return { categories, loading, error };
};

// Custom Hook für WordPress Suche
export const useWordPressSearch = () => {
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const search = async (query, params = {}) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const data = await wordpressService.search(query, params);
      setSearchResults(data);
    } catch (err) {
      setError(err.message || 'Fehler bei der Suche');
    } finally {
      setLoading(false);
    }
  };

  const clearSearch = () => {
    setSearchResults([]);
    setError(null);
  };

  return { 
    searchResults, 
    loading, 
    error, 
    search, 
    clearSearch 
  };
};
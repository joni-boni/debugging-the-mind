import axios from 'axios';

// WordPress API Base URL aus Environment Variable
const WORDPRESS_API_URL = process.env.REACT_APP_WORDPRESS_API_URL || 'http://localhost:8080/wp-json/wp/v2';
const WORDPRESS_CUSTOM_API = process.env.REACT_APP_WORDPRESS_CUSTOM_API || 'http://localhost:8080/wp-json/mindguard/v1';

// Debug-Modus für Entwicklung
const DEBUG_MODE = process.env.REACT_APP_DEBUG_MODE === 'true' || process.env.NODE_ENV === 'development';

// Mock-Daten für Entwicklung/Demo
const MOCK_POSTS = [
  {
    id: 1,
    title: { rendered: 'Fail' },
    content: { rendered: '<p>Entdecken Sie die Zukunft der mentalen Gesundheit mit unserer KI-gestützten Plattform. Wir bieten personalisierte Unterstützung für Ihr Wohlbefinden.</p><p>Unsere Module helfen Ihnen dabei, Stress zu bewältigen, besser zu schlafen und Ihre emotionale Balance zu finden.</p>' },
    excerpt: { rendered: '<p>Entdecken Sie die Zukunft der mentalen Gesundheit mit unserer KI-gestützten Plattform...</p>' },
    date: '2024-10-02T10:00:00',
    link: '#',
    _embedded: {
      'wp:featuredmedia': [{
        source_url: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
        media_details: {
          sizes: {
            medium: {
              source_url: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80'
            }
          }
        }
      }]
    }
  },
  {
    id: 2,
    title: { rendered: 'Die Wissenschaft hinter Achtsamkeit' },
    content: { rendered: '<p>Achtsamkeit ist mehr als nur ein Trend - es ist eine wissenschaftlich belegte Methode zur Verbesserung der mentalen Gesundheit.</p><p>Studien zeigen, dass regelmäßige Achtsamkeitspraxis das Stresslevel reduziert und die Konzentrationsfähigkeit verbessert.</p>' },
    excerpt: { rendered: '<p>Achtsamkeit ist mehr als nur ein Trend - es ist eine wissenschaftlich belegte Methode...</p>' },
    date: '2024-10-01T14:30:00',
    link: '#',
    _embedded: {
      'wp:featuredmedia': [{
        source_url: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
        media_details: {
          sizes: {
            medium: {
              source_url: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80'
            }
          }
        }
      }]
    }
  },
  {
    id: 3,
    title: { rendered: 'Besser schlafen mit KI-Unterstützung' },
    content: { rendered: '<p>Schlafqualität ist ein entscheidender Faktor für die mentale Gesundheit. Unsere KI analysiert Ihre Schlafmuster und gibt personalisierte Empfehlungen.</p><p>Lernen Sie, wie Sie mit einfachen Techniken zu einem erholsameren Schlaf finden.</p>' },
    excerpt: { rendered: '<p>Schlafqualität ist ein entscheidender Faktor für die mentale Gesundheit...</p>' },
    date: '2024-09-30T09:15:00',
    link: '#',
    _embedded: {
      'wp:featuredmedia': [{
        source_url: 'https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
        media_details: {
          sizes: {
            medium: {
              source_url: 'https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80'
            }
          }
        }
      }]
    }
  }
];

// Axios Instance für WordPress API
const wordpressAPI = axios.create({
  baseURL: WORDPRESS_API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// WordPress API Service
export const wordpressService = {
  // Posts abrufen
  getPosts: async (params = {}) => {
    try {
      if (DEBUG_MODE) {
        console.log('Versuche WordPress API zu erreichen:', WORDPRESS_API_URL);
      }
      
      const response = await wordpressAPI.get('/posts', { params });
      
      if (DEBUG_MODE) {
        console.log('WordPress API Antwort erfolgreich:', response.data);
      }
      
      return response.data;
    } catch (error) {
      console.error('Error fetching posts from WordPress:', error.message);
      
      if (DEBUG_MODE) {
        console.log('Verwende Mock-Daten für Demo-Zwecke');
      }
      
      // Fallback auf Mock-Daten wenn WordPress nicht erreichbar ist
      return MOCK_POSTS.slice(0, params.per_page || 10);
    }
  },

  // Einzelnen Post abrufen
  getPost: async (id) => {
    try {
      const response = await wordpressAPI.get(`/posts/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching post from WordPress:', error.message);
      
      // Fallback auf Mock-Daten
      const mockPost = MOCK_POSTS.find(post => post.id === parseInt(id));
      if (mockPost) {
        return mockPost;
      }
      
      throw new Error(`Post mit ID ${id} nicht gefunden`);
    }
  },

  // Pages abrufen
  getPages: async (params = {}) => {
    try {
      const response = await wordpressAPI.get('/pages', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching pages:', error);
      throw error;
    }
  },

  // Einzelne Page abrufen
  getPage: async (id) => {
    try {
      const response = await wordpressAPI.get(`/pages/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching page:', error);
      throw error;
    }
  },

  // Kategorien abrufen
  getCategories: async () => {
    try {
      const response = await wordpressAPI.get('/categories');
      return response.data;
    } catch (error) {
      console.error('Error fetching categories:', error);
      throw error;
    }
  },

  // Tags abrufen
  getTags: async () => {
    try {
      const response = await wordpressAPI.get('/tags');
      return response.data;
    } catch (error) {
      console.error('Error fetching tags:', error);
      throw error;
    }
  },

  // Medien abrufen
  getMedia: async (params = {}) => {
    try {
      const response = await wordpressAPI.get('/media', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching media:', error);
      throw error;
    }
  },

  // Kommentare abrufen
  getComments: async (postId = null) => {
    try {
      const params = postId ? { post: postId } : {};
      const response = await wordpressAPI.get('/comments', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching comments:', error);
      throw error;
    }
  },

  // Benutzerdefinierte Post Types (falls vorhanden)
  getCustomPosts: async (postType, params = {}) => {
    try {
      const response = await wordpressAPI.get(`/${postType}`, { params });
      return response.data;
    } catch (error) {
      console.error(`Error fetching ${postType}:`, error);
      throw error;
    }
  },

  // Suche in WordPress
  search: async (query, params = {}) => {
    try {
      const searchParams = { search: query, ...params };
      const response = await wordpressAPI.get('/search', { params: searchParams });
      return response.data;
    } catch (error) {
      console.error('Error searching:', error);
      throw error;
    }
  }
};

// Hilfsfunktionen für WordPress-Daten
export const wordpressHelpers = {
  // HTML aus WordPress-Content entfernen
  stripHtml: (html) => {
    const tmp = document.createElement('DIV');
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || '';
  },

  // Excerpt erstellen falls nicht vorhanden
  createExcerpt: (content, wordLimit = 20) => {
    const plainText = wordpressHelpers.stripHtml(content);
    const words = plainText.split(' ');
    if (words.length <= wordLimit) return plainText;
    return words.slice(0, wordLimit).join(' ') + '...';
  },

  // Datum formatieren
  formatDate: (dateString) => {
    const options = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    };
    return new Date(dateString).toLocaleDateString('de-DE', options);
  },

  // Featured Image URL extrahieren
  getFeaturedImageUrl: (post, size = 'medium') => {
    if (post._embedded && post._embedded['wp:featuredmedia']) {
      const media = post._embedded['wp:featuredmedia'][0];
      return media.media_details.sizes[size]?.source_url || media.source_url;
    }
    return null;
  }
};

export default wordpressService;
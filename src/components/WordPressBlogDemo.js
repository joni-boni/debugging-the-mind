import React, { useState } from 'react';
import { BlogList, BlogPost, WordPressPage } from './WordPressComponents';
import { useWordPressPosts, useWordPressSearch } from '../hooks/useWordPress';
import { Search, ArrowLeft, Book, Home, AlertCircle, Wifi, WifiOff } from 'lucide-react';

const WordPressBlogDemo = () => {
  const [view, setView] = useState('list'); // 'list', 'post', 'page', 'search'
  const [selectedPostId, setSelectedPostId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  // WordPress Hooks verwenden
  const { posts, loading: postsLoading, error: postsError } = useWordPressPosts({ per_page: 3 });
  const { searchResults, loading: searchLoading, search, error: searchError } = useWordPressSearch();

  // WordPress-Verbindungsstatus
  const isWordPressConnected = !postsError;

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      search(searchQuery);
      setView('search');
    }
  };

  const renderContent = () => {
    switch (view) {
      case 'post':
        return (
          <div>
            <button 
              onClick={() => setView('list')}
              className="flex items-center text-blue-600 hover:text-blue-800 mb-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Zurück zur Übersicht
            </button>
            <BlogPost postId={selectedPostId} />
          </div>
        );
      
      case 'page':
        return (
          <div>
            <button 
              onClick={() => setView('list')}
              className="flex items-center text-blue-600 hover:text-blue-800 mb-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Zurück zur Übersicht
            </button>
            <WordPressPage slug="about" />
          </div>
        );
      
      case 'search':
        return (
          <div>
            <button 
              onClick={() => setView('list')}
              className="flex items-center text-blue-600 hover:text-blue-800 mb-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Zurück zur Übersicht
            </button>
            <h2 className="text-2xl font-bold mb-4">Suchergebnisse für "{searchQuery}"</h2>
            {searchLoading ? (
              <div className="text-center py-8">Suche läuft...</div>
            ) : (
              <div className="space-y-4">
                {searchResults.map((result) => (
                  <div key={result.id} className="bg-white p-4 rounded-lg shadow">
                    <h3 
                      className="text-lg font-semibold text-blue-600 cursor-pointer hover:text-blue-800"
                      onClick={() => {
                        setSelectedPostId(result.id);
                        setView('post');
                      }}
                      dangerouslySetInnerHTML={{ __html: result.title }}
                    />
                    <p 
                      className="text-gray-600 mt-2"
                      dangerouslySetInnerHTML={{ __html: result.excerpt }}
                    />
                  </div>
                ))}
                {searchResults.length === 0 && !searchLoading && (
                  <p className="text-gray-500 text-center py-8">Keine Ergebnisse gefunden.</p>
                )}
              </div>
            )}
          </div>
        );
      
      default:
        return <BlogList postsPerPage={6} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <h1 className="text-2xl font-bold text-gray-900">MindGuard AI Blog</h1>
              
              <nav className="flex space-x-4">
                <button
                  onClick={() => setView('list')}
                  className={`flex items-center px-3 py-2 rounded-md text-sm font-medium ${
                    view === 'list' 
                      ? 'bg-blue-100 text-blue-700' 
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <Home className="w-4 h-4 mr-2" />
                  Blog
                </button>
                
                <button
                  onClick={() => setView('page')}
                  className={`flex items-center px-3 py-2 rounded-md text-sm font-medium ${
                    view === 'page' 
                      ? 'bg-blue-100 text-blue-700' 
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <Book className="w-4 h-4 mr-2" />
                  Über uns
                </button>
              </nav>
            </div>
            
            {/* Suchleiste */}
            <form onSubmit={handleSearch} className="flex items-center">
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Blog durchsuchen..."
                  className="w-64 pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
              </div>
              <button
                type="submit"
                className="ml-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Suchen
              </button>
            </form>
          </div>
          
          {/* WordPress Status Banner */}
          {!isWordPressConnected && (
            <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-3">
              <div className="flex items-center">
                <WifiOff className="w-5 h-5 text-yellow-600 mr-2" />
                <p className="text-yellow-800 text-sm">
                  <strong>Demo-Modus:</strong> WordPress nicht verbunden. Verwende Beispiel-Inhalte.
                  <br />
                  <span className="text-xs">
                    Konfigurieren Sie REACT_APP_WORDPRESS_API_URL in der .env Datei für eine echte WordPress-Verbindung.
                  </span>
                </p>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-8">
        {renderContent()}
      </main>

      {/* Status Indicator */}
      <div className="fixed bottom-4 right-4">
        <div className={`px-3 py-2 rounded-full text-sm font-medium flex items-center ${
          postsLoading 
            ? 'bg-yellow-100 text-yellow-800' 
            : isWordPressConnected
            ? 'bg-green-100 text-green-800'
            : 'bg-blue-100 text-blue-800'
        }`}>
          {postsLoading ? (
            <>
              <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-yellow-600 mr-2"></div>
              Lädt...
            </>
          ) : isWordPressConnected ? (
            <>
              <Wifi className="w-3 h-3 mr-2" />
              WordPress verbunden
            </>
          ) : (
            <>
              <WifiOff className="w-3 h-3 mr-2" />
              Demo-Modus
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default WordPressBlogDemo;
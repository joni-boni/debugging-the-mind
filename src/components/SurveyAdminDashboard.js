import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Users, Mail, TrendingUp, Database, RefreshCw, Download } from 'lucide-react';
import wordPressSurveyService from '../services/wordPressSurveyService';

const SurveyAdminDashboard = () => {
  const [statistics, setStatistics] = useState(null);
  const [responses, setResponses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [syncStatus, setSyncStatus] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);

  // Colors for charts
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D', '#FFC658'];

  useEffect(() => {
    loadDashboardData();
  }, [currentPage]);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      // Load statistics and responses in parallel
      const [statsData, responsesData] = await Promise.all([
        wordPressSurveyService.getSurveyStatistics(),
        wordPressSurveyService.getSurveyResponses(currentPage, 10)
      ]);

      setStatistics(statsData);
      setResponses(responsesData.responses || []);
      setTotalPages(responsesData.totalPages || 0);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSync = async () => {
    setSyncStatus('syncing');
    try {
      const result = await wordPressSurveyService.syncPendingSurveys();
      setSyncStatus(`synced-${result.synced}`);
      if (result.synced > 0) {
        loadDashboardData(); // Reload data after sync
      }
    } catch (error) {
      setSyncStatus('error');
      console.error('Sync error:', error);
    }
  };

  const exportToCsv = () => {
    if (!responses.length) return;
    
    const headers = ['Date', 'Email', 'Age', 'Gender', 'Demographics', 'Pets', 'Motivation'];
    const csvData = responses.map(response => [
      new Date(response.created_at).toLocaleDateString(),
      response.email || '',
      response.age || '',
      response.gender || '',
      response.demographics || '',
      response.pets ? response.pets.replace(/"/g, '') : '',
      response.motivation || ''
    ]);
    
    const csvContent = [headers, ...csvData]
      .map(row => row.map(field => `"${field}"`).join(','))
      .join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `survey-responses-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  // Transform data for charts with safe fallbacks
  console.log('Statistics received:', statistics);
  
  const ageChartData = (statistics && statistics.ageDistribution) ? 
    Object.entries(statistics.ageDistribution).map(([age, count]) => ({
      age,
      count,
      percentage: ((count / statistics.totalResponses) * 100).toFixed(1)
    })) : [];

  const genderChartData = (statistics && statistics.genderDistribution) ? 
    Object.entries(statistics.genderDistribution).map(([gender, count]) => ({
      name: gender === 'male' ? 'Männlich' : gender === 'female' ? 'Weiblich' : 'Divers',
      value: count,
      percentage: ((count / statistics.totalResponses) * 100).toFixed(1)
    })) : [];

  const demographicsChartData = (statistics && statistics.demographicsDistribution) ? 
    Object.entries(statistics.demographicsDistribution).map(([demo, count]) => ({
      name: demo,
      value: count,
      percentage: ((count / statistics.totalResponses) * 100).toFixed(1)
    })) : [];

  const motivationChartData = (statistics && statistics.motivationDistribution) ? 
    Object.entries(statistics.motivationDistribution)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 8) // Top 8 motivations
    .map(([motivation, count]) => ({
      motivation: motivation.length > 20 ? motivation.substring(0, 20) + '...' : motivation,
      count,
      percentage: ((count / statistics.totalResponses) * 100).toFixed(1)
    })) : [];

  console.log('Chart data:', { ageChartData, genderChartData, demographicsChartData, motivationChartData });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="mx-auto h-12 w-12 text-blue-500 animate-spin" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Lade Dashboard...</h3>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Survey Dashboard</h1>
          <p className="mt-2 text-gray-600">Übersicht über alle Survey-Antworten und Statistiken</p>
        </div>

        {/* Action Bar */}
        <div className="mb-6 flex justify-between items-center">
          <button
            onClick={loadDashboardData}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Aktualisieren
          </button>
          
          <div className="flex space-x-3">
            <button
              onClick={handleSync}
              disabled={syncStatus === 'syncing'}
              className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
            >
              <Database className="w-4 h-4 mr-2" />
              {syncStatus === 'syncing' ? 'Synchronisiere...' : 'Sync Pending'}
            </button>
            
            <button
              onClick={exportToCsv}
              className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              <Download className="w-4 h-4 mr-2" />
              Export CSV
            </button>
          </div>
        </div>

        {/* Sync Status */}
        {syncStatus && (
          <div className={`mb-6 p-4 rounded-lg ${
            syncStatus === 'syncing' ? 'bg-blue-50 text-blue-800' :
            syncStatus.startsWith('synced') ? 'bg-green-50 text-green-800' :
            'bg-red-50 text-red-800'
          }`}>
            {syncStatus === 'syncing' && 'Synchronisiere lokale Daten...'}
            {syncStatus.startsWith('synced') && `${syncStatus.split('-')[1]} Antworten erfolgreich synchronisiert`}
            {syncStatus === 'error' && 'Fehler bei der Synchronisation'}
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Users className="h-8 w-8 text-gray-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Gesamte Antworten
                    </dt>
                    <dd>
                      <div className="text-lg font-medium text-gray-900">
                        {statistics?.totalResponses || 0}
                      </div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Mail className="h-8 w-8 text-gray-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      E-Mail Adressen
                    </dt>
                    <dd>
                      <div className="text-lg font-medium text-gray-900">
                        {responses.filter(r => r.email).length}
                      </div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <TrendingUp className="h-8 w-8 text-gray-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Konversionsrate
                    </dt>
                    <dd>
                      <div className="text-lg font-medium text-gray-900">
                        {statistics?.totalResponses ? 
                          ((responses.filter(r => r.email).length / statistics.totalResponses) * 100).toFixed(1) 
                          : 0}%
                      </div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Database className="h-8 w-8 text-gray-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Potentielle Leads
                    </dt>
                    <dd>
                      <div className="text-lg font-medium text-gray-900">
                        {(statistics?.totalResponses || 0) * 5}
                      </div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Charts Row 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Age Distribution */}
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h3 className="text-lg font-semibold mb-4">Altersverteilung</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={ageChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="age" />
                <YAxis />
                <Tooltip formatter={(value, name) => [value, 'Anzahl']} />
                <Bar dataKey="count" fill="#3B82F6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Gender Distribution */}
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h3 className="text-lg font-semibold mb-4">Geschlechterverteilung</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={genderChartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({name, percentage}) => `${name} (${percentage}%)`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {genderChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Charts Row 2 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Demographics Distribution */}
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h3 className="text-lg font-semibold mb-4">Demografieverteilung</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={demographicsChartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({name, percentage}) => `${name} (${percentage}%)`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {demographicsChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Motivation Chart */}
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h3 className="text-lg font-semibold mb-4">Top Motivationen/Ziele</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={motivationChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="motivation" />
                <YAxis />
                <Tooltip formatter={(value, name) => [value, 'Anzahl']} />
                <Bar dataKey="count" fill="#8B5CF6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Responses */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold">Neueste Antworten</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Datum
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    E-Mail
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Alter
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Geschlecht
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Demographics
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Haustiere
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {responses.map((response, index) => (
                  <tr key={response.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(response.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {response.email || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {response.age || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {response.gender || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {response.demographics || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {response.pets ? response.pets.replace(/"/g, '') : 'N/A'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {/* Pagination */}
          {totalPages > 1 && (
            <div className="bg-white px-4 py-3 border-t border-gray-200 sm:px-6">
              <div className="flex justify-between items-center">
                <div className="text-sm text-gray-700">
                  Seite {currentPage} von {totalPages}
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-1 border rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    Zurück
                  </button>
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1 border rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    Weiter
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SurveyAdminDashboard;
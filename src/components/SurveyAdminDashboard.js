import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Users, Mail, TrendingUp, Database, RefreshCw, Download, Trash2 } from 'lucide-react';
import supabaseAdminService from '../services/supabaseAdminService';

const SurveyAdminDashboard = () => {
  const [statistics, setStatistics] = useState(null);
  const [responses, setResponses] = useState([]);
  const [waitlist, setWaitlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [activeTab, setActiveTab] = useState('overview'); // overview, responses, waitlist

  // Colors for charts
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D', '#FFC658'];

  useEffect(() => {
    loadDashboardData();
    
    // Real-time updates von Supabase
    const unsubscribe = supabaseAdminService.subscribeToChanges(() => {
      loadDashboardData();
    });

    return () => unsubscribe();
  }, [currentPage]);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      // Load statistics, responses and waitlist in parallel
      const [statsData, responsesData, waitlistData] = await Promise.all([
        supabaseAdminService.getDashboardStatistics(),
        supabaseAdminService.getSurveyResponses(currentPage, 10),
        supabaseAdminService.getWaitlistData(1, 50) // Top 50 waitlist entries
      ]);

      setStatistics(statsData);
      setResponses(responsesData.responses || []);
      setWaitlist(waitlistData.waitlist || []);
      setTotalPages(responsesData.totalPages || 0);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteResponse = async (id) => {
    if (window.confirm('Sind Sie sicher, dass Sie diese Antwort löschen möchten?')) {
      try {
        await supabaseAdminService.deleteSurveyResponse(id);
        loadDashboardData();
      } catch (error) {
        console.error('Error deleting response:', error);
        alert('Fehler beim Löschen der Antwort');
      }
    }
  };

  const handleDeleteWaitlistEntry = async (id) => {
    if (window.confirm('Sind Sie sicher, dass Sie diesen Wartelisten-Eintrag löschen möchten?')) {
      try {
        await supabaseAdminService.deleteWaitlistEntry(id);
        loadDashboardData();
      } catch (error) {
        console.error('Error deleting waitlist entry:', error);
        alert('Fehler beim Löschen des Wartelisten-Eintrags');
      }
    }
  };

  const exportSurveyToCsv = async () => {
    try {
      const data = await supabaseAdminService.exportSurveyData();
      if (!data.length) return;
      
      const headers = ['Date', 'Email', 'Age', 'Gender', 'Demographics', 'Pets', 'Motivation'];
      const csvData = data.map(response => [
        new Date(response.created_at).toLocaleDateString(),
        response.email || '',
        response.age || '',
        response.gender || '',
        response.demographics || '',
        Array.isArray(response.pets) ? response.pets.join(', ') : '',
        Array.isArray(response.motivation) ? response.motivation.join(', ') : ''
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
    } catch (error) {
      console.error('Export error:', error);
      alert('Fehler beim Exportieren');
    }
  };

  const exportWaitlistToCsv = async () => {
    try {
      const data = await supabaseAdminService.exportWaitlistData();
      if (!data.length) return;
      
      const headers = ['Date', 'Email', 'Survey Data'];
      const csvData = data.map(entry => [
        new Date(entry.created_at).toLocaleDateString(),
        entry.email || '',
        JSON.stringify(entry.survey_data || {})
      ]);
      
      const csvContent = [headers, ...csvData]
        .map(row => row.map(field => `"${field}"`).join(','))
        .join('\n');
      
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `waitlist-${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Export error:', error);
      alert('Fehler beim Exportieren');
    }
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
          <h1 className="text-3xl font-bold text-gray-900">Supabase Admin Dashboard</h1>
          <p className="mt-2 text-gray-600">Real-time Übersicht über Survey-Antworten und Warteliste</p>
        </div>

        {/* Tabs */}
        <div className="mb-6 border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: 'overview', label: 'Übersicht', icon: TrendingUp },
              { id: 'responses', label: 'Survey Antworten', icon: Users },
              { id: 'waitlist', label: 'Warteliste', icon: Mail }
            ].map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="w-4 h-4 mr-2" />
                  {tab.label}
                </button>
              );
            })}
          </nav>
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
              onClick={exportSurveyToCsv}
              className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              <Download className="w-4 h-4 mr-2" />
              Export Survey CSV
            </button>
            
            <button
              onClick={exportWaitlistToCsv}
              className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <Download className="w-4 h-4 mr-2" />
              Export Warteliste CSV
            </button>
          </div>
        </div>

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
                      Warteliste
                    </dt>
                    <dd>
                      <div className="text-lg font-medium text-gray-900">
                        {statistics?.totalWaitlist || 0}
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
                        {statistics?.totalResponses && statistics?.totalWaitlist ? 
                          ((statistics.totalWaitlist / (statistics.totalResponses + statistics.totalWaitlist)) * 100).toFixed(1) 
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



        {/* Tab Content */}
        {activeTab === 'overview' && (
          <>
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
          </>
        )}

        {/* Survey Responses Tab */}
        {activeTab === 'responses' && (
          <div className="bg-white rounded-lg shadow-sm">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold">Survey Antworten</h3>
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
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Aktionen
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
                        {Array.isArray(response.pets) ? response.pets.join(', ') : 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <button
                          onClick={() => handleDeleteResponse(response.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Waitlist Tab */}
        {activeTab === 'waitlist' && (
          <div className="bg-white rounded-lg shadow-sm">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold">Warteliste</h3>
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
                      Survey Daten
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Aktionen
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {waitlist.map((entry, index) => (
                    <tr key={entry.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(entry.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {entry.email || 'N/A'}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">
                        {entry.survey_data ? JSON.stringify(entry.survey_data).substring(0, 100) + '...' : 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <button
                          onClick={() => handleDeleteWaitlistEntry(entry.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
          
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
        
        {/* Pagination - nur für responses tab */}
        {activeTab === 'responses' && totalPages > 1 && (
          <div className="bg-white px-4 py-3 border-t border-gray-200 sm:px-6 mt-6 rounded-lg">
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
  );
};

export default SurveyAdminDashboard;
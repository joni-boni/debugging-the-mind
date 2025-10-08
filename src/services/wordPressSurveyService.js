import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_WORDPRESS_API_URL || 'http://localhost:8080/wp-json/wp/v2';

// WordPress API Service für Survey Responses
class WordPressSurveyService {
  constructor() {
    this.api = axios.create({
      baseURL: API_BASE_URL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      }
    });

    // Request interceptor für debugging
    this.api.interceptors.request.use((config) => {
      console.log('WordPress Survey API Request:', config);
      return config;
    });

    // Response interceptor für error handling
    this.api.interceptors.response.use(
      (response) => response,
      (error) => {
        console.error('WordPress Survey API Error:', error);
        return Promise.reject(error);
      }
    );
  }

  /**
   * Submit survey response using custom WordPress endpoint
   * Uses our custom plugin endpoint that allows anonymous submissions
   */
  async submitSurveyResponse(surveyData) {
    try {
      // Use custom survey endpoint instead of standard posts endpoint
      const response = await this.api.post('/survey/v1/submit', surveyData);
      console.log('Survey response submitted successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error submitting survey response:', error);
      
      // Fallback: Save in localStorage when WordPress is not available
      this.saveSurveyLocally(surveyData);
      throw new Error('Survey konnte nicht gespeichert werden. Bitte versuchen Sie es erneut.');
    }
  }

  /**
   * Survey-Daten als HTML Content formatieren
   */
  formatSurveyContent(surveyData) {
    return `
      <h2>Survey Response Details</h2>
      <h3>Persönliche Daten</h3>
      <ul>
        <li><strong>E-Mail:</strong> ${surveyData.email}</li>
        <li><strong>Alter:</strong> ${surveyData.age}</li>
        <li><strong>Beschreibung:</strong> ${surveyData.demographics}</li>
      </ul>
      
      <h3>Präferenzen</h3>
      <ul>
        <li><strong>Haustiere:</strong> ${surveyData.pets}</li>
        <li><strong>Motivation/Ziele:</strong> ${surveyData.motivation}</li>
      </ul>
      
      <h3>Meta-Daten</h3>
      <ul>
        <li><strong>Abgeschlossen am:</strong> ${surveyData.completedAt}</li>
        <li><strong>Quelle:</strong> ${surveyData.source}</li>
      </ul>
    `;
  }

  /**
   * Lokale Speicherung als Fallback
   */
  saveSurveyLocally(surveyData) {
    try {
      const existingData = JSON.parse(localStorage.getItem('pendingSurveyResponses') || '[]');
      existingData.push({
        ...surveyData,
        localId: Date.now(),
        savedAt: new Date().toISOString()
      });
      localStorage.setItem('pendingSurveyResponses', JSON.stringify(existingData));
      console.log('Survey saved locally as fallback');
    } catch (error) {
      console.error('Error saving survey locally:', error);
    }
  }

  /**
   * Alle Survey Responses abrufen (für Admin Dashboard)
   */
  async getSurveyResponses(page = 1, perPage = 20) {
    try {
      const response = await this.api.get('/survey/v1/responses', {
        params: {
          page,
          per_page: perPage
        }
      });

      return response.data;
    } catch (error) {
      console.error('Error fetching survey responses:', error);
      return { responses: [], totalPages: 0, totalItems: 0 };
    }
  }

  /**
   * Survey Statistics abrufen
   */
  async getSurveyStatistics() {
    try {
      const response = await this.api.get('/survey/v1/stats');
      return response.data;
    } catch (error) {
      console.error('Error fetching survey statistics:', error);
      return {
        totalResponses: 0,
        ageDistribution: {},
        demographicsDistribution: {},
        motivationDistribution: {},
        petsDistribution: {}
      };
    }
  }

  /**
   * Pending local surveys zu WordPress synchronisieren
   */
  async syncPendingSurveys() {
    try {
      const pendingData = JSON.parse(localStorage.getItem('pendingSurveyResponses') || '[]');
      
      if (pendingData.length === 0) {
        console.log('No pending surveys to sync');
        return { synced: 0, failed: 0 };
      }

      let synced = 0;
      let failed = 0;

      for (const survey of pendingData) {
        try {
          await this.submitSurveyResponse(survey);
          synced++;
        } catch (error) {
          failed++;
          console.error('Failed to sync survey:', survey.localId, error);
        }
      }

      // Clear successfully synced surveys
      if (synced > 0) {
        localStorage.removeItem('pendingSurveyResponses');
        console.log(`Successfully synced ${synced} surveys`);
      }

      return { synced, failed };
    } catch (error) {
      console.error('Error syncing pending surveys:', error);
      return { synced: 0, failed: 0 };
    }
  }

  /**
   * Newsletter Subscription (optional separate endpoint)
   */
  async subscribeToNewsletter(email, surveyData = {}) {
    try {
      const postData = {
        title: `Newsletter Subscription - ${email}`,
        content: `
          <h2>Newsletter Subscription</h2>
          <p><strong>E-Mail:</strong> ${email}</p>
          <p><strong>Subscribed at:</strong> ${new Date().toISOString()}</p>
          ${surveyData.age ? `<p><strong>Age:</strong> ${surveyData.age}</p>` : ''}
          ${surveyData.demographics ? `<p><strong>Demographics:</strong> ${surveyData.demographics}</p>` : ''}
        `,
        status: 'private',
        meta: {
          newsletter_email: email,
          newsletter_subscribed_at: new Date().toISOString(),
          newsletter_source: 'survey-form'
        }
      };

      const response = await this.api.post('/posts', postData);
      console.log('Newsletter subscription successful:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error subscribing to newsletter:', error);
      throw new Error('Newsletter-Anmeldung fehlgeschlagen');
    }
  }
}

// Export singleton instance
const wordPressSurveyService = new WordPressSurveyService();
export default wordPressSurveyService;
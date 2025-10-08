import { supabase } from '../config/supabase';

/**
 * Supabase Admin Dashboard Service
 * Funktionen für das Admin Dashboard mit Supabase-Integration
 */
class SupabaseAdminService {
  
  /**
   * Holt Statistiken für das Dashboard
   */
  async getDashboardStatistics() {
    try {
      // Grundlegende Statistiken von survey_responses
      const { data: responses, error: responsesError } = await supabase
        .from('survey_responses')
        .select('*');

      if (responsesError) throw responsesError;

      // Wartelisten-Statistiken
      const { data: waitlist, error: waitlistError } = await supabase
        .from('waitlist')
        .select('*');

      if (waitlistError) throw waitlistError;

      // Statistiken berechnen
      const totalResponses = responses?.length || 0;
      const totalWaitlist = waitlist?.length || 0;

      // Altersverteilung
      const ageDistribution = {};
      responses?.forEach(response => {
        if (response.age) {
          ageDistribution[response.age] = (ageDistribution[response.age] || 0) + 1;
        }
      });

      // Geschlechterverteilung
      const genderDistribution = {};
      responses?.forEach(response => {
        if (response.gender) {
          genderDistribution[response.gender] = (genderDistribution[response.gender] || 0) + 1;
        }
      });

      // Demografieverteilung
      const demographicsDistribution = {};
      responses?.forEach(response => {
        if (response.demographics) {
          demographicsDistribution[response.demographics] = (demographicsDistribution[response.demographics] || 0) + 1;
        }
      });

      // Haustierverteilung
      const petsDistribution = {};
      responses?.forEach(response => {
        if (response.pets && Array.isArray(response.pets)) {
          response.pets.forEach(pet => {
            petsDistribution[pet] = (petsDistribution[pet] || 0) + 1;
          });
        }
      });

      // Motivationsverteilung
      const motivationDistribution = {};
      responses?.forEach(response => {
        if (response.motivation && Array.isArray(response.motivation)) {
          response.motivation.forEach(motivation => {
            motivationDistribution[motivation] = (motivationDistribution[motivation] || 0) + 1;
          });
        }
      });

      // Zeitbasierte Statistiken
      const today = new Date().toISOString().split('T')[0];
      const todayResponses = responses?.filter(r => 
        r.created_at && r.created_at.startsWith(today)
      ).length || 0;

      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
      const weekResponses = responses?.filter(r => 
        r.created_at && r.created_at >= sevenDaysAgo
      ).length || 0;

      return {
        totalResponses,
        totalWaitlist,
        todayResponses,
        weekResponses,
        ageDistribution,
        genderDistribution,
        demographicsDistribution,
        petsDistribution,
        motivationDistribution,
        responses: responses || []
      };

    } catch (error) {
      console.error('Error fetching dashboard statistics:', error);
      throw error;
    }
  }

  /**
   * Holt paginierte Survey-Antworten
   */
  async getSurveyResponses(page = 1, limit = 10) {
    try {
      const from = (page - 1) * limit;
      const to = from + limit - 1;

      const { data, error, count } = await supabase
        .from('survey_responses')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(from, to);

      if (error) throw error;

      const totalPages = Math.ceil((count || 0) / limit);

      return {
        responses: data || [],
        totalResponses: count || 0,
        totalPages,
        currentPage: page
      };

    } catch (error) {
      console.error('Error fetching survey responses:', error);
      throw error;
    }
  }

  /**
   * Holt Wartelisten-Daten
   */
  async getWaitlistData(page = 1, limit = 10) {
    try {
      const from = (page - 1) * limit;
      const to = from + limit - 1;

      const { data, error, count } = await supabase
        .from('waitlist')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(from, to);

      if (error) throw error;

      const totalPages = Math.ceil((count || 0) / limit);

      return {
        waitlist: data || [],
        totalWaitlist: count || 0,
        totalPages,
        currentPage: page
      };

    } catch (error) {
      console.error('Error fetching waitlist data:', error);
      throw error;
    }
  }

  /**
   * Exportiert alle Survey-Daten als CSV-kompatibles Array
   */
  async exportSurveyData() {
    try {
      const { data, error } = await supabase
        .from('survey_responses')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      return data || [];

    } catch (error) {
      console.error('Error exporting survey data:', error);
      throw error;
    }
  }

  /**
   * Exportiert Wartelisten-Daten
   */
  async exportWaitlistData() {
    try {
      const { data, error } = await supabase
        .from('waitlist')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      return data || [];

    } catch (error) {
      console.error('Error exporting waitlist data:', error);
      throw error;
    }
  }

  /**
   * Löscht einen Survey-Eintrag (Admin-Funktion)
   */
  async deleteSurveyResponse(id) {
    try {
      const { error } = await supabase
        .from('survey_responses')
        .delete()
        .eq('id', id);

      if (error) throw error;

      return { success: true };

    } catch (error) {
      console.error('Error deleting survey response:', error);
      throw error;
    }
  }

  /**
   * Löscht einen Wartelisten-Eintrag
   */
  async deleteWaitlistEntry(id) {
    try {
      const { error } = await supabase
        .from('waitlist')
        .delete()
        .eq('id', id);

      if (error) throw error;

      return { success: true };

    } catch (error) {
      console.error('Error deleting waitlist entry:', error);
      throw error;
    }
  }

  /**
   * Real-time Subscription für Dashboard-Updates
   */
  subscribeToChanges(callback) {
    const surveySubscription = supabase
      .channel('survey_responses_changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'survey_responses' },
        callback
      )
      .subscribe();

    const waitlistSubscription = supabase
      .channel('waitlist_changes')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'waitlist' },
        callback
      )
      .subscribe();

    // Return unsubscribe function
    return () => {
      surveySubscription.unsubscribe();
      waitlistSubscription.unsubscribe();
    };
  }
}

const supabaseAdminService = new SupabaseAdminService();
export default supabaseAdminService;
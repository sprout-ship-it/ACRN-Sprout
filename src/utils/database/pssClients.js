// src/utils/database/pssClients.js
import { supabase } from '../supabase';

export const pssClientsService = {
  /**
   * Get all clients for a specific peer specialist
   */
  async getByPeerSpecialistId(peerSpecialistId) {
    try {
      console.log('📊 Fetching PSS clients for peer specialist:', peerSpecialistId);
      
      const { data, error } = await supabase
        .from('pss_clients')
        .select(`
          *,
          client_profile:registrant_profiles!pss_clients_client_id_fkey(
            id,
            first_name,
            last_name,
            email
          ),
          peer_profile:registrant_profiles!pss_clients_peer_specialist_id_fkey(
            id,
            first_name,
            last_name,
            email
          )
        `)
        .eq('peer_specialist_id', peerSpecialistId)
        .order('updated_at', { ascending: false });

      if (error) {
        console.error('❌ Error fetching PSS clients:', error);
        return { data: null, error };
      }

      console.log(`✅ Retrieved ${data?.length || 0} PSS clients`);
      return { data, error: null };

    } catch (err) {
      console.error('💥 Exception in getByPeerSpecialistId:', err);
      return { data: null, error: err };
    }
  },

  /**
   * Get a specific PSS client by ID
   */
  async getById(clientId) {
    try {
      console.log('📊 Fetching PSS client by ID:', clientId);
      
      const { data, error } = await supabase
        .from('pss_clients')
        .select(`
          *,
          client_profile:registrant_profiles!pss_clients_client_id_fkey(
            id,
            first_name,
            last_name,
            email
          ),
          peer_profile:registrant_profiles!pss_clients_peer_specialist_id_fkey(
            id,
            first_name,
            last_name,
            email
          )
        `)
        .eq('id', clientId)
        .single();

      if (error) {
        console.error('❌ Error fetching PSS client:', error);
        return { data: null, error };
      }

      console.log('✅ Retrieved PSS client:', data?.id);
      return { data, error: null };

    } catch (err) {
      console.error('💥 Exception in getById:', err);
      return { data: null, error: err };
    }
  },

  /**
   * Get PSS clients by client user ID (for clients to see their peer support relationships)
   */
  async getByClientId(clientId) {
    try {
      console.log('📊 Fetching PSS relationships for client:', clientId);
      
      const { data, error } = await supabase
        .from('pss_clients')
        .select(`
          *,
          client_profile:registrant_profiles!pss_clients_client_id_fkey(
            id,
            first_name,
            last_name,
            email            
          ),
          peer_profile:registrant_profiles!pss_clients_peer_specialist_id_fkey(
            id,
            first_name,
            last_name,
            email
          )
        `)
        .eq('client_id', clientId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Error fetching client PSS relationships:', error);
        return { data: null, error };
      }

      console.log(`✅ Retrieved ${data?.length || 0} PSS relationships for client`);
      return { data, error: null };

    } catch (err) {
      console.error('💥 Exception in getByClientId:', err);
      return { data: null, error: err };
    }
  },

  /**
   * Create a new PSS client relationship
   */
  async create(clientData) {
    try {
      console.log('➕ Creating new PSS client relationship:', clientData);

      // Validate required fields
      if (!clientData.peer_specialist_id || !clientData.client_id) {
        throw new Error('Peer specialist ID and client ID are required');
      }

      // Check for existing relationship
      const { data: existing } = await supabase
        .from('pss_clients')
        .select('id')
        .eq('peer_specialist_id', clientData.peer_specialist_id)
        .eq('client_id', clientData.client_id)
        .single();

      if (existing) {
        throw new Error('PSS client relationship already exists');
      }

      const { data, error } = await supabase
        .from('pss_clients')
        .insert([{
          ...clientData,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (error) {
        console.error('❌ Error creating PSS client:', error);
        return { data: null, error };
      }

      console.log('✅ Created PSS client relationship:', data.id);
      return { data, error: null };

    } catch (err) {
      console.error('💥 Exception in create:', err);
      return { data: null, error: err };
    }
  },

  /**
   * Update a PSS client relationship
   */
  async update(clientId, updates) {
    try {
      console.log('📝 Updating PSS client:', clientId, updates);

      const { data, error } = await supabase
        .from('pss_clients')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', clientId)
        .select()
        .single();

      if (error) {
        console.error('❌ Error updating PSS client:', error);
        return { data: null, error };
      }

      console.log('✅ Updated PSS client:', data.id);
      return { data, error: null };

    } catch (err) {
      console.error('💥 Exception in update:', err);
      return { data: null, error: err };
    }
  },

  /**
   * Update recovery goals for a client
   */
  async updateRecoveryGoals(clientId, goals) {
    try {
      console.log('🎯 Updating recovery goals for client:', clientId);

      // Validate goals array
      if (!Array.isArray(goals)) {
        throw new Error('Goals must be an array');
      }

      // Validate each goal object
      for (const goal of goals) {
        if (!goal.id || !goal.goal || !goal.status) {
          throw new Error('Each goal must have id, goal, and status fields');
        }
      }

      const { data, error } = await supabase
        .from('pss_clients')
        .update({
          recovery_goals: goals,
          updated_at: new Date().toISOString()
        })
        .eq('id', clientId)
        .select()
        .single();

      if (error) {
        console.error('❌ Error updating recovery goals:', error);
        return { data: null, error };
      }

      console.log(`✅ Updated ${goals.length} recovery goals for client`);
      return { data, error: null };

    } catch (err) {
      console.error('💥 Exception in updateRecoveryGoals:', err);
      return { data: null, error: err };
    }
  },

  /**
   * Add a progress note to a client
   */
  async addProgressNote(clientId, note) {
    try {
      console.log('📝 Adding progress note for client:', clientId);

      // Get current client data
      const { data: client, error: fetchError } = await this.getById(clientId);
      if (fetchError || !client) {
        throw new Error('Failed to fetch client data');
      }

      // Create new note object
      const newNote = {
        id: crypto.randomUUID(),
        date: new Date().toISOString().split('T')[0],
        type: note.type || 'session',
        content: note.content,
        session_duration: note.session_duration || null,
        topics_covered: note.topics_covered || [],
        action_items: note.action_items || [],
        next_steps: note.next_steps || '',
        created_at: new Date().toISOString()
      };

      // Add to existing notes
      const updatedNotes = [...(client.progress_notes || []), newNote];

      const { data, error } = await supabase
        .from('pss_clients')
        .update({
          progress_notes: updatedNotes,
          last_session_date: newNote.type === 'session' ? newNote.date : client.last_session_date,
          total_sessions: newNote.type === 'session' ? (client.total_sessions || 0) + 1 : client.total_sessions,
          last_contact_date: newNote.date,
          updated_at: new Date().toISOString()
        })
        .eq('id', clientId)
        .select()
        .single();

      if (error) {
        console.error('❌ Error adding progress note:', error);
        return { data: null, error };
      }

      console.log('✅ Added progress note to client');
      return { data, error: null };

    } catch (err) {
      console.error('💥 Exception in addProgressNote:', err);
      return { data: null, error: err };
    }
  },

  /**
   * Update client preferences
   */
  async updateClientPreferences(clientId, preferences) {
    try {
      console.log('⚙️ Updating client preferences:', clientId);

      const { data, error } = await supabase
        .from('pss_clients')
        .update({
          client_preferences: preferences,
          updated_at: new Date().toISOString()
        })
        .eq('id', clientId)
        .select()
        .single();

      if (error) {
        console.error('❌ Error updating client preferences:', error);
        return { data: null, error };
      }

      console.log('✅ Updated client preferences');
      return { data, error: null };

    } catch (err) {
      console.error('💥 Exception in updateClientPreferences:', err);
      return { data: null, error: err };
    }
  },

  /**
   * Update crisis plan for a client
   */
  async updateCrisisPlan(clientId, crisisPlan) {
    try {
      console.log('🚨 Updating crisis plan for client:', clientId);

      const { data, error } = await supabase
        .from('pss_clients')
        .update({
          crisis_plan: crisisPlan,
          updated_at: new Date().toISOString()
        })
        .eq('id', clientId)
        .select()
        .single();

      if (error) {
        console.error('❌ Error updating crisis plan:', error);
        return { data: null, error };
      }

      console.log('✅ Updated crisis plan');
      return { data, error: null };

    } catch (err) {
      console.error('💥 Exception in updateCrisisPlan:', err);
      return { data: null, error: err };
    }
  },

  /**
   * Get clients with upcoming follow-ups
   */
  async getClientsWithUpcomingFollowups(peerSpecialistId, daysAhead = 7) {
    try {
      console.log('📅 Fetching clients with upcoming follow-ups');

      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + daysAhead);

      const { data, error } = await supabase
        .from('pss_clients')
        .select(`
          *,
          client_profile:registrant_profiles!pss_clients_client_id_fkey(
            id,
            first_name,
            last_name,
            email            
          )
        `)
        .eq('peer_specialist_id', peerSpecialistId)
        .eq('status', 'active')
        .lte('next_followup_date', futureDate.toISOString().split('T')[0])
        .order('next_followup_date', { ascending: true });

      if (error) {
        console.error('❌ Error fetching upcoming follow-ups:', error);
        return { data: null, error };
      }

      console.log(`✅ Retrieved ${data?.length || 0} clients with upcoming follow-ups`);
      return { data, error: null };

    } catch (err) {
      console.error('💥 Exception in getClientsWithUpcomingFollowups:', err);
      return { data: null, error: err };
    }
  },

  /**
   * Get clients with overdue follow-ups
   */
  async getClientsWithOverdueFollowups(peerSpecialistId) {
    try {
      console.log('⚠️ Fetching clients with overdue follow-ups');

      const today = new Date().toISOString().split('T')[0];

      const { data, error } = await supabase
        .from('pss_clients')
        .select(`
          *,
          client_profile:registrant_profiles!pss_clients_client_id_fkey(
            id,
            first_name,
            last_name,
            email            
          )
        `)
        .eq('peer_specialist_id', peerSpecialistId)
        .eq('status', 'active')
        .lt('next_followup_date', today)
        .order('next_followup_date', { ascending: true });

      if (error) {
        console.error('❌ Error fetching overdue follow-ups:', error);
        return { data: null, error };
      }

      console.log(`✅ Retrieved ${data?.length || 0} clients with overdue follow-ups`);
      return { data, error: null };

    } catch (err) {
      console.error('💥 Exception in getClientsWithOverdueFollowups:', err);
      return { data: null, error: err };
    }
  },

  /**
   * Delete a PSS client relationship (soft delete by setting status to inactive)
   */
  async delete(clientId) {
    try {
      console.log('🗑️ Soft deleting PSS client relationship:', clientId);

      const { data, error } = await supabase
        .from('pss_clients')
        .update({
          status: 'inactive',
          updated_at: new Date().toISOString()
        })
        .eq('id', clientId)
        .select()
        .single();

      if (error) {
        console.error('❌ Error soft deleting PSS client:', error);
        return { data: null, error };
      }

      console.log('✅ Soft deleted PSS client relationship');
      return { data, error: null };

    } catch (err) {
      console.error('💥 Exception in delete:', err);
      return { data: null, error: err };
    }
  },

  /**
   * Get PSS client statistics for a peer specialist
   */
  async getClientStats(peerSpecialistId) {
    try {
      console.log('📊 Fetching client statistics for peer specialist:', peerSpecialistId);

      const { data, error } = await supabase
        .from('pss_clients')
        .select('status, total_sessions, next_followup_date')
        .eq('peer_specialist_id', peerSpecialistId);

      if (error) {
        console.error('❌ Error fetching client stats:', error);
        return { data: null, error };
      }

      const today = new Date().toISOString().split('T')[0];
      
      const stats = {
        total_clients: data.length,
        active_clients: data.filter(c => c.status === 'active').length,
        completed_clients: data.filter(c => c.status === 'completed').length,
        total_sessions: data.reduce((sum, c) => sum + (c.total_sessions || 0), 0),
        overdue_followups: data.filter(c => 
          c.status === 'active' && 
          c.next_followup_date && 
          c.next_followup_date < today
        ).length,
        upcoming_followups: data.filter(c => {
          if (!c.next_followup_date || c.status !== 'active') return false;
          const followupDate = new Date(c.next_followup_date);
          const oneWeekFromNow = new Date();
          oneWeekFromNow.setDate(oneWeekFromNow.getDate() + 7);
          return followupDate >= new Date(today) && followupDate <= oneWeekFromNow;
        }).length
      };

      console.log('✅ Retrieved client statistics:', stats);
      return { data: stats, error: null };

    } catch (err) {
      console.error('💥 Exception in getClientStats:', err);
      return { data: null, error: err };
    }
  }
};

export default pssClientsService;
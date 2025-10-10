// src/components/features/peer-support/PeerSupportHub.js - FIXED FOR PHASE 6
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../hooks/useAuth';
import { db } from '../../../utils/supabase';
import LoadingSpinner from '../../ui/LoadingSpinner';
import styles from './PeerSupportHub.module.css';

const PeerSupportHub = ({ onBack }) => {
  const { user, profile } = useAuth();
  const [clients, setClients] = useState([]);
  const [availableConnections, setAvailableConnections] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedClient, setSelectedClient] = useState(null);
  const [activeModal, setActiveModal] = useState(null);
  const [newGoal, setNewGoal] = useState('');
  const [editingClient, setEditingClient] = useState(null);
  const [sessionType, setSessionType] = useState('');
  const [sessionDuration, setSessionDuration] = useState('');
  const [sessionNotes, setSessionNotes] = useState('');
  const [clientMood, setClientMood] = useState('');
  const [nextFollowup, setNextFollowup] = useState('');

  // Load clients and available connections on mount and when clients change
  useEffect(() => {
    if (profile?.id) {
      loadClients();
    }
  }, [profile?.id]);

  // Load available connections when clients data changes
  useEffect(() => {
    if (profile?.id) {
      loadAvailableConnections();
    }
  }, [profile?.id, clients.length]); // Re-run when client count changes

  /**
   * Load existing PSS clients for this peer specialist
   */
  const handleLogSession = async () => {
  if (!sessionType || !sessionNotes.trim()) return;

  try {
    const sessionData = {
      session_type: sessionType,
      duration_minutes: parseInt(sessionDuration) || 30,
      notes: sessionNotes.trim(),
      client_mood: clientMood || null,
      session_date: new Date().toISOString().split('T')[0],
      created_at: new Date().toISOString()
    };

    // Add to progress notes array
    const existingNotes = selectedClient.progress_notes || [];
    const updatedNotes = [...existingNotes, sessionData];

    // Update client record
    const updates = {
      progress_notes: updatedNotes,
      total_sessions: (selectedClient.totalSessions || 0) + 1,
      last_session_date: new Date().toISOString().split('T')[0],
      last_contact_date: new Date().toISOString().split('T')[0],
      next_followup_date: nextFollowup || null
    };

    const success = await handleUpdateClient(selectedClient.id, updates);

    if (success) {
      // Reset form
      setSessionType('');
      setSessionDuration('');
      setSessionNotes('');
      setClientMood('');
      setNextFollowup('');
      setActiveModal(null);
      
      alert('Session logged successfully!');
    }
  } catch (error) {
    console.error('Error logging session:', error);
    alert('Failed to log session: ' + error.message);
  }
};
  const loadClients = async () => {
    if (!profile?.id) return;
    
    setLoading(true);
    setError(null);

    try {
      console.log('🔄 Loading PSS clients...');
      
      // Try to get PSS client relationships
      let clientData = [];
      
      try {
        // Check if PSS clients service exists
        if (db.pssClients && typeof db.pssClients.getByPeerSpecialistId === 'function') {
          const result = await db.pssClients.getByPeerSpecialistId(profile.id);
          if (result.data && !result.error) {
            clientData = result.data;
          }
        } else {
          // ✅ FIXED: Pass correct parameters to matchGroups service
          console.log('🔄 Using fallback method via match_groups...');
          const matchResult = await db.matchGroups.getByUserId('peer-support', profile.id);
          
          if (matchResult.data && !matchResult.error) {
            // Filter for peer support connections where current user is the peer specialist
            const peerSupportConnections = matchResult.data.filter(match => 
              match.peer_support_id === profile.id && 
              match.status === 'active'
            );
            
            // Convert match_groups to client format
            clientData = peerSupportConnections.map(match => ({
              id: `fallback_${match.id}`,
              peer_specialist_id: profile.id,
              client_id: match.applicant_1_id || match.applicant_2_id,
              match_group_id: match.id,
              status: 'active',
              recovery_goals: [],
              total_sessions: 0,
              created_at: match.created_at,
              updated_at: match.updated_at,
              next_followup_date: null,
              followup_frequency: 'weekly',
              last_contact_date: null
            }));
          }
        }
      } catch (serviceError) {
        console.warn('PSS clients service not available, using match_groups fallback:', serviceError);
        // Continue with empty array - this is expected in Phase 6
      }

      console.log(`📊 Found ${clientData.length} PSS clients`);

      // Enrich client data with profile information
const enrichedClients = await Promise.all(
  clientData.map(async (client) => {
    try {
      // ✅ NEW: Use the enhanced data already provided by PSS service
      const applicantData = client.applicant;
      const clientProfile = applicantData?.registrant;

      if (!applicantData || !clientProfile) {
        console.warn(`Incomplete data for client:`, client);
        return {
          ...client,
          displayName: 'Unknown Client',
          recoveryGoals: [],
          status: 'active'
        };
      }

      return {
        ...client,
        profile: clientProfile,
        applicantProfile: applicantData,
        displayName: clientProfile.first_name 
          ? `${clientProfile.first_name} ${clientProfile.last_name?.charAt(0) || ''}.`
          : 'Anonymous Client',
        phone: applicantData.primary_phone || 'Not provided',
        email: clientProfile.email,
        
        // ✅ ENHANCED: More peer support relevant data
        primarySubstances: applicantData.primary_substance ? [applicantData.primary_substance] : [],
        recoveryStage: applicantData.recovery_stage || 'Not specified',
        timeInRecovery: applicantData.time_in_recovery || 'Not specified',
        sobrietyDate: applicantData.sobriety_date || null,
        recoveryMethods: applicantData.recovery_methods || [],
        supportMeetings: applicantData.support_meetings || 'Not specified',
        sponsorMentor: applicantData.sponsor_mentor || 'Not specified',
        recoveryContext: applicantData.recovery_context || '',
        spiritualAffiliation: applicantData.spiritual_affiliation || 'Not specified',
        wantRecoverySupport: applicantData.want_recovery_support || false,
        comfortableDiscussing: applicantData.comfortable_discussing_recovery || false,
        attendMeetingsTogether: applicantData.attend_meetings_together || false,
        recoveryAccountability: applicantData.recovery_accountability || false,
        mentorshipInterest: applicantData.mentorship_interest || false,
        
        // Goals and session tracking (use PSS clients data when available)
        recoveryGoals: client.recovery_goals || [],
        nextFollowup: client.next_followup_date,
        followupFrequency: client.followup_frequency || 'weekly',
        lastContact: client.last_contact_date,
        totalSessions: client.total_sessions || 0,
        status: client.status || 'active'
      };
    } catch (err) {
      console.warn(`Error enriching client data for ${client.client_id}:`, err);
      return {
        ...client,
        displayName: 'Unknown Client',
        recoveryGoals: [],
        status: 'active'
      };
    }
  })
);

      setClients(enrichedClients);

    } catch (err) {
      console.error('💥 Error loading PSS clients:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Load available peer support connections that haven't been added as clients yet
   */
  const loadAvailableConnections = async () => {
    if (!profile?.id) return;

    try {
      console.log('🔄 Loading available peer support connections...');
      
      // ✅ FIXED: Pass correct parameters to matchGroups service
      const result = await db.matchGroups.getByUserId('peer-support', profile.id);
      
      if (result.data && !result.error) {
        const peerSupportConnections = result.data.filter(match => 
          match.peer_support_id === profile.id && 
          (match.status === 'confirmed' || match.status === 'forming') // Ready to become clients
        );

        console.log(`📊 Found ${peerSupportConnections.length} potential peer support connections`);

        // Get existing client IDs to filter out
        const existingClientIds = clients.map(client => client.client_id);
        console.log(`📊 Found ${existingClientIds.length} existing clients to filter out`);

        // Filter connections that aren't already clients
        const availableConnections = peerSupportConnections.filter(connection => {
          const clientId = connection.applicant_1_id || connection.applicant_2_id;
          return clientId && !existingClientIds.includes(clientId);
        });

        console.log(`📊 Found ${availableConnections.length} available connections after filtering`);

        // Enrich with profile data
        const enrichedConnections = await Promise.all(
          availableConnections.map(async (connection) => {
            const clientId = connection.applicant_1_id || connection.applicant_2_id;
            
            try {
              const profileResult = await db.profiles.getById(clientId);
              let applicantProfile = null;
              
              try {
                const applicantResult = await db.matchingProfiles.getByUserId(clientId);
                applicantProfile = applicantResult.data;
              } catch (err) {
                console.warn(`Could not load matching profile for potential client ${clientId}`);
              }
              
              return {
                ...connection,
                client_id: clientId,
                profile: profileResult.data,
                applicantProfile: applicantProfile,
                displayName: profileResult.data?.first_name 
                  ? `${profileResult.data.first_name} ${profileResult.data.last_name?.charAt(0) || ''}.`
                  : 'Anonymous'
              };
            } catch (err) {
              console.warn(`Error enriching connection ${clientId}:`, err);
              return {
                ...connection,
                client_id: clientId,
                displayName: 'Unknown Connection'
              };
            }
          })
        );

        setAvailableConnections(enrichedConnections);
        console.log(`✅ Loaded ${enrichedConnections.length} enriched available connections`);
      }

    } catch (err) {
      console.warn('Error loading available connections:', err);
    }
  };

  /**
   * Add a connection as a new PSS client
   */
  const handleAddClient = async (connection) => {
    if (!profile?.id) return;

    try {
      console.log('➕ Adding new PSS client:', connection.displayName);

      // Try to use PSS clients service if available
      if (db.pssClients && typeof db.pssClients.create === 'function') {
        const clientData = {
          peer_specialist_id: profile.id,
          client_id: connection.client_id,
          match_group_id: connection.id,
          status: 'active',
          next_followup_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 1 week from now
          followup_frequency: 'weekly',
          recovery_goals: [],
          total_sessions: 0,
          created_by: profile.id
        };

        const result = await db.pssClients.create(clientData);

        if (result.error) {
          throw new Error(result.error.message || 'Failed to add client');
        }

        alert(`${connection.displayName} has been added as your client!`);
      } else {
        // Fallback: Update match_group status to indicate client relationship
        console.log('🔄 Using fallback method to mark as client...');
        
        const result = await db.matchGroups.update(connection.id, {
          status: 'active',
          notes: 'Active PSS client relationship',
          updated_at: new Date().toISOString()
        });

        if (result.error) {
          throw new Error(result.error.message || 'Failed to update connection status');
        }

        alert(`${connection.displayName} has been marked as your client! Full client management features will be available when the PSS system is fully implemented.`);
      }
      
      // Remove from available connections
      setAvailableConnections(prev => 
        prev.filter(conn => conn.id !== connection.id)
      );
      
      // Refresh the client list
      loadClients();

    } catch (err) {
      console.error('💥 Error adding client:', err);
      alert(`Failed to add client: ${err.message}`);
    }
  };

  /**
   * Update client information
   */
const handleUpdateClient = async (clientId, updates) => {
  if (!profile?.id) return false;

  try {
    console.log('📝 Updating client:', clientId, updates);

    // Try PSS clients service first, fall back to match updates
    if (db.pssClients && typeof db.pssClients.update === 'function') {
      const result = await db.pssClients.update(clientId, {
        ...updates,
        updated_at: new Date().toISOString()
      });

      if (result.error) {
        throw new Error(result.error.message || 'Failed to update client');
      }

      // ✅ FIX: Refresh the entire client list to get updated data
      await loadClients();
      
      return true;
    } else {
      // Fallback logic stays the same...
      console.log('Using fallback: storing in peer_support_matches');
      // ... existing fallback code
    }
  } catch (err) {
    console.error('💥 Error updating client:', err);
    alert(`Failed to update client: ${err.message}`);
    return false;
  }
};


  /**
   * Add a new recovery goal
   */
  const handleAddGoal = async (client) => {
    if (!newGoal.trim()) return;

    const goalObject = {
      id: crypto.randomUUID(),
      goal: newGoal.trim(),
      status: 'active',
      created_at: new Date().toISOString(),
      progress_notes: []
    };

    const updatedGoals = [...(client.recoveryGoals || []), goalObject];

    const success = await handleUpdateClient(client.id, {
      recovery_goals: updatedGoals
    });

    if (success) {
      setNewGoal('');
      setActiveModal(null);
    }
  };

  /**
   * Update goal status
   */
  const handleUpdateGoal = async (client, goalId, updates) => {
    const updatedGoals = client.recoveryGoals.map(goal =>
      goal.id === goalId
        ? { ...goal, ...updates, updated_at: new Date().toISOString() }
        : goal
    );

    await handleUpdateClient(client.id, {
      recovery_goals: updatedGoals
    });
  };

  /**
   * Get status badge styling
   */
  const getStatusBadge = (status) => {
    const badges = {
      active: { text: 'Active', class: 'badge-success' },
      on_hold: { text: 'On Hold', class: 'badge-warning' },
      completed: { text: 'Completed', class: 'badge-info' },
      transferred: { text: 'Transferred', class: 'badge-secondary' },
      inactive: { text: 'Inactive', class: 'badge-error' }
    };
    return badges[status] || badges.active;
  };

  /**
   * Format follow-up frequency for display
   */
  const formatFollowupFrequency = (frequency) => {
    const frequencies = {
      daily: 'Daily',
      twice_weekly: '2x/week',
      weekly: 'Weekly',
      bi_weekly: 'Bi-weekly',
      monthly: 'Monthly',
      as_needed: 'As needed'
    };
    return frequencies[frequency] || frequency;
  };

  /**
   * Get days until next follow-up
   */
  const getDaysUntilFollowup = (followupDate) => {
    if (!followupDate) return null;
    const today = new Date();
    const followup = new Date(followupDate);
    const diffTime = followup - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  /**
   * Get follow-up alert styling based on status
   */
  const getFollowupAlertClass = (daysUntilFollowup) => {
    if (daysUntilFollowup === null) return styles.followupOnTrack;
    if (daysUntilFollowup < 0) return styles.followupOverdue;
    if (daysUntilFollowup <= 2) return styles.followupDueSoon;
    return styles.followupOnTrack;
  };

  return (
    <div className="content">
      {/* Header */}
      <div className="text-center mb-5">
        <h1 className="welcome-title">Peer Support Hub</h1>
        <p className="welcome-text">
          Manage your peer support clients, track recovery goals, and coordinate ongoing support
        </p>
      </div>

      {/* Error State */}
      {error && (
        <div className={styles.errorContainer}>
          <div className="alert alert-error">
            <h4>Error Loading Clients</h4>
            <p>{error}</p>
            <button 
              className="btn btn-outline"
              onClick={() => {
                setError(null);
                loadClients();
              }}
            >
              Try Again
            </button>
          </div>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className={styles.loadingContainer}>
          <LoadingSpinner size="large" text="Loading your clients..." />
        </div>
      )}

      {/* Available Connections to Add */}
      {!loading && availableConnections.length > 0 && (
        <div className={styles.availableConnectionsCard}>
          <h3 className="card-title">Available Connections</h3>
          <p className="card-text mb-4">
            These individuals have connected with you for peer support but haven't been added to your client list yet.
          </p>
          
          <div className={styles.availableConnectionsGrid}>
            {availableConnections.map((connection) => (
              <div key={connection.id} className={styles.connectionCard}>
                <h4 className={styles.connectionName}>{connection.displayName}</h4>
                <div className={styles.connectionMeta}>
                  <div>Connected: {new Date(connection.created_at).toLocaleDateString()}</div>
                  {connection.applicantProfile?.recovery_stage && (
                    <div>Recovery Stage: {connection.applicantProfile.recovery_stage}</div>
                  )}
                </div>
                
                <button
                  className="btn btn-primary"
                  onClick={() => handleAddClient(connection)}
                >
                  Add as Client
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Current Clients */}
      {!loading && clients.length > 0 && (
        <>
          <div className={styles.clientsHeader}>
            <h3 className="card-title">
              Your Clients ({clients.length})
            </h3>
            <button 
              className={styles.refreshButton}
              onClick={loadClients}
              disabled={loading}
            >
              🔄 Refresh
            </button>
          </div>

          <div className={styles.clientsGrid}>
            {clients.map((client) => {
              const statusBadge = getStatusBadge(client.status);
              const daysUntilFollowup = getDaysUntilFollowup(client.nextFollowup);
              const followupAlertClass = getFollowupAlertClass(daysUntilFollowup);
              
              return (
                <div key={client.id} className={styles.clientCard}>
                  {/* Client Header */}
                  <div className={styles.clientCardHeader}>
                    <div>
                      <div className={styles.clientName}>{client.displayName}</div>
                      <div className={styles.clientSubtitle}>
                        {client.totalSessions || 0} sessions • 
                        {client.lastContact 
                          ? ` Last contact: ${new Date(client.lastContact).toLocaleDateString()}`
                          : ' No recent contact'
                        }
                      </div>
                    </div>
                    
                    <div className={styles.clientStatusBadge}>
                      <span className={`badge ${statusBadge.class}`}>
                        {statusBadge.text}
                      </span>
                    </div>
                  </div>

                  {/* Client Info */}
                  <div className={styles.clientInfo}>
                    <div className={styles.clientInfoGrid}>
                      <div>
                        <span className={styles.infoLabel}>Phone:</span>
                        <span className={styles.infoValue}> {client.phone || 'Not provided'}</span>
                      </div>
                      <div>
                        <span className={styles.infoLabel}>Email:</span>
                        <span className={styles.infoValue}> {client.email || 'Not provided'}</span>
                      </div>
                    </div>

                    <div className={styles.clientInfoGrid}>
                      <div>
                        <span className={styles.infoLabel}>Recovery Stage:</span>
                        <span className={styles.infoValue}> {client.recoveryStage}</span>
                      </div>
                      <div>
                        <span className={styles.infoLabel}>Follow-up:</span>
                        <span className={styles.infoValue}> {formatFollowupFrequency(client.followupFrequency)}</span>
                      </div>
                    </div>

                    {/* Primary Substances */}
                    {client.primarySubstances?.length > 0 && (
                      <div className="mb-3">
                        <span className={styles.infoLabel}>Primary Substances:</span>
                        <div className={styles.substancesList}>
                          {client.primarySubstances.map((substance, i) => (
                            <span key={i} className={styles.substanceBadge}>
                              {substance}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Follow-up Status */}
                    {client.nextFollowup && (
                      <div className={`${styles.followupAlert} ${followupAlertClass}`}>
                        <strong>Next Follow-up:</strong> {new Date(client.nextFollowup).toLocaleDateString()}
                        {daysUntilFollowup < 0 && (
                          <span className="ml-2">(Overdue by {Math.abs(daysUntilFollowup)} days)</span>
                        )}
                        {daysUntilFollowup >= 0 && daysUntilFollowup <= 2 && (
                          <span className="ml-2">(Due in {daysUntilFollowup} days)</span>
                        )}
                      </div>
                    )}
<div className={styles.enhancedClientInfo}>
  {/* Recovery Details */}
  <div className={styles.recoverySection}>
    <h5>Recovery Information</h5>
    <div className={styles.recoveryGrid}>
      <div>
        <span className={styles.infoLabel}>Time in Recovery:</span>
        <span className={styles.infoValue}> {client.timeInRecovery}</span>
      </div>
      <div>
        <span className={styles.infoLabel}>Support Meetings:</span>
        <span className={styles.infoValue}> {client.supportMeetings}</span>
      </div>
      {client.sponsorMentor && client.sponsorMentor !== 'Not specified' && (
        <div>
          <span className={styles.infoLabel}>Sponsor/Mentor:</span>
          <span className={styles.infoValue}> {client.sponsorMentor}</span>
        </div>
      )}
    </div>
  </div>
<div className={styles.contactInfo}>
  <h5>Contact Information</h5>
  <div className={styles.contactGrid}>
    <div>
      <span className={styles.infoLabel}>Client Phone:</span>
      <span className={styles.infoValue}> {client.phone || 'Not provided'}</span>
    </div>
    <div>
      <span className={styles.infoLabel}>Client Email:</span>
      <span className={styles.infoValue}> {client.email || 'Not provided'}</span>
    </div>
    {client.applicantProfile?.sponsor_mentor && client.applicantProfile.sponsor_mentor !== 'Not specified' && (
      <div>
        <span className={styles.infoLabel}>Sponsor/Mentor:</span>
        <span className={styles.infoValue}> {client.applicantProfile.sponsor_mentor}</span>
      </div>
    )}
    {client.applicantProfile?.emergency_contact_name && (
      <>
        <div>
          <span className={styles.infoLabel}>Emergency Contact:</span>
          <span className={styles.infoValue}> {client.applicantProfile.emergency_contact_name}</span>
        </div>
        {client.applicantProfile?.emergency_contact_phone && (
          <div>
            <span className={styles.infoLabel}>Emergency Phone:</span>
            <span className={styles.infoValue}> {client.applicantProfile.emergency_contact_phone}</span>
          </div>
        )}
      </>
    )}
  </div>
</div>

  {/* Recovery Preferences */}
  <div className={styles.preferencesSection}>
    <h5>Recovery Preferences</h5>
    <div className={styles.preferencesTags}>
      {client.wantRecoverySupport && (
        <span className={styles.preferenceTag}>Wants Recovery Support</span>
      )}
      {client.comfortableDiscussing && (
        <span className={styles.preferenceTag}>Comfortable Discussing Recovery</span>
      )}
      {client.attendMeetingsTogether && (
        <span className={styles.preferenceTag}>Attend Meetings Together</span>
      )}
      {client.recoveryAccountability && (
        <span className={styles.preferenceTag}>Recovery Accountability</span>
      )}
      {client.mentorshipInterest && (
        <span className={styles.preferenceTag}>Mentorship Interest</span>
      )}
    </div>
  </div>

  {/* Recovery Context */}
  {client.recoveryContext && (
    <div className={styles.contextSection}>
      <h5>Recovery Context</h5>
      <p className={styles.contextText}>{client.recoveryContext}</p>
    </div>
  )}
</div>
                    {/* Recovery Goals Preview */}
                    <div className={styles.goalsSection}>
                      <div className={styles.goalsHeader}>
                        🎯 Recovery Goals ({client.recoveryGoals?.length || 0}/5)
                      </div>
                      {client.recoveryGoals?.length > 0 ? (
                        <div className={styles.goalsList}>
                          {client.recoveryGoals.slice(0, 3).map((goal) => (
                            <div key={goal.id} className={styles.goalItem}>
                              <span className={`${styles.goalStatus} ${styles[`goalStatus${goal.status.charAt(0).toUpperCase() + goal.status.slice(1)}`]}`}>
                                {goal.status}
                              </span>
                              <span className={styles.goalText}>{goal.goal}</span>
                            </div>
                          ))}
                          {client.recoveryGoals.length > 3 && (
                            <div className={styles.moreGoalsText}>+{client.recoveryGoals.length - 3} more goals</div>
                          )}
                        </div>
                      ) : (
                        <div className={styles.noGoalsText}>No goals set yet</div>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className={styles.clientActions}>
                    <button
                      className={`${styles.actionButton} ${styles.actionPrimary}`}
                      onClick={() => {
                        setSelectedClient(client);
                        setActiveModal('goals');
                      }}
                      disabled={!db.pssClients}
                    >
                      🎯 Manage Goals
                    </button>
                    
                    <button
                      className={`${styles.actionButton} ${styles.actionSecondary}`}
                      onClick={() => {
                        setEditingClient(client);
                        setActiveModal('edit');
                      }}
                      disabled={!db.pssClients}
                    >
                      📝 Update Info
                    </button>
                    <button
                      className={`${styles.actionButton} ${styles.actionSecondary}`}
                      onClick={() => {
                        setSelectedClient(client);
                        setActiveModal('session-log');
                      }}
                    >
                      📝 Log Session
                    </button>
                    <button
                      className={`${styles.actionButton} ${styles.actionOutline}`}
                      onClick={() => {
                        const phoneUrl = client.phone ? `tel:${client.phone}` : '#';
                        if (client.phone && client.phone !== 'Not provided') {
                          window.location.href = phoneUrl;
                        } else {
                          alert('No phone number available for this client');
                        }
                      }}
                      disabled={!client.phone || client.phone === 'Not provided'}
                    >
                      📞 Call
                    </button>

                    <button
                      className={`${styles.actionButton} ${styles.actionOutline}`}
                      onClick={() => {
                        const emailUrl = client.email ? `mailto:${client.email}` : '#';
                        if (client.email) {
                          window.location.href = emailUrl;
                        } else {
                          alert('No email address available for this client');
                        }
                      }}
                      disabled={!client.email}
                    >
                      📧 Email
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* No Clients State */}
      {!loading && clients.length === 0 && availableConnections.length === 0 && (
        <div className={styles.emptyState}>
          <div className={styles.emptyStateIcon}>👥</div>
          <h3 className={styles.emptyStateTitle}>No Clients Yet</h3>
          <p className={styles.emptyStateMessage}>Once individuals connect with you for peer support, they'll appear here as potential clients.</p>
          <div className={styles.emptyStateSubtext}>To get started:</div>
          <div className={styles.emptyStateActions}>
            <button className="btn btn-outline">
              📋 Update Your Profile
            </button>
            <button className="btn btn-outline">
              📞 Check Connection Requests
            </button>
          </div>
        </div>
      )}

      {/* Back Button */}
      {onBack && (
        <div className="text-center">
          <button
            className="btn btn-outline"
            onClick={onBack}
          >
            ← Back to Dashboard
          </button>
        </div>
      )}

      {/* Goals Management Modal */}
      {activeModal === 'goals' && selectedClient && (
        <div className="modal-overlay" onClick={() => setActiveModal(null)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>Recovery Goals - {selectedClient.displayName}</h3>
              <button className={styles.modalClose} onClick={() => setActiveModal(null)}>×</button>
            </div>

            <div className={styles.modalBody}>
              {/* Current Goals */}
              <div className={styles.currentGoalsSection}>
                <h4 className={styles.currentGoalsTitle}>Current Goals ({selectedClient.recoveryGoals?.length || 0}/5)</h4>
                
                {selectedClient.recoveryGoals?.length > 0 ? (
                  <div>
                    {selectedClient.recoveryGoals.map((goal) => (
                      <div key={goal.id} className={styles.goalCard}>
                        <div className={styles.goalCardHeader}>
                          <div className={styles.goalCardText}>
                            <div className={styles.goalTitle}>{goal.goal}</div>
                            <div className={styles.goalMeta}>
                              Created: {new Date(goal.created_at).toLocaleDateString()}
                              {goal.target_date && (
                                <> • Target: {new Date(goal.target_date).toLocaleDateString()}</>
                              )}
                            </div>
                          </div>
                          
                          <div className={styles.goalControls}>
                            <select
                              value={goal.status}
                              onChange={(e) => handleUpdateGoal(selectedClient, goal.id, { status: e.target.value })}
                              className={styles.goalStatusSelect}
                            >
                              <option value="active">Active</option>
                              <option value="completed">Completed</option>
                              <option value="paused">Paused</option>
                              <option value="cancelled">Cancelled</option>
                            </select>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="alert alert-info">
                    <p>No recovery goals set yet. Add the first goal below.</p>
                  </div>
                )}
              </div>

              {/* Add New Goal */}
              {(selectedClient.recoveryGoals?.length || 0) < 5 && (
                <div className={styles.addGoalSection}>
                  <h4 className={styles.addGoalTitle}>Add New Goal</h4>
                  <div className="form-group">
                    <textarea
                      className={styles.goalInput}
                      placeholder="Enter a specific, measurable recovery goal..."
                      value={newGoal}
                      onChange={(e) => setNewGoal(e.target.value)}
                      rows="3"
                    />
                  </div>
                  <button
                    className="btn btn-primary"
                    onClick={() => handleAddGoal(selectedClient)}
                    disabled={!newGoal.trim()}
                  >
                    Add Goal
                  </button>
                </div>
              )}

              {selectedClient.recoveryGoals?.length >= 5 && (
                <div className={styles.maxGoalsWarning}>
                  <p>Maximum of 5 active goals reached. Complete or remove existing goals to add new ones.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Edit Client Modal */}
      {activeModal === 'edit' && editingClient && (
        <div className="modal-overlay" onClick={() => setActiveModal(null)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>Update Client Info - {editingClient.displayName}</h3>
              <button className={styles.modalClose} onClick={() => setActiveModal(null)}>×</button>
            </div>

            <div className={styles.modalBody}>
              <div className={styles.editClientForm}>
                <div className="form-group">
                  <label className="label">Next Follow-up Date</label>
                  <input
                    type="date"
                    className="input"
                    value={editingClient.nextFollowup || ''}
                    onChange={(e) => setEditingClient(prev => ({ ...prev, nextFollowup: e.target.value }))}
                  />
                </div>

                <div className="form-group">
                  <label className="label">Follow-up Frequency</label>
                  <select
                    className="input"
                    value={editingClient.followupFrequency || 'weekly'}
                    onChange={(e) => setEditingClient(prev => ({ ...prev, followupFrequency: e.target.value }))}
                  >
                    <option value="daily">Daily</option>
                    <option value="twice_weekly">Twice Weekly</option>
                    <option value="weekly">Weekly</option>
                    <option value="bi_weekly">Bi-weekly</option>
                    <option value="monthly">Monthly</option>
                    <option value="as_needed">As Needed</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="label">Client Status</label>
                  <select
                    className="input"
                    value={editingClient.status || 'active'}
                    onChange={(e) => setEditingClient(prev => ({ ...prev, status: e.target.value }))}
                  >
                    <option value="active">Active</option>
                    <option value="on_hold">On Hold</option>
                    <option value="completed">Completed</option>
                    <option value="transferred">Transferred</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div className={styles.modalActions}>
                <button
                  className="btn btn-outline"
                  onClick={() => setActiveModal(null)}
                >
                  Cancel
                </button>
                
                <button
                  className="btn btn-primary"
                  onClick={async () => {
                    const success = await handleUpdateClient(editingClient.id, {
                      next_followup_date: editingClient.nextFollowup || null,
                      followup_frequency: editingClient.followupFrequency,
                      status: editingClient.status
                    });
                    
                    if (success) {
                      setActiveModal(null);
                      setEditingClient(null);
                    }
                  }}
                >
                  Update Client
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {activeModal === 'session-log' && selectedClient && (
  <div className="modal-overlay" onClick={() => setActiveModal(null)}>
    <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
      <div className={styles.modalHeader}>
        <h3 className={styles.modalTitle}>Log Session - {selectedClient.displayName}</h3>
        <button className={styles.modalClose} onClick={() => setActiveModal(null)}>×</button>
      </div>

      <div className={styles.modalBody}>
        <div className={styles.sessionLogForm}>
          <div className="form-group">
            <label className="label">Session Type</label>
            <select
              className="input"
              value={sessionType}
              onChange={(e) => setSessionType(e.target.value)}
            >
              <option value="">Select session type</option>
              <option value="phone_call">Phone Call</option>
              <option value="in_person">In-Person Meeting</option>
              <option value="video_call">Video Call</option>
              <option value="text_support">Text Support</option>
              <option value="crisis_intervention">Crisis Intervention</option>
              <option value="goal_review">Goal Review</option>
              <option value="check_in">Check-in</option>
            </select>
          </div>

          <div className="form-group">
            <label className="label">Session Duration (minutes)</label>
            <input
              type="number"
              className="input"
              value={sessionDuration}
              onChange={(e) => setSessionDuration(e.target.value)}
              placeholder="30"
              min="1"
              max="300"
            />
          </div>

          <div className="form-group">
            <label className="label">Session Notes</label>
            <textarea
              className="input"
              value={sessionNotes}
              onChange={(e) => setSessionNotes(e.target.value)}
              placeholder="Session summary, progress notes, concerns, next steps..."
              rows="4"
            />
          </div>

          <div className="form-group">
            <label className="label">Client Mood/Status</label>
            <select
              className="input"
              value={clientMood}
              onChange={(e) => setClientMood(e.target.value)}
            >
              <option value="">Select mood/status</option>
              <option value="excellent">Excellent</option>
              <option value="good">Good</option>
              <option value="stable">Stable</option>
              <option value="struggling">Struggling</option>
              <option value="crisis">Crisis</option>
            </select>
          </div>

          <div className="form-group">
            <label className="label">Next Follow-up Date</label>
            <input
              type="date"
              className="input"
              value={nextFollowup}
              onChange={(e) => setNextFollowup(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
            />
          </div>
        </div>

        <div className={styles.modalActions}>
          <button
            className="btn btn-outline"
            onClick={() => setActiveModal(null)}
          >
            Cancel
          </button>
          
          <button
            className="btn btn-primary"
            onClick={handleLogSession}
            disabled={!sessionType || !sessionNotes.trim()}
          >
            Log Session
          </button>
        </div>
      </div>
    </div>
  </div>
)}
    </div>
  );
};

export default PeerSupportHub;
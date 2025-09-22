// src/components/features/peer-support/PeerSupportHub.js - UPDATED WITH CSS MODULE
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { db } from '../../../utils/supabase';
import LoadingSpinner from '../../ui/LoadingSpinner';

// ✅ UPDATED: Import our new CSS foundation and component module
import '../../../styles/main.css';
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

  // Load clients and available connections on mount and when clients change
  useEffect(() => {
    if (user?.id) {
      loadClients();
    }
  }, [user?.id]);

  // Load available connections when clients data changes
  useEffect(() => {
    if (user?.id) {
      loadAvailableConnections();
    }
  }, [user?.id, clients.length]); // Re-run when client count changes

  /**
   * Load existing PSS clients for this peer specialist
   */
  const loadClients = async () => {
    setLoading(true);
    setError(null);

    try {
      console.log('🔄 Loading PSS clients...');
      
      // Get PSS client relationships using the user ID directly
      const result = await db.pssClients.getByPeerSpecialistId(user.id);
      
      if (result.error) {
        throw new Error(result.error.message || 'Failed to load clients');
      }

      const clientData = result.data || [];
      console.log(`📊 Found ${clientData.length} PSS clients`);

      // Enrich client data with applicant profile information
      const enrichedClients = await Promise.all(
        clientData.map(async (client) => {
          try {
            // Client profile comes from the query
            const clientProfile = client.client;

            // Get applicant form data for recovery details (primary substances, recovery stage, etc.)
            const applicantResult = await db.applicantForms.getByUserId(client.client_id);
            const applicantProfile = applicantResult.data;

            return {
              ...client,
              profile: clientProfile,
              applicantProfile: applicantProfile,
              displayName: clientProfile?.first_name 
                ? `${clientProfile.first_name} ${clientProfile.last_name?.charAt(0) || ''}.`
                : 'Anonymous Client',
              phone: applicantProfile?.phone || 'Not provided',
              email: clientProfile?.email,
              primarySubstances: applicantProfile?.primary_substance ? [applicantProfile.primary_substance] : [],
              recoveryStage: applicantProfile?.recovery_stage || 'Not specified',
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
    try {
      console.log('🔄 Loading available peer support connections...');
      
      // Get forming peer support match groups where user is the peer specialist
      const result = await db.matchGroups.getByUserId(user.id);
      
      if (result.data && !result.error) {
        const peerSupportConnections = result.data.filter(match => 
          match.peer_support_id === user.id && 
          match.status === 'forming' &&
          match.connection_type === 'peer_support'
        );

        console.log(`📊 Found ${peerSupportConnections.length} forming peer support connections`);

        // Get existing PSS client relationships directly from database
        const existingClientsResult = await db.pssClients.getByPeerSpecialistId(user.id);
        const existingClientIds = existingClientsResult.data 
          ? existingClientsResult.data.map(client => client.client_id)
          : [];

        console.log(`📊 Found ${existingClientIds.length} existing PSS clients to filter out`);

        // Filter connections that aren't already clients
        const availableConnections = peerSupportConnections.filter(connection => {
          const clientId = connection.applicant_1_id || connection.applicant_2_id;
          return clientId && !existingClientIds.includes(clientId);
        });

        console.log(`📊 Found ${availableConnections.length} available connections after filtering existing clients`);

        // Enrich with profile data
        const enrichedConnections = await Promise.all(
          availableConnections.map(async (connection) => {
            const clientId = connection.applicant_1_id || connection.applicant_2_id;
            const profileResult = await db.profiles.getById(clientId);
            const applicantResult = await db.applicantForms.getByUserId(clientId);
            
            return {
              ...connection,
              client_id: clientId, // Use user ID directly
              profile: profileResult.data,
              applicantProfile: applicantResult.data,
              displayName: profileResult.data?.first_name 
                ? `${profileResult.data.first_name} ${profileResult.data.last_name?.charAt(0) || ''}.`
                : 'Anonymous'
            };
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
    try {
      console.log('➕ Adding new PSS client:', connection.displayName);

      const clientData = {
        peer_specialist_id: user.id, // Use user ID directly
        client_id: connection.client_id, // Use user ID directly
        match_group_id: connection.id,
        status: 'active',
        next_followup_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 1 week from now
        followup_frequency: 'weekly',
        recovery_goals: [],
        total_sessions: 0,
        created_by: user.id
      };

      const result = await db.pssClients.create(clientData);

      if (result.error) {
        throw new Error(result.error.message || 'Failed to add client');
      }

      alert(`${connection.displayName} has been added as your client!`);
      
      // Immediately remove from available connections
      setAvailableConnections(prev => 
        prev.filter(conn => conn.id !== connection.id)
      );
      
      // Refresh the client list to include the new client
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
    try {
      console.log('📝 Updating client:', clientId, updates);

      const result = await db.pssClients.update(clientId, {
        ...updates,
        updated_at: new Date().toISOString()
      });

      if (result.error) {
        throw new Error(result.error.message || 'Failed to update client');
      }

      // Update local state
      setClients(prev => prev.map(client => 
        client.id === clientId 
          ? { ...client, ...updates }
          : client
      ));

      return true;
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
   * ✅ NEW: Get follow-up alert styling based on status
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

      {/* ✅ UPDATED: Error State using CSS module */}
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

      {/* ✅ UPDATED: Loading State using CSS module */}
      {loading && (
        <div className={styles.loadingContainer}>
          <LoadingSpinner />
          <div className={styles.loadingMessage}>Loading your clients...</div>
        </div>
      )}

      {/* ✅ UPDATED: Available Connections to Add using CSS module */}
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

      {/* ✅ UPDATED: Current Clients using CSS module */}
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
                  {/* ✅ UPDATED: Client Header using CSS module */}
                  <div className={styles.clientCardHeader}>
                    <div>
                      <div className={styles.clientName}>{client.displayName}</div>
                      <div className={styles.clientSubtitle}>
                        {client.totalSessions} sessions • 
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

                  {/* ✅ UPDATED: Client Info using CSS module */}
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

                    {/* ✅ UPDATED: Primary Substances using CSS module */}
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

                    {/* ✅ UPDATED: Follow-up Status using CSS module */}
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

                    {/* ✅ UPDATED: Recovery Goals Preview using CSS module */}
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

                  {/* ✅ UPDATED: Action Buttons using CSS module */}
                  <div className={styles.clientActions}>
                    <button
                      className={`${styles.actionButton} ${styles.actionPrimary}`}
                      onClick={() => {
                        setSelectedClient(client);
                        setActiveModal('goals');
                      }}
                    >
                      🎯 Manage Goals
                    </button>
                    
                    <button
                      className={`${styles.actionButton} ${styles.actionSecondary}`}
                      onClick={() => {
                        setEditingClient(client);
                        setActiveModal('edit');
                      }}
                    >
                      📝 Update Info
                    </button>

                    <button
                      className={`${styles.actionButton} ${styles.actionOutline}`}
                      onClick={() => {
                        const phoneUrl = client.phone ? `tel:${client.phone}` : '#';
                        if (client.phone) {
                          window.location.href = phoneUrl;
                        } else {
                          alert('No phone number available for this client');
                        }
                      }}
                      disabled={!client.phone}
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

      {/* ✅ UPDATED: No Clients State using CSS module */}
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

      {/* ✅ UPDATED: Goals Management Modal using CSS module */}
      {activeModal === 'goals' && selectedClient && (
        <div className="modal-overlay" onClick={() => setActiveModal(null)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>Recovery Goals - {selectedClient.displayName}</h3>
              <button className={styles.modalClose} onClick={() => setActiveModal(null)}>×</button>
            </div>

            <div className={styles.modalBody}>
              {/* ✅ UPDATED: Current Goals using CSS module */}
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

              {/* ✅ UPDATED: Add New Goal using CSS module */}
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

      {/* ✅ UPDATED: Edit Client Modal using CSS module */}
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
    </div>
  );
};

export default PeerSupportHub;
// src/components/features/peer-support/PeerSupportHub.js
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../hooks/useAuth';
import { db } from '../../../utils/supabase';
import LoadingSpinner from '../../ui/LoadingSpinner';
import '../../../styles/global.css';

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
        <div className="card mb-5">
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
        <div className="empty-state">
          <LoadingSpinner />
          <p>Loading your clients...</p>
        </div>
      )}

      {/* Available Connections to Add */}
      {!loading && availableConnections.length > 0 && (
        <div className="card mb-5">
          <h3 className="card-title">Available Connections</h3>
          <p className="card-text mb-4">
            These individuals have connected with you for peer support but haven't been added to your client list yet.
          </p>
          
          <div className="grid-auto">
            {availableConnections.map((connection) => (
              <div key={connection.id} className="card" style={{ background: 'var(--bg-light-cream)' }}>
                <h4 className="card-title">{connection.displayName}</h4>
                <div className="text-gray-600 mb-3">
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
          <div className="card mb-4">
            <div className="flex" style={{ alignItems: 'center', justifyContent: 'space-between' }}>
              <h3 className="card-title">
                Your Clients ({clients.length})
              </h3>
              <button 
                className="btn btn-outline btn-sm"
                onClick={loadClients}
                disabled={loading}
              >
                🔄 Refresh
              </button>
            </div>
          </div>

          <div className="grid-auto mb-5">
            {clients.map((client) => {
              const statusBadge = getStatusBadge(client.status);
              const daysUntilFollowup = getDaysUntilFollowup(client.nextFollowup);
              const isOverdue = daysUntilFollowup < 0;
              const isDueSoon = daysUntilFollowup >= 0 && daysUntilFollowup <= 2;
              
              return (
                <div key={client.id} className="card">
                  {/* Client Header */}
                  <div className="card-header">
                    <div>
                      <div className="card-title">{client.displayName}</div>
                      <div className="card-subtitle">
                        {client.totalSessions} sessions • 
                        {client.lastContact 
                          ? ` Last contact: ${new Date(client.lastContact).toLocaleDateString()}`
                          : ' No recent contact'
                        }
                      </div>
                    </div>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', alignItems: 'flex-end' }}>
                      <span className={`badge ${statusBadge.class}`}>
                        {statusBadge.text}
                      </span>
                    </div>
                  </div>

                  {/* Client Info */}
                  <div className="mb-4">
                    <div className="grid-2 text-sm mb-3">
                      <div>
                        <strong>Phone:</strong> {client.phone || 'Not provided'}
                      </div>
                      <div>
                        <strong>Email:</strong> {client.email || 'Not provided'}
                      </div>
                    </div>

                    <div className="grid-2 text-sm mb-3">
                      <div>
                        <strong>Recovery Stage:</strong> {client.recoveryStage}
                      </div>
                      <div>
                        <strong>Follow-up:</strong> {formatFollowupFrequency(client.followupFrequency)}
                      </div>
                    </div>

                    {/* Primary Substances */}
                    {client.primarySubstances?.length > 0 && (
                      <div className="mb-3">
                        <strong>Primary Substances:</strong>
                        <div className="mt-1">
                          {client.primarySubstances.map((substance, i) => (
                            <span key={i} className="badge badge-warning mr-1 mb-1">
                              {substance}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Follow-up Status */}
                    {client.nextFollowup && (
                      <div className={`alert ${isOverdue ? 'alert-error' : isDueSoon ? 'alert-warning' : 'alert-info'}`}>
                        <strong>Next Follow-up:</strong> {new Date(client.nextFollowup).toLocaleDateString()}
                        {isOverdue && (
                          <span className="ml-2 text-red-600">(Overdue by {Math.abs(daysUntilFollowup)} days)</span>
                        )}
                        {isDueSoon && !isOverdue && (
                          <span className="ml-2">(Due in {daysUntilFollowup} days)</span>
                        )}
                      </div>
                    )}

                    {/* Recovery Goals Preview */}
                    <div className="mb-3">
                      <strong>Recovery Goals ({client.recoveryGoals?.length || 0}/5):</strong>
                      {client.recoveryGoals?.length > 0 ? (
                        <div className="mt-2">
                          {client.recoveryGoals.slice(0, 3).map((goal, i) => (
                            <div key={goal.id} className="flex" style={{ alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                              <span className={`badge ${goal.status === 'completed' ? 'badge-success' : goal.status === 'active' ? 'badge-info' : 'badge-warning'}`}>
                                {goal.status}
                              </span>
                              <span className="text-sm">{goal.goal}</span>
                            </div>
                          ))}
                          {client.recoveryGoals.length > 3 && (
                            <div className="text-sm text-gray-600">+{client.recoveryGoals.length - 3} more goals</div>
                          )}
                        </div>
                      ) : (
                        <div className="text-gray-600 text-sm mt-1">No goals set yet</div>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="button-grid">
                    <button
                      className="btn btn-primary"
                      onClick={() => {
                        setSelectedClient(client);
                        setActiveModal('goals');
                      }}
                    >
                      🎯 Manage Goals
                    </button>
                    
                    <button
                      className="btn btn-secondary"
                      onClick={() => {
                        setEditingClient(client);
                        setActiveModal('edit');
                      }}
                    >
                      📝 Update Info
                    </button>

                    <button
                      className="btn btn-outline"
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
                      className="btn btn-outline"
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
        <div className="card text-center">
          <h3>No Clients Yet</h3>
          <p>Once individuals connect with you for peer support, they'll appear here as potential clients.</p>
          <div className="mt-4">
            <p className="text-gray-600 mb-3">To get started:</p>
            <div className="grid-auto">
              <button className="btn btn-outline">
                📋 Update Your Profile
              </button>
              <button className="btn btn-outline">
                📞 Check Connection Requests
              </button>
            </div>
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
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Recovery Goals - {selectedClient.displayName}</h3>
              <button className="modal-close" onClick={() => setActiveModal(null)}>×</button>
            </div>

            <div style={{ padding: '1rem' }}>
              {/* Current Goals */}
              <div className="mb-4">
                <h4>Current Goals ({selectedClient.recoveryGoals?.length || 0}/5)</h4>
                
                {selectedClient.recoveryGoals?.length > 0 ? (
                  <div className="mt-3">
                    {selectedClient.recoveryGoals.map((goal) => (
                      <div key={goal.id} className="card" style={{ background: 'var(--gray-100)', marginBottom: '1rem' }}>
                        <div className="flex" style={{ alignItems: 'flex-start', justifyContent: 'space-between' }}>
                          <div style={{ flex: 1 }}>
                            <div className="font-weight-600 mb-2">{goal.goal}</div>
                            <div className="text-sm text-gray-600">
                              Created: {new Date(goal.created_at).toLocaleDateString()}
                              {goal.target_date && (
                                <> • Target: {new Date(goal.target_date).toLocaleDateString()}</>
                              )}
                            </div>
                          </div>
                          
                          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                            <select
                              value={goal.status}
                              onChange={(e) => handleUpdateGoal(selectedClient, goal.id, { status: e.target.value })}
                              className="input input-sm"
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
                <div className="mb-4">
                  <h4>Add New Goal</h4>
                  <div className="form-group">
                    <textarea
                      className="input"
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
                <div className="alert alert-warning">
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
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Update Client Info - {editingClient.displayName}</h3>
              <button className="modal-close" onClick={() => setActiveModal(null)}>×</button>
            </div>

            <div style={{ padding: '1rem' }}>
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

              <div className="grid-2">
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
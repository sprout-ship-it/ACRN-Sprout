// src/components/features/peer-support/PeerSupportDashboard.js
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../hooks/useAuth';
import { supabase } from '../../../utils/supabase';
import LoadingSpinner from '../../ui/LoadingSpinner';
import ClientProfileModal from './ClientProfileModal';
import styles from './PeerSupportDashboard.module.css';

const PeerSupportDashboard = ({ onBack, onClientSelect }) => {
  const { user, profile } = useAuth();
  const [clients, setClients] = useState([]);
  const [formerClients, setFormerClients] = useState([]);
  const [availableConnections, setAvailableConnections] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('active'); // 'active' or 'former'
  const [selectedClient, setSelectedClient] = useState(null);
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [selectedProfileClient, setSelectedProfileClient] = useState(null);

  // Get peer support profile ID
  const [peerSupportProfileId, setPeerSupportProfileId] = useState(null);

  useEffect(() => {
    const loadPeerSupportId = async () => {
      if (!profile?.id) return;
      
      const { data } = await supabase
        .from('peer_support_profiles')
        .select('id')
        .eq('user_id', profile.id)
        .single();
      
      if (data) {
        setPeerSupportProfileId(data.id);
      }
    };

    loadPeerSupportId();
  }, [profile?.id]);

  // Load clients when peer support profile ID is available
  useEffect(() => {
    if (peerSupportProfileId) {
      loadClients();
    }
  }, [peerSupportProfileId]);

  // ✅ FIX: Load available connections AFTER clients are loaded
  useEffect(() => {
    if (peerSupportProfileId && (clients.length > 0 || formerClients.length > 0 || !loading)) {
      loadAvailableConnections();
    }
  }, [peerSupportProfileId, clients.length, formerClients.length]);

  /**
   * ✅ UPDATED: Load PSS clients - separating active from former clients
   * ✅ FIX: Manual join since foreign key relationship doesn't exist
   */
  const loadClients = async () => {
    if (!peerSupportProfileId) return;
    
    setLoading(true);
    setError(null);

    try {
      console.log('🔄 Loading PSS clients for peer specialist:', peerSupportProfileId);
      
      // Load all pss_clients records (active and inactive) - WITHOUT joins
      const { data: pssClientsData, error: pssError } = await supabase
        .from('pss_clients')
        .select('*')
        .eq('peer_specialist_id', peerSupportProfileId)
        .order('updated_at', { ascending: false });

      if (pssError) throw pssError;

      console.log(`📊 Found ${pssClientsData?.length || 0} total PSS client records`);

      // Extract unique client IDs
      const clientIds = [...new Set(pssClientsData?.map(c => c.client_id) || [])];
      
      if (clientIds.length === 0) {
        setClients([]);
        setFormerClients([]);
        setLoading(false);
        return;
      }

      // ✅ FIX: Load applicant profiles separately and join manually
      const { data: applicantData, error: applicantError } = await supabase
        .from('applicant_matching_profiles')
        .select('*, registrant_profiles(*)')
        .in('id', clientIds);

      if (applicantError) throw applicantError;

      console.log(`📊 Loaded ${applicantData?.length || 0} applicant profiles`);

      // Create a map for quick lookup
      const applicantMap = {};
      applicantData?.forEach(app => {
        applicantMap[app.id] = app;
      });

      // Enrich and separate active from former clients
      const activeClientsList = [];
      const formerClientsList = [];

      for (const client of pssClientsData || []) {
        const applicant = applicantMap[client.client_id];
        const clientProfile = applicant?.registrant_profiles;

        if (!applicant || !clientProfile) {
          console.warn(`Incomplete data for client:`, client);
          continue;
        }

        const enrichedClient = {
          ...client,
          profile: clientProfile,
          applicantProfile: applicant,
          displayName: clientProfile.first_name 
            ? `${clientProfile.first_name} ${clientProfile.last_name?.charAt(0) || ''}.`
            : 'Anonymous Client',
          phone: applicant.primary_phone || 'Not provided',
          email: clientProfile.email,
          
          // Recovery information
          primarySubstances: applicant.primary_substance ? [applicant.primary_substance] : [],
          recoveryStage: applicant.recovery_stage || 'Not specified',
          sobrietyDate: applicant.sobriety_date || null,
          recoveryMethods: applicant.recovery_methods || [],
          supportMeetings: applicant.support_meetings || 'Not specified',
          sponsorMentor: applicant.sponsor_mentor || 'Not specified',
          recoveryContext: applicant.recovery_context || '',
          spiritualAffiliation: applicant.spiritual_affiliation || 'Not specified',
          wantRecoverySupport: applicant.want_recovery_support || false,
          comfortableDiscussing: applicant.comfortable_discussing_recovery || false,
          attendMeetingsTogether: applicant.attend_meetings_together || false,
          recoveryAccountability: applicant.recovery_accountability || false,
          mentorshipInterest: applicant.mentorship_interest || false,
          
          // Goals and session tracking
          recoveryGoals: client.recovery_goals || [],
          nextFollowup: client.next_followup_date,
          followupFrequency: client.followup_frequency || 'weekly',
          lastContact: client.last_contact_date,
          totalSessions: client.total_sessions || 0,
          status: client.status || 'active'
        };

        // ✅ DEBUG: Log status to understand categorization
        console.log(`Client ${enrichedClient.displayName} has status: ${enrichedClient.status}`);

        // Separate into active vs former based on status
        if (client.status === 'active' || client.status === 'on_hold') {
          activeClientsList.push(enrichedClient);
        } else {
          // inactive, completed, or transferred
          formerClientsList.push(enrichedClient);
        }
      }

      console.log(`✅ Loaded ${activeClientsList.length} active clients and ${formerClientsList.length} former clients`);
      
      setClients(activeClientsList);
      setFormerClients(formerClientsList);

    } catch (err) {
      console.error('💥 Error loading PSS clients:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  /**
   * ✅ UPDATED: Load available peer support connections from peer_support_matches
   * ✅ FIX: Manual join since foreign key relationship doesn't exist
   */
  const loadAvailableConnections = async () => {
    if (!peerSupportProfileId) return;

    try {
      console.log('🔄 Loading available peer support connections...');
      
      // Load peer_support_matches that are active but not yet in pss_clients
      const { data: matches, error } = await supabase
        .from('peer_support_matches')
        .select('*')
        .eq('peer_support_id', peerSupportProfileId)
        .eq('status', 'active');

      if (error) throw error;

      console.log(`📊 Found ${matches?.length || 0} active peer support matches`);

      // Filter out matches that already have pss_clients records
      const existingClientIds = [...clients, ...formerClients].map(c => c.client_id);
      
      const availableMatches = (matches || []).filter(match => 
        !existingClientIds.includes(match.applicant_id)
      );

      console.log(`📊 Found ${availableMatches.length} available connections (not yet added as clients)`);

      if (availableMatches.length === 0) {
        setAvailableConnections([]);
        return;
      }

      // ✅ FIX: Load applicant profiles separately
      const applicantIds = availableMatches.map(m => m.applicant_id);
      
      const { data: applicantData, error: applicantError } = await supabase
        .from('applicant_matching_profiles')
        .select('*, registrant_profiles(*)')
        .in('id', applicantIds);

      if (applicantError) throw applicantError;

      // Create a map for quick lookup
      const applicantMap = {};
      applicantData?.forEach(app => {
        applicantMap[app.id] = app;
      });

      // Enrich with profile data
      const enrichedConnections = availableMatches.map(match => {
        const applicant = applicantMap[match.applicant_id];
        
        return {
          id: match.id,
          client_id: match.applicant_id,
          applicant: applicant,
          profile: applicant?.registrant_profiles,
          applicantProfile: applicant,
          displayName: applicant?.registrant_profiles?.first_name
            ? `${applicant.registrant_profiles.first_name} ${applicant.registrant_profiles.last_name?.charAt(0) || ''}.`
            : 'Anonymous',
          created_at: match.created_at
        };
      });

      setAvailableConnections(enrichedConnections);
      console.log(`✅ Loaded ${enrichedConnections.length} enriched available connections`);

    } catch (err) {
      console.warn('Error loading available connections:', err);
    }
  };

  /**
   * ✅ UPDATED: Add a connection as a new PSS client
   */
  const handleAddClient = async (connection) => {
    if (!peerSupportProfileId) return;

    try {
      console.log('➕ Adding new PSS client:', connection.displayName);

      const nextFollowupDate = new Date();
      nextFollowupDate.setDate(nextFollowupDate.getDate() + 7); // 7 days from now

      const { error } = await supabase
        .from('pss_clients')
        .insert({
          peer_specialist_id: peerSupportProfileId,
          client_id: connection.client_id,
          status: 'active',
          followup_frequency: 'weekly',
          next_followup_date: nextFollowupDate.toISOString().split('T')[0],
          total_sessions: 0,
          recovery_goals: [],
          progress_notes: [],
          consent_to_contact: true,
          created_by: profile.id
        });

      if (error) throw error;

      alert(`${connection.displayName} has been added as your client!`);
      
      // Remove from available connections and refresh client list
      setAvailableConnections(prev => 
        prev.filter(conn => conn.id !== connection.id)
      );
      loadClients();

    } catch (err) {
      console.error('💥 Error adding client:', err);
      alert(`Failed to add client: ${err.message}`);
    }
  };

  /**
   * Open the unified client management modal
   */
  const handleOpenClientModal = (client) => {
    console.log('Opening client modal for:', client.displayName);
    console.log('Client data being passed:', {
      id: client.id,
      pss_client_id: client.id, // This should be pss_clients.id
      recovery_goals: client.recoveryGoals,
      total_sessions: client.totalSessions,
      next_followup: client.nextFollowup,
      status: client.status
    });
    
    setSelectedClient(client);
    
    // Call parent's callback if provided (for modal integration)
    if (onClientSelect) {
      onClientSelect(client);
    }
  };

  /**
   * ✅ NEW: Reactivate a former client
   */
  const handleReactivateClient = async (client) => {
    try {
      const confirmed = window.confirm(`Reactivate ${client.displayName} as an active client?`);
      if (!confirmed) return;

      console.log('🔄 Reactivating client:', client.id);

      const { error } = await supabase
        .from('pss_clients')
        .update({
          status: 'active',
          updated_at: new Date().toISOString()
        })
        .eq('id', client.id);

      if (error) throw error;

      alert(`${client.displayName} has been reactivated!`);
      loadClients();

    } catch (err) {
      console.error('💥 Error reactivating client:', err);
      alert(`Failed to reactivate client: ${err.message}`);
    }
  };

  /**
   * ✅ UPDATED: View client's full profile in modal
   */
  const handleViewProfile = (client) => {
    console.log('Viewing profile for client:', client.displayName);
    setSelectedProfileClient(client);
    setProfileModalOpen(true);
  };

  /**
   * Utility functions
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

  const getDaysUntilFollowup = (followupDate) => {
    if (!followupDate) return null;
    const today = new Date();
    const followup = new Date(followupDate);
    const diffTime = followup - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getFollowupAlertClass = (daysUntilFollowup) => {
    if (daysUntilFollowup === null) return styles.followupOnTrack;
    if (daysUntilFollowup < 0) return styles.followupOverdue;
    if (daysUntilFollowup <= 2) return styles.followupDueSoon;
    return styles.followupOnTrack;
  };

  /**
   * ✅ NEW: Render client card (reusable for both active and former)
   */
  const renderClientCard = (client, isFormer = false) => {
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
            {!isFormer && (
              <div>
                <span className={styles.infoLabel}>Follow-up:</span>
                <span className={styles.infoValue}> {formatFollowupFrequency(client.followupFrequency)}</span>
              </div>
            )}
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

          {/* Follow-up Status (Active clients only) */}
          {!isFormer && client.nextFollowup && (
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

          {/* Recovery Goals Preview */}
          <div className={styles.goalsSection}>
            <div className={styles.goalsHeader}>
              🎯 Recovery Goals ({client.recoveryGoals?.length || 0}/5)
            </div>
            {client.recoveryGoals?.length > 0 ? (
              <div className={styles.goalsList}>
                {client.recoveryGoals.slice(0, 2).map((goal) => (
                  <div key={goal.id} className={styles.goalItem}>
                    <span className={`${styles.goalStatus} ${styles[`goalStatus${goal.status.charAt(0).toUpperCase() + goal.status.slice(1)}`]}`}>
                      {goal.status}
                    </span>
                    <span className={styles.goalText}>{goal.goal}</span>
                  </div>
                ))}
                {client.recoveryGoals.length > 2 && (
                  <div className={styles.moreGoalsText}>+{client.recoveryGoals.length - 2} more goals</div>
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
            onClick={() => handleOpenClientModal(client)}
          >
            📝 {isFormer ? 'View History' : 'Manage Client'}
          </button>
          
          <button
            className={`${styles.actionButton} ${styles.actionSecondary}`}
            onClick={() => handleViewProfile(client)}
          >
            👁️ View Profile
          </button>
          
          {/* ✅ NEW: Reactivate button for former clients */}
          {isFormer && (
            <button
              className={`${styles.actionButton} ${styles.actionSuccess}`}
              onClick={() => handleReactivateClient(client)}
            >
              🔄 Reactivate Client
            </button>
          )}
          
          {!isFormer && (
            <div className={styles.quickActions}>
              <button
                className={`${styles.quickActionButton} ${styles.phoneAction}`}
                onClick={() => {
                  if (client.phone && client.phone !== 'Not provided') {
                    window.location.href = `tel:${client.phone}`;
                  } else {
                    alert('No phone number available for this client');
                  }
                }}
                disabled={!client.phone || client.phone === 'Not provided'}
                title="Call client"
              >
                📞
              </button>

              <button
                className={`${styles.quickActionButton} ${styles.emailAction}`}
                onClick={() => {
                  if (client.email) {
                    window.location.href = `mailto:${client.email}`;
                  } else {
                    alert('No email address available for this client');
                  }
                }}
                disabled={!client.email}
                title="Email client"
              >
                📧
              </button>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="content">
      {/* ✅ NEW: Purple Header */}
      <div className={styles.purpleHeader}>
        <div className={styles.headerContent}>
          <h1 className={styles.headerTitle}>Peer Support Hub</h1>
          <p className={styles.headerSubtitle}>
            Manage your peer support clients, track recovery goals, and coordinate ongoing support
          </p>
        </div>
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

      {/* ✅ NEW: Tabs for Active vs Former Clients */}
      {!loading && (clients.length > 0 || formerClients.length > 0) && (
        <>
          <div className={styles.tabsContainer}>
            <button
              className={`${styles.tab} ${activeTab === 'active' ? styles.tabActive : ''}`}
              onClick={() => setActiveTab('active')}
            >
              Active Clients ({clients.length})
            </button>
            <button
              className={`${styles.tab} ${activeTab === 'former' ? styles.tabActive : ''}`}
              onClick={() => setActiveTab('former')}
            >
              Former Clients ({formerClients.length})
            </button>
          </div>

          <div className={styles.clientsHeader}>
            <h3 className="card-title">
              {activeTab === 'active' ? 'Your Active Clients' : 'Former Clients'}
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
            {activeTab === 'active' && clients.map(client => renderClientCard(client, false))}
            {activeTab === 'former' && formerClients.map(client => renderClientCard(client, true))}
          </div>
        </>
      )}

      {/* No Clients State */}
      {!loading && clients.length === 0 && formerClients.length === 0 && availableConnections.length === 0 && (
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

      {/* Client Profile Modal */}
      {profileModalOpen && selectedProfileClient && (
        <ClientProfileModal
          client={selectedProfileClient}
          onClose={() => {
            setProfileModalOpen(false);
            setSelectedProfileClient(null);
          }}
        />
      )}
    </div>
  );
};

export default PeerSupportDashboard;
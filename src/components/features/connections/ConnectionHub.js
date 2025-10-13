// src/components/features/connections/ConnectionHub.js - Consolidated Match Tables Version
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../hooks/useAuth';
import { supabase } from '../../../utils/supabase';
import LoadingSpinner from '../../ui/LoadingSpinner';
import styles from './ConnectionHub.module.css';
// TODO: Import ProfileModal when created
// import ProfileModal from './ProfileModal';

const ConnectionHub = ({ onBack }) => {
  const { user, profile } = useAuth();
  const [connections, setConnections] = useState({
    active: [],
    sent: [],
    awaiting: []
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('active');
  const [showContactModal, setShowContactModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [selectedConnection, setSelectedConnection] = useState(null);
  const [selectedProfile, setSelectedProfile] = useState(null);
  const [contactInfo, setContactInfo] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [profileLoading, setProfileLoading] = useState(false);

  // Get user's role-specific profile IDs
  const [profileIds, setProfileIds] = useState({
    applicant: null,
    peerSupport: null,
    landlord: null,
    employer: null
  });

  /**
   * Load user's role-specific profile IDs
   */
  const loadProfileIds = async () => {
    if (!profile?.id) return;

    try {
      const ids = { applicant: null, peerSupport: null, landlord: null, employer: null };

      // Get applicant profile ID
      if (profile.roles?.includes('applicant')) {
        const { data } = await supabase
          .from('applicant_matching_profiles')
          .select('id')
          .eq('user_id', profile.id)
          .single();
        if (data) ids.applicant = data.id;
      }

      // Get peer support profile ID
      if (profile.roles?.includes('peer-support')) {
        const { data } = await supabase
          .from('peer_support_profiles')
          .select('id')
          .eq('user_id', profile.id)
          .single();
        if (data) ids.peerSupport = data.id;
      }

      // Get landlord profile ID
      if (profile.roles?.includes('landlord')) {
        const { data } = await supabase
          .from('landlord_profiles')
          .select('id')
          .eq('user_id', profile.id)
          .single();
        if (data) ids.landlord = data.id;
      }

      // Get employer profile ID
      if (profile.roles?.includes('employer')) {
        const { data } = await supabase
          .from('employer_profiles')
          .select('id')
          .eq('user_id', profile.id)
          .single();
        if (data) ids.employer = data.id;
      }

      setProfileIds(ids);
    } catch (err) {
      console.error('Error loading profile IDs:', err);
    }
  };

  /**
   * Load all connections from all 3 tables
   */
  const loadConnections = async () => {
    if (!profile?.id) return;

    setLoading(true);
    setError(null);

    try {
      const connectionCategories = {
        active: [],
        sent: [],
        awaiting: []
      };

      // STEP 1: Load roommate/housing connections from match_groups
      if (profileIds.applicant) {
        await loadMatchGroupConnections(connectionCategories);
      }

      // STEP 2: Load peer support connections
      if (profileIds.applicant || profileIds.peerSupport) {
        await loadPeerSupportConnections(connectionCategories);
      }

      // STEP 3: Load employment connections
      if (profileIds.applicant || profileIds.employer) {
        await loadEmploymentConnections(connectionCategories);
      }

      // Sort by most recent activity
      Object.keys(connectionCategories).forEach(category => {
        connectionCategories[category].sort((a, b) => 
          new Date(b.last_activity) - new Date(a.last_activity)
        );
      });

      setConnections(connectionCategories);
    } catch (err) {
      console.error('Error loading connections:', err);
      setError(err.message || 'Failed to load connections');
    } finally {
      setLoading(false);
    }
  };


const loadMatchGroupConnections = async (categories) => {
  try {
    console.log('🔍 Loading match groups for applicant:', profileIds.applicant);
    
    // FIXED: Correct JSONB array query syntax for PostgREST
    const { data: matchGroups, error } = await supabase
      .from('match_groups')
      .select('*')
      .contains('roommate_ids', JSON.stringify([profileIds.applicant]));

    if (error) {
      console.error('❌ Error loading match groups:', error);
      throw error;
    }
    
    if (!matchGroups || matchGroups.length === 0) {
      console.log('ℹ️ No match groups found');
      return;
    }

    console.log(`✅ Found ${matchGroups.length} match groups`);

    for (const group of matchGroups) {
      // Parse roommate_ids from JSONB
      const roommateIds = group.roommate_ids || [];
      
      console.log('📋 Processing group:', {
        id: group.id,
        status: group.status,
        roommateIds: roommateIds,
        currentUserId: profileIds.applicant
      });
      
      // Get all roommate profiles (excluding current user)
      const otherRoommateIds = roommateIds.filter(id => id !== profileIds.applicant);
      
      let roommates = [];
      if (otherRoommateIds.length > 0) {
        const { data: roommateData } = await supabase
          .from('applicant_matching_profiles')
          .select('id, user_id, primary_phone, registrant_profiles(first_name, last_name, email)')
          .in('id', otherRoommateIds);
        
        roommates = roommateData || [];
      }

      // Get property info if exists
      let property = null;
      if (group.property_id) {
        const { data: propData } = await supabase
          .from('properties')
          .select('*, landlord_profiles(user_id, primary_phone, contact_email, registrant_profiles(first_name, last_name, email))')
          .eq('id', group.property_id)
          .single();
        property = propData;
      }

      const connection = {
        id: group.id,
        type: 'roommate',
        status: group.status,
        source: 'match_group',
        match_group_id: group.id,
        created_at: group.created_at,
        last_activity: group.updated_at || group.created_at,
        avatar: '👥',
        roommates: roommates,
        property: property,
        requested_by_id: group.requested_by_id,
        pending_member_id: group.pending_member_id,
        member_confirmations: group.member_confirmations,
        message: group.message
      };

      // Categorize based on status
      if (group.status === 'requested') {
        // Check if user sent or received this request
        if (group.requested_by_id === profileIds.applicant) {
          categories.sent.push(connection);
        } else if (group.pending_member_id === profileIds.applicant) {
          categories.awaiting.push(connection);
        }
      } else if (group.status === 'forming') {
        // Someone is being added to the group
        if (group.pending_member_id === profileIds.applicant) {
          categories.awaiting.push(connection);
        } else {
          categories.active.push(connection);
        }
      } else if (group.status === 'confirmed' || group.status === 'active') {
        categories.active.push(connection);
      }
    }
    
    console.log('✅ Match groups loaded and categorized');
    
  } catch (error) {
    console.error('💥 Error in loadMatchGroupConnections:', error);
    throw error;
  }
};

  /**
   * Load peer support connections
   */
  const loadPeerSupportConnections = async (categories) => {
    let query = supabase
      .from('peer_support_matches')
      .select('*');

    // Build OR conditions
    const conditions = [];
    if (profileIds.applicant) conditions.push(`applicant_id.eq.${profileIds.applicant}`);
    if (profileIds.peerSupport) conditions.push(`peer_support_id.eq.${profileIds.peerSupport}`);
    
    if (conditions.length > 0) {
      query = query.or(conditions.join(','));
    }

    const { data: matches, error } = await query;
    if (error) throw error;
    if (!matches) return;

    for (const match of matches) {
      const isApplicant = match.applicant_id === profileIds.applicant;
      
      // Get the other person's info
      let otherPerson = null;
      if (isApplicant) {
        const { data } = await supabase
          .from('peer_support_profiles')
          .select('id, user_id, professional_title, primary_phone, contact_email, registrant_profiles(first_name, last_name, email)')
          .eq('id', match.peer_support_id)
          .single();
        otherPerson = data;
      } else {
        const { data } = await supabase
          .from('applicant_matching_profiles')
          .select('id, user_id, primary_phone, registrant_profiles(first_name, last_name, email)')
          .eq('id', match.applicant_id)
          .single();
        otherPerson = data;
      }

      const connection = {
        id: match.id,
        type: 'peer_support',
        status: match.status,
        source: 'peer_support_match',
        peer_support_match_id: match.id,
        created_at: match.created_at,
        last_activity: match.updated_at || match.created_at,
        avatar: '🤝',
        other_person: otherPerson,
        requested_by_id: match.requested_by_id,
        is_requester: match.requested_by_id === profileIds.applicant
      };

      // Categorize
      if (match.status === 'requested') {
        if (connection.is_requester) {
          categories.sent.push(connection);
        } else {
          categories.awaiting.push(connection);
        }
      } else if (match.status === 'active') {
        categories.active.push(connection);
      }
    }
  };

  /**
   * Load employment connections
   */
  const loadEmploymentConnections = async (categories) => {
    let query = supabase
      .from('employment_matches')
      .select('*');

    const conditions = [];
    if (profileIds.applicant) conditions.push(`applicant_id.eq.${profileIds.applicant}`);
    if (profileIds.employer) conditions.push(`employer_id.eq.${profileIds.employer}`);
    
    if (conditions.length > 0) {
      query = query.or(conditions.join(','));
    }

    const { data: matches, error } = await query;
    if (error) throw error;
    if (!matches) return;

    for (const match of matches) {
      const isApplicant = match.applicant_id === profileIds.applicant;
      
      // Get the other person's info
      let otherPerson = null;
      if (isApplicant) {
        const { data } = await supabase
          .from('employer_profiles')
          .select('id, user_id, company_name, phone, contact_email, registrant_profiles(first_name, last_name, email)')
          .eq('id', match.employer_id)
          .single();
        otherPerson = data;
      } else {
        const { data } = await supabase
          .from('applicant_matching_profiles')
          .select('id, user_id, primary_phone, registrant_profiles(first_name, last_name, email)')
          .eq('id', match.applicant_id)
          .single();
        otherPerson = data;
      }

      const connection = {
        id: match.id,
        type: 'employer',
        status: match.status,
        source: 'employment_match',
        employment_match_id: match.id,
        created_at: match.created_at,
        last_activity: match.updated_at || match.created_at,
        avatar: '💼',
        other_person: otherPerson,
        applicant_message: match.applicant_message,
        employer_message: match.employer_message,
        requested_by_id: match.requested_by_id,
        is_requester: match.requested_by_id === profileIds.applicant
      };

      // Categorize
      if (match.status === 'requested') {
        if (connection.is_requester) {
          categories.sent.push(connection);
        } else {
          categories.awaiting.push(connection);
        }
      } else if (match.status === 'active') {
        categories.active.push(connection);
      }
    }
  };

  /**
   * Load full profile data for viewing
   */
  const handleViewProfile = async (connection, personId = null) => {
    setProfileLoading(true);
    
    try {
      let profileData = null;

      if (connection.type === 'roommate') {
        // For roommate groups, personId specifies which roommate to view
        const { data } = await supabase
          .from('applicant_matching_profiles')
          .select('*, registrant_profiles(first_name, last_name, email)')
          .eq('id', personId)
          .single();
        
        profileData = {
          ...data,
          profile_type: 'applicant',
          name: `${data.registrant_profiles?.first_name} ${data.registrant_profiles?.last_name}`
        };
        
      } else if (connection.type === 'peer_support') {
        const isApplicant = connection.is_requester;
        
        if (isApplicant) {
          // Viewing peer support specialist
          const { data } = await supabase
            .from('peer_support_profiles')
            .select('*, registrant_profiles(first_name, last_name, email)')
            .eq('id', connection.other_person.id)
            .single();
          
          profileData = {
            ...data,
            profile_type: 'peer_support',
            name: data.professional_title || `${data.registrant_profiles?.first_name} ${data.registrant_profiles?.last_name}`
          };
        } else {
          // Viewing applicant
          const { data } = await supabase
            .from('applicant_matching_profiles')
            .select('*, registrant_profiles(first_name, last_name, email)')
            .eq('id', connection.other_person.id)
            .single();
          
          profileData = {
            ...data,
            profile_type: 'applicant',
            name: `${data.registrant_profiles?.first_name} ${data.registrant_profiles?.last_name}`
          };
        }
        
      } else if (connection.type === 'employer') {
        const isApplicant = connection.is_requester;
        
        if (isApplicant) {
          // Viewing employer
          const { data } = await supabase
            .from('employer_profiles')
            .select('*, registrant_profiles(first_name, last_name, email)')
            .eq('id', connection.other_person.id)
            .single();
          
          profileData = {
            ...data,
            profile_type: 'employer',
            name: data.company_name || `${data.registrant_profiles?.first_name} ${data.registrant_profiles?.last_name}`
          };
        } else {
          // Viewing applicant
          const { data } = await supabase
            .from('applicant_matching_profiles')
            .select('*, registrant_profiles(first_name, last_name, email)')
            .eq('id', connection.other_person.id)
            .single();
          
          profileData = {
            ...data,
            profile_type: 'applicant',
            name: `${data.registrant_profiles?.first_name} ${data.registrant_profiles?.last_name}`
          };
        }
      }

      setSelectedProfile(profileData);
      setSelectedConnection(connection);
      setShowProfileModal(true);
      
    } catch (err) {
      console.error('Error loading profile:', err);
      alert('Failed to load profile information.');
    } finally {
      setProfileLoading(false);
    }
  };

  /**
   * Handle approving a connection request
   */
  const handleApproveRequest = async (connection) => {
    if (actionLoading) return;
    setActionLoading(true);

    try {
      if (connection.type === 'roommate') {
        await supabase
          .from('match_groups')
          .update({ 
            status: 'confirmed',
            updated_at: new Date().toISOString()
          })
          .eq('id', connection.match_group_id);
          
      } else if (connection.type === 'peer_support') {
        await supabase
          .from('peer_support_matches')
          .update({ 
            status: 'active',
            updated_at: new Date().toISOString()
          })
          .eq('id', connection.peer_support_match_id);
          
      } else if (connection.type === 'employer') {
        await supabase
          .from('employment_matches')
          .update({ 
            status: 'active',
            updated_at: new Date().toISOString()
          })
          .eq('id', connection.employment_match_id);
      }

      alert('Connection approved! You can now exchange contact information.');
      await loadConnections();
      
    } catch (err) {
      console.error('Error approving request:', err);
      alert('Failed to approve request. Please try again.');
    } finally {
      setActionLoading(false);
    }
  };

  /**
   * Handle declining a connection request
   */
  const handleDeclineRequest = async (connection) => {
    if (actionLoading) return;
    
    const confirmed = window.confirm('Are you sure you want to decline this connection request?');
    if (!confirmed) return;

    setActionLoading(true);

    try {
      if (connection.type === 'roommate') {
        await supabase
          .from('match_groups')
          .delete()
          .eq('id', connection.match_group_id);
          
      } else if (connection.type === 'peer_support') {
        await supabase
          .from('peer_support_matches')
          .update({ status: 'inactive' })
          .eq('id', connection.peer_support_match_id);
          
      } else if (connection.type === 'employer') {
        await supabase
          .from('employment_matches')
          .update({ status: 'inactive' })
          .eq('id', connection.employment_match_id);
      }

      alert('Connection request declined.');
      await loadConnections();
      
    } catch (err) {
      console.error('Error declining request:', err);
      alert('Failed to decline request. Please try again.');
    } finally {
      setActionLoading(false);
    }
  };

  /**
   * Handle ending an active connection
   */
  const handleEndConnection = async (connection) => {
    if (actionLoading) return;
    
    const confirmed = window.confirm('Are you sure you want to end this connection? This action cannot be undone.');
    if (!confirmed) return;

    setActionLoading(true);

    try {
      if (connection.type === 'roommate') {
        const { error } = await supabase.rpc('remove_member_from_group', {
          p_group_id: connection.match_group_id,
          p_member_id: profileIds.applicant
        });
        
        if (error) throw error;
        
      } else if (connection.type === 'peer_support') {
        await supabase
          .from('peer_support_matches')
          .update({ status: 'inactive' })
          .eq('id', connection.peer_support_match_id);
          
      } else if (connection.type === 'employer') {
        await supabase
          .from('employment_matches')
          .update({ status: 'inactive' })
          .eq('id', connection.employment_match_id);
      }

      alert('Connection ended.');
      await loadConnections();
      
    } catch (err) {
      console.error('Error ending connection:', err);
      alert('Failed to end connection. Please try again.');
    } finally {
      setActionLoading(false);
    }
  };

  /**
   * Load and show contact information (only for confirmed connections)
   */
  const handleViewContact = async (connection) => {
    try {
      let contact = {
        name: '',
        phone: '',
        email: ''
      };

      if (connection.type === 'roommate') {
        contact = {
          type: 'roommates',
          members: connection.roommates?.map(r => ({
            name: `${r.registrant_profiles?.first_name} ${r.registrant_profiles?.last_name}`,
            phone: r.primary_phone,
            email: r.registrant_profiles?.email
          })) || []
        };
        
        if (connection.property?.landlord_profiles) {
          const ll = connection.property.landlord_profiles;
          contact.landlord = {
            name: `${ll.registrant_profiles?.first_name} ${ll.registrant_profiles?.last_name}`,
            phone: ll.primary_phone,
            email: ll.contact_email || ll.registrant_profiles?.email
          };
        }
        
      } else if (connection.type === 'peer_support') {
        const other = connection.other_person;
        contact = {
          name: other?.professional_title || `${other?.registrant_profiles?.first_name} ${other?.registrant_profiles?.last_name}`,
          phone: other?.primary_phone,
          email: other?.contact_email || other?.registrant_profiles?.email
        };
        
      } else if (connection.type === 'employer') {
        const other = connection.other_person;
        contact = {
          name: other?.company_name || `${other?.registrant_profiles?.first_name} ${other?.registrant_profiles?.last_name}`,
          phone: other?.phone || other?.primary_phone,
          email: other?.contact_email || other?.registrant_profiles?.email
        };
      }

      setContactInfo(contact);
      setSelectedConnection(connection);
      setShowContactModal(true);
      
    } catch (err) {
      console.error('Error loading contact info:', err);
      alert('Failed to load contact information.');
    }
  };

  /**
   * Format time ago
   */
  const formatTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);

    if (diffInHours < 1) return 'Less than an hour ago';
    if (diffInHours < 24) return `${Math.floor(diffInHours)} hours ago`;
    if (diffInHours < 48) return '1 day ago';
    return `${Math.floor(diffInHours / 24)} days ago`;
  };

  /**
   * Get connection display name
   */
  const getConnectionName = (connection) => {
    if (connection.type === 'roommate') {
      const count = connection.roommates?.length || 0;
      return `Roommate Group (${count} member${count !== 1 ? 's' : ''})`;
    } else if (connection.type === 'peer_support') {
      const other = connection.other_person;
      return other?.professional_title || `${other?.registrant_profiles?.first_name || 'Unknown'}`;
    } else if (connection.type === 'employer') {
      const other = connection.other_person;
      return other?.company_name || `${other?.registrant_profiles?.first_name || 'Unknown'}`;
    }
    return 'Unknown';
  };

  /**
   * Get tab count
   */
  const getTabCount = (tab) => connections[tab]?.length || 0;

  // Load profile IDs on mount
  useEffect(() => {
    loadProfileIds();
  }, [profile?.id]);

  // Load connections when profile IDs are ready
  useEffect(() => {
    if (Object.values(profileIds).some(id => id !== null)) {
      loadConnections();
    }
  }, [profileIds]);

  return (
    <div className="content">
      {/* Header */}
      <div className="text-center mb-5">
        <h1 className="welcome-title">Connection Hub</h1>
        <p className="welcome-text">
          Manage your roommate matches, peer support connections, and employer relationships
        </p>
      </div>

      {/* Error State */}
      {error && (
        <div className="alert alert-error mb-4">
          <h4>Error Loading Connections</h4>
          <p>{error}</p>
          <button className="btn btn-outline" onClick={loadConnections}>
            Try Again
          </button>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="text-center" style={{ padding: '4rem' }}>
          <LoadingSpinner size="large" text="Loading your connections..." />
        </div>
      )}

      {/* Main Content */}
      {!loading && !error && (
        <>
          {/* Summary */}
          <div className="card mb-4">
            <div className={styles.connectionStats}>
              <h3 className="card-title">
                {Object.values(connections).reduce((sum, arr) => sum + arr.length, 0)} Total Connection{Object.values(connections).reduce((sum, arr) => sum + arr.length, 0) !== 1 ? 's' : ''}
              </h3>
              <button 
                className="btn btn-outline btn-sm"
                onClick={loadConnections}
                disabled={loading}
              >
                🔄 Refresh
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="card">
            <div className="card-header">
              <ul className="nav nav-tabs card-header-tabs">
                <li className="nav-item">
                  <button
                    className={`nav-link ${activeTab === 'active' ? 'active' : ''}`}
                    onClick={() => setActiveTab('active')}
                  >
                    Active ({getTabCount('active')})
                  </button>
                </li>
                <li className="nav-item">
                  <button
                    className={`nav-link ${activeTab === 'awaiting' ? 'active' : ''}`}
                    onClick={() => setActiveTab('awaiting')}
                  >
                    Awaiting Response ({getTabCount('awaiting')})
                  </button>
                </li>
                <li className="nav-item">
                  <button
                    className={`nav-link ${activeTab === 'sent' ? 'active' : ''}`}
                    onClick={() => setActiveTab('sent')}
                  >
                    Sent Requests ({getTabCount('sent')})
                  </button>
                </li>
              </ul>
            </div>

            <div className="card-body">
              {connections[activeTab]?.length > 0 ? (
                <div className="grid-auto">
                  {connections[activeTab].map((connection) => (
                    <div key={connection.id} className="card">
                      <div className="card-header">
                        <div className={styles.connectionHeader}>
                          <div className={styles.connectionAvatar}>{connection.avatar}</div>
                          <div className={styles.connectionInfo}>
                            <div className="card-title">{getConnectionName(connection)}</div>
                            <div className="card-subtitle">
                              {formatTimeAgo(connection.last_activity)}
                            </div>
                          </div>
                          <span className={`badge ${connection.status === 'active' || connection.status === 'confirmed' ? 'badge-success' : 'badge-warning'}`}>
                            {connection.status}
                          </span>
                        </div>
                      </div>

                      {/* Roommate members list with View Profile buttons */}
                      {connection.type === 'roommate' && connection.roommates?.length > 0 && (
                        <div className="mb-3">
                          <strong>Members:</strong>
                          {connection.roommates.map((roommate, idx) => (
                            <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.5rem' }}>
                              <span>{roommate.registrant_profiles?.first_name} {roommate.registrant_profiles?.last_name}</span>
                              <button
                                className="btn btn-outline btn-sm"
                                onClick={() => handleViewProfile(connection, roommate.id)}
                                disabled={profileLoading}
                              >
                                👁️ View Profile
                              </button>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Action Buttons */}
                      <div className="button-grid">
                        {/* View Profile button for non-roommate connections */}
                        {connection.type !== 'roommate' && (
                          <button
                            className="btn btn-outline"
                            onClick={() => handleViewProfile(connection)}
                            disabled={profileLoading}
                          >
                            👁️ View Profile
                          </button>
                        )}

                        {activeTab === 'awaiting' && (
                          <>
                            <button
                              className="btn btn-primary"
                              onClick={() => handleApproveRequest(connection)}
                              disabled={actionLoading}
                            >
                              ✅ Approve
                            </button>
                            <button
                              className="btn btn-outline"
                              onClick={() => handleDeclineRequest(connection)}
                              disabled={actionLoading}
                            >
                              ❌ Decline
                            </button>
                          </>
                        )}

                        {activeTab === 'active' && (
                          <>
                            <button
                              className="btn btn-primary"
                              onClick={() => handleViewContact(connection)}
                            >
                              📞 Contact Info
                            </button>
                            <button
                              className="btn btn-outline"
                              onClick={() => handleEndConnection(connection)}
                              disabled={actionLoading}
                            >
                              ❌ End Connection
                            </button>
                          </>
                        )}

                        {activeTab === 'sent' && (
                          <div className="text-center text-gray-600">
                            ⏳ Waiting for response...
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="empty-state">
                  <div className="empty-state-icon">
                    {activeTab === 'active' && '🤝'}
                    {activeTab === 'awaiting' && '⏳'}
                    {activeTab === 'sent' && '📤'}
                  </div>
                  <h3 className="empty-state-title">
                    No {activeTab} connections
                  </h3>
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {/* Back Button */}
      {onBack && (
        <div className="text-center mt-4">
          <button className="btn btn-outline" onClick={onBack}>
            ← Back to Dashboard
          </button>
        </div>
      )}

      {/* Profile Modal - TODO: Replace with actual ProfileModal component */}
      {showProfileModal && selectedProfile && (
        <div className="modal-overlay" onClick={() => setShowProfileModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '800px' }}>
            <div className="modal-header">
              <h3 className="modal-title">{selectedProfile.name}'s Profile</h3>
              <button className="modal-close" onClick={() => setShowProfileModal(false)}>×</button>
            </div>

            <div style={{ padding: '1.5rem' }}>
              <p className="text-gray-600">
                <strong>Profile Type:</strong> {selectedProfile.profile_type}
              </p>
              
              {/* Placeholder for full profile details */}
              <div className="alert alert-info">
                <strong>TODO:</strong> Replace this with the actual ProfileModal component that shows full profile details 
                (similar to search result cards). Contact info should only be shown if connection status is 'confirmed' or 'active'.
              </div>

              {/* Show connection status */}
              <div className="mt-3">
                <strong>Connection Status:</strong>{' '}
                <span className={`badge ${selectedConnection?.status === 'active' || selectedConnection?.status === 'confirmed' ? 'badge-success' : 'badge-warning'}`}>
                  {selectedConnection?.status}
                </span>
              </div>

              {(selectedConnection?.status === 'confirmed' || selectedConnection?.status === 'active') && (
                <div className="alert alert-success mt-3">
                  ✅ Contact information available - use "Contact Info" button to view phone and email
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Contact Info Modal */}
      {showContactModal && contactInfo && (
        <div className="modal-overlay" onClick={() => setShowContactModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Contact Information</h3>
              <button className="modal-close" onClick={() => setShowContactModal(false)}>×</button>
            </div>

            <div style={{ padding: '1.5rem' }}>
              {contactInfo.type === 'roommates' ? (
                <>
                  <h4 style={{ marginBottom: '1rem' }}>Roommates:</h4>
                  {contactInfo.members?.map((member, i) => (
                    <div key={i} style={{ marginBottom: '1rem', padding: '1rem', background: '#f9f9f9', borderRadius: '8px' }}>
                      <div><strong>{member.name}</strong></div>
                      <div>📧 {member.email}</div>
                      <div>📞 {member.phone}</div>
                    </div>
                  ))}
                  
                  {contactInfo.landlord && (
                    <>
                      <h4 style={{ marginTop: '1.5rem', marginBottom: '1rem' }}>Landlord:</h4>
                      <div style={{ padding: '1rem', background: '#f9f9f9', borderRadius: '8px' }}>
                        <div><strong>{contactInfo.landlord.name}</strong></div>
                        <div>📧 {contactInfo.landlord.email}</div>
                        <div>📞 {contactInfo.landlord.phone}</div>
                      </div>
                    </>
                  )}
                </>
              ) : (
                <div style={{ padding: '1rem', background: '#f9f9f9', borderRadius: '8px' }}>
                  <div style={{ marginBottom: '0.5rem' }}><strong>{contactInfo.name}</strong></div>
                  <div style={{ marginBottom: '0.5rem' }}>📧 {contactInfo.email || 'Not provided'}</div>
                  <div>📞 {contactInfo.phone || 'Not provided'}</div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ConnectionHub;
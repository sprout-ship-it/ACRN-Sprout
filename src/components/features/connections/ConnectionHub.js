// src/components/features/connections/ConnectionHub.js - UPDATED with modals and fixes
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../hooks/useAuth';
import { supabase } from '../../../utils/supabase';
import LoadingSpinner from '../../ui/LoadingSpinner';
import ProfileModal from './ProfileModal';
import PropertyDetailsModal from './modals/PropertyDetailsModal';
import EmployerDetailsModal from './modals/EmployerDetailsModal';
import styles from './ConnectionHub.module.css';

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
  const [showPropertyModal, setShowPropertyModal] = useState(false);
  const [showEmployerModal, setShowEmployerModal] = useState(false);
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
   * Format name to show only first name and last initial
   */
  const formatName = (firstName, lastName) => {
    if (!firstName) return 'Unknown';
    if (!lastName) return firstName;
    return `${firstName} ${lastName.charAt(0)}.`;
  };

  /**
   * Load user's role-specific profile IDs
   */
  const loadProfileIds = async () => {
    if (!profile?.id) return;

    try {
      const ids = { applicant: null, peerSupport: null, landlord: null, employer: null };

      if (profile.roles?.includes('applicant')) {
        const { data } = await supabase
          .from('applicant_matching_profiles')
          .select('id')
          .eq('user_id', profile.id)
          .single();
        if (data) ids.applicant = data.id;
      }

      if (profile.roles?.includes('peer-support')) {
        const { data } = await supabase
          .from('peer_support_profiles')
          .select('id')
          .eq('user_id', profile.id)
          .single();
        if (data) ids.peerSupport = data.id;
      }

      if (profile.roles?.includes('landlord')) {
        const { data } = await supabase
          .from('landlord_profiles')
          .select('id')
          .eq('user_id', profile.id)
          .single();
        if (data) ids.landlord = data.id;
      }

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

      if (profileIds.applicant) {
        await loadMatchGroupConnections(connectionCategories);
      }

      if (profileIds.applicant || profileIds.peerSupport) {
        await loadPeerSupportConnections(connectionCategories);
      }

      if (profileIds.applicant || profileIds.employer) {
        await loadEmploymentConnections(connectionCategories);
      }

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
      // Query for match_groups where user is either in roommate_ids, requested_by, or pending_member
      const { data: matchGroups, error } = await supabase
        .from('match_groups')
        .select('*')
        .or(`roommate_ids.cs.["${profileIds.applicant}"],requested_by_id.eq.${profileIds.applicant},pending_member_id.eq.${profileIds.applicant}`);

      if (error) throw error;
      if (!matchGroups || matchGroups.length === 0) return;

      for (const group of matchGroups) {
        const roommateIds = group.roommate_ids || [];
        const otherRoommateIds = roommateIds.filter(id => id !== profileIds.applicant);
        
        // ✅ FIXED: Only skip if it's a roommate-only match (no property) with 0 other members
        // For property matches, we want to show them even if user is the only roommate
        if (!group.property_id && otherRoommateIds.length === 0) {
          console.log('Skipping inactive roommate-only match group with 0 other members:', group.id);
          continue;
        }
        
        let roommates = [];
        if (otherRoommateIds.length > 0) {
          const { data: roommateData } = await supabase
            .from('applicant_matching_profiles')
            .select('id, user_id, primary_phone, registrant_profiles(first_name, last_name, email)')
            .in('id', otherRoommateIds);
          roommates = roommateData || [];
        }

        let property = null;
        if (group.property_id) {
          const { data: propData } = await supabase
            .from('properties')
            .select('*, landlord_profiles(user_id, primary_phone, contact_email, registrant_profiles(first_name, last_name, email))')
            .eq('id', group.property_id)
            .single();
          property = propData;
        }

        const isPropertyMatch = !!group.property_id;
        const connectionType = isPropertyMatch ? 'landlord' : 'roommate';
        const connectionAvatar = isPropertyMatch ? '🏠' : '👥';

        const connection = {
          id: group.id,
          type: connectionType,
          status: group.status,
          source: 'match_group',
          match_group_id: group.id,
          created_at: group.created_at,
          last_activity: group.updated_at || group.created_at,
          avatar: connectionAvatar,
          roommates: roommates,
          property: property,
          requested_by_id: group.requested_by_id,
          pending_member_id: group.pending_member_id,
          member_confirmations: group.member_confirmations,
          message: group.message,
          isPropertyMatch: isPropertyMatch
        };

        if (group.status === 'requested') {
          if (group.requested_by_id === profileIds.applicant) {
            categories.sent.push(connection);
          } else if (group.pending_member_id === profileIds.applicant) {
            categories.awaiting.push(connection);
          }
        } else if (group.status === 'forming') {
          if (group.pending_member_id === profileIds.applicant) {
            categories.awaiting.push(connection);
          } else {
            categories.active.push(connection);
          }
        } else if (group.status === 'confirmed' || group.status === 'active') {
          categories.active.push(connection);
        }
      }
    } catch (error) {
      console.error('Error in loadMatchGroupConnections:', error);
      throw error;
    }
  };

  const loadPeerSupportConnections = async (categories) => {
    let query = supabase.from('peer_support_matches').select('*');
    const conditions = [];
    if (profileIds.applicant) conditions.push(`applicant_id.eq.${profileIds.applicant}`);
    if (profileIds.peerSupport) conditions.push(`peer_support_id.eq.${profileIds.peerSupport}`);
    if (conditions.length > 0) query = query.or(conditions.join(','));

    const { data: matches, error } = await query;
    if (error) throw error;
    if (!matches) return;

    for (const match of matches) {
      const isApplicant = match.applicant_id === profileIds.applicant;
      
      let otherPerson = null;
      if (isApplicant) {
        const { data } = await supabase
          .from('peer_support_profiles')
          .select('id, user_id, professional_title, primary_phone, contact_email, years_experience, specialties, registrant_profiles(first_name, last_name, email)')
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

  const loadEmploymentConnections = async (categories) => {
    let query = supabase.from('employment_matches').select('*');
    const conditions = [];
    if (profileIds.applicant) conditions.push(`applicant_id.eq.${profileIds.applicant}`);
    if (profileIds.employer) conditions.push(`employer_id.eq.${profileIds.employer}`);
    if (conditions.length > 0) query = query.or(conditions.join(','));

    const { data: matches, error } = await query;
    if (error) throw error;
    if (!matches) return;

    for (const match of matches) {
      const isApplicant = match.applicant_id === profileIds.applicant;
      
      let otherPerson = null;
      if (isApplicant) {
        const { data } = await supabase
          .from('employer_profiles')
          .select('id, user_id, company_name, phone, contact_email, industry, city, state, job_types_available, registrant_profiles(first_name, last_name, email)')
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

      // ✅ FIX ISSUE 4: Employer matches go straight to active (no requested state shown)
      if (match.status === 'active') {
        categories.active.push(connection);
      }
    }
  };

  /**
   * ✅ NEW: Handle viewing property details in modal
   */
  const handleViewProperty = (connection) => {
    setSelectedConnection(connection);
    setShowPropertyModal(true);
  };

  /**
   * ✅ NEW: Handle viewing employer details in modal
   */
  const handleViewEmployer = (connection) => {
    setSelectedConnection(connection);
    setShowEmployerModal(true);
  };

  /**
   * ✅ NEW: Handle viewing profile (needs to be implemented with ProfileModal)
   */
  const handleViewProfile = async (connection, profileId) => {
    setProfileLoading(true);
    try {
      // Load profile data based on connection type
      let profileData = null;
      
      if (connection.type === 'roommate') {
        const { data } = await supabase
          .from('applicant_matching_profiles')
          .select('*, registrant_profiles(*)')
          .eq('id', profileId)
          .single();
        profileData = data;
      } else if (connection.type === 'peer_support') {
        if (connection.other_person) {
          profileData = connection.other_person;
        }
      } else if (connection.type === 'employer') {
        if (connection.other_person) {
          profileData = connection.other_person;
        }
      }
      
      setSelectedProfile(profileData);
      setSelectedConnection(connection);
      setShowProfileModal(true);
    } catch (err) {
      console.error('Error loading profile:', err);
      alert('Failed to load profile.');
    } finally {
      setProfileLoading(false);
    }
  };

  /**
   * ✅ UPDATED: Handle employer direct connection (no requested state)
   */
  const handleAddEmployer = async (connection) => {
    if (actionLoading) return;
    
    const confirmed = window.confirm('Add this employer as your current employer? You will be able to access their contact information immediately.');
    if (!confirmed) return;

    setActionLoading(true);

    try {
      await supabase
        .from('employment_matches')
        .update({ 
          status: 'active',
          updated_at: new Date().toISOString()
        })
        .eq('id', connection.employment_match_id);

      alert('Employer added! You can now access their contact information.');
      await loadConnections();
      setShowEmployerModal(false);
    } catch (err) {
      console.error('Error adding employer:', err);
      alert('Failed to add employer. Please try again.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleApproveRequest = async (connection) => {
    if (actionLoading) return;
    setActionLoading(true);

    try {
      if (connection.type === 'roommate' || connection.type === 'landlord') {
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

  const handleDeclineRequest = async (connection) => {
    if (actionLoading) return;
    
    const confirmed = window.confirm('Are you sure you want to decline this connection request?');
    if (!confirmed) return;

    setActionLoading(true);

    try {
      if (connection.type === 'roommate' || connection.type === 'landlord') {
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

  const handleWithdrawRequest = async (connection) => {
    if (actionLoading) return;
    
    const confirmed = window.confirm('Are you sure you want to withdraw this connection request?');
    if (!confirmed) return;

    setActionLoading(true);

    try {
      if (connection.type === 'roommate' || connection.type === 'landlord') {
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

      alert('Connection request withdrawn.');
      await loadConnections();
    } catch (err) {
      console.error('Error withdrawing request:', err);
      alert('Failed to withdraw request. Please try again.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleEndConnection = async (connection) => {
    if (actionLoading) return;
    
    const confirmed = window.confirm('Are you sure you want to end this connection? This action cannot be undone.');
    if (!confirmed) return;

    setActionLoading(true);

    try {
      if (connection.type === 'roommate' || connection.type === 'landlord') {
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

  const handleViewContact = async (connection) => {
    try {
      let contact = { name: '', phone: '', email: '' };

      if (connection.type === 'landlord' && connection.property) {
        const ll = connection.property.landlord_profiles;
        contact = {
          type: 'property',
          property: {
            address: connection.property.street_address,
            city: connection.property.city,
            state: connection.property.state,
            rent: connection.property.rent_amount,
            bedrooms: connection.property.bedrooms,
            bathrooms: connection.property.bathrooms
          },
          landlord: {
            name: formatName(ll?.registrant_profiles?.first_name, ll?.registrant_profiles?.last_name),
            phone: ll?.primary_phone,
            email: ll?.contact_email || ll?.registrant_profiles?.email
          }
        };
      } else if (connection.type === 'roommate') {
        contact = {
          type: 'roommates',
          members: connection.roommates?.map(r => ({
            name: formatName(r.registrant_profiles?.first_name, r.registrant_profiles?.last_name),
            phone: r.primary_phone,
            email: r.registrant_profiles?.email
          })) || []
        };
        
        if (connection.property?.landlord_profiles) {
          const ll = connection.property.landlord_profiles;
          contact.landlord = {
            name: formatName(ll.registrant_profiles?.first_name, ll.registrant_profiles?.last_name),
            phone: ll.primary_phone,
            email: ll.contact_email || ll.registrant_profiles?.email
          };
        }
      } else if (connection.type === 'peer_support') {
        const other = connection.other_person;
        contact = {
          name: other?.professional_title || formatName(other?.registrant_profiles?.first_name, other?.registrant_profiles?.last_name),
          phone: other?.primary_phone,
          email: other?.contact_email || other?.registrant_profiles?.email
        };
      } else if (connection.type === 'employer') {
        const other = connection.other_person;
        contact = {
          name: other?.company_name || formatName(other?.registrant_profiles?.first_name, other?.registrant_profiles?.last_name),
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

  const formatTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);

    if (diffInHours < 1) return 'Less than an hour ago';
    if (diffInHours < 24) return `${Math.floor(diffInHours)} hours ago`;
    if (diffInHours < 48) return '1 day ago';
    return `${Math.floor(diffInHours / 24)} days ago`;
  };

  const getConnectionName = (connection) => {
    if (connection.type === 'landlord' && connection.property) {
      const prop = connection.property;
      return prop.street_address || prop.property_name || 'Property Match';
    } else if (connection.type === 'roommate') {
      const count = connection.roommates?.length || 0;
      return `Roommate Group (${count} member${count !== 1 ? 's' : ''})`;
    } else if (connection.type === 'peer_support') {
      const other = connection.other_person;
      return other?.professional_title || formatName(other?.registrant_profiles?.first_name, other?.registrant_profiles?.last_name);
    } else if (connection.type === 'employer') {
      const other = connection.other_person;
      return other?.company_name || formatName(other?.registrant_profiles?.first_name, other?.registrant_profiles?.last_name);
    }
    return 'Unknown';
  };

  const getConnectionTypeLabel = (type) => {
    const labels = {
      roommate: 'Housing Request',
      peer_support: 'Peer Support Request',
      landlord: 'Property Request',
      employer: 'Employment Connection'
    };
    return labels[type] || 'Connection Request';
  };

  const getTabCount = (tab) => connections[tab]?.length || 0;

  /**
   * ✅ NEW: Render simplified detail section for connections
   */
  const renderConnectionDetails = (connection) => {
    // Property details
    if (connection.type === 'landlord' && connection.property) {
      return (
        <div className={styles.membersSection}>
          <div className={styles.membersSectionTitle}>Property Details:</div>
          <div style={{ padding: '0.75rem', background: 'white', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-beige)' }}>
            {connection.property.street_address && (
              <div style={{ marginBottom: '0.5rem' }}>
                <strong>📍 Address:</strong> {connection.property.street_address}
                {connection.property.city && `, ${connection.property.city}`}
                {connection.property.state && `, ${connection.property.state}`}
              </div>
            )}
            {connection.property.rent_amount && (
              <div style={{ marginBottom: '0.5rem' }}>
                <strong>💰 Rent:</strong> ${connection.property.rent_amount}/month
              </div>
            )}
            {connection.property.bedrooms !== undefined && (
              <div>
                <strong>🛏️ Bedrooms:</strong> {connection.property.bedrooms}
                {connection.property.bathrooms && ` | 🚿 Bathrooms: ${connection.property.bathrooms}`}
              </div>
            )}
          </div>
        </div>
      );
    }

    // Peer Support specialist info
    if (connection.type === 'peer_support' && connection.other_person) {
      return (
        <div className={styles.membersSection}>
          <div className={styles.membersSectionTitle}>Specialist Info:</div>
          <div style={{ padding: '0.75rem', background: 'white', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-beige)' }}>
            <div style={{ marginBottom: '0.5rem' }}>
              <strong>👤 Name:</strong> {formatName(connection.other_person.registrant_profiles?.first_name, connection.other_person.registrant_profiles?.last_name)}
            </div>
            {connection.other_person.professional_title && (
              <div style={{ marginBottom: '0.5rem' }}>
                <strong>💼 Title:</strong> {connection.other_person.professional_title}
              </div>
            )}
            {connection.other_person.years_experience && (
              <div style={{ marginBottom: '0.5rem' }}>
                <strong>⭐ Experience:</strong> {connection.other_person.years_experience} year{connection.other_person.years_experience !== 1 ? 's' : ''}
              </div>
            )}
            {connection.other_person.specialties && connection.other_person.specialties.length > 0 && (
              <div>
                <strong>🎯 Specialties:</strong> {connection.other_person.specialties.slice(0, 3).join(', ')}
                {connection.other_person.specialties.length > 3 && ` (+${connection.other_person.specialties.length - 3} more)`}
              </div>
            )}
          </div>
        </div>
      );
    }

    // Employer info
    if (connection.type === 'employer' && connection.other_person) {
      return (
        <div className={styles.membersSection}>
          <div className={styles.membersSectionTitle}>Employer Info:</div>
          <div style={{ padding: '0.75rem', background: 'white', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-beige)' }}>
            {connection.other_person.company_name && (
              <div style={{ marginBottom: '0.5rem' }}>
                <strong>🏢 Company:</strong> {connection.other_person.company_name}
              </div>
            )}
            {connection.other_person.industry && (
              <div style={{ marginBottom: '0.5rem' }}>
                <strong>🏭 Industry:</strong> {connection.other_person.industry}
              </div>
            )}
            {connection.other_person.city && connection.other_person.state && (
              <div style={{ marginBottom: '0.5rem' }}>
                <strong>📍 Location:</strong> {connection.other_person.city}, {connection.other_person.state}
              </div>
            )}
            {connection.other_person.job_types_available && connection.other_person.job_types_available.length > 0 && (
              <div>
                <strong>💼 Job Types:</strong> {connection.other_person.job_types_available.slice(0, 2).join(', ')}
                {connection.other_person.job_types_available.length > 2 && ` (+${connection.other_person.job_types_available.length - 2} more)`}
              </div>
            )}
          </div>
        </div>
      );
    }

    // Roommate members list with high-level overview
    if (connection.type === 'roommate' && connection.roommates?.length > 0) {
      const firstRoommate = connection.roommates[0];
      const roommateProfile = firstRoommate.registrant_profiles;
      
      return (
        <div className={styles.membersSection}>
          <div className={styles.membersSectionTitle}>Potential Roommate:</div>
          <div style={{ padding: '0.75rem', background: 'white', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-beige)' }}>
            <div style={{ marginBottom: '0.5rem' }}>
              <strong>👤 Name:</strong> {formatName(roommateProfile?.first_name, roommateProfile?.last_name)}
            </div>
            {firstRoommate.recovery_stage && (
              <div style={{ marginBottom: '0.5rem' }}>
                <strong>🌱 Recovery Stage:</strong> {firstRoommate.recovery_stage.replace(/_/g, ' ')}
              </div>
            )}
            {firstRoommate.work_schedule && (
              <div style={{ marginBottom: '0.5rem' }}>
                <strong>⏰ Work Schedule:</strong> {firstRoommate.work_schedule.replace(/_/g, ' ')}
              </div>
            )}
            {firstRoommate.interests && firstRoommate.interests.length > 0 && (
              <div>
                <strong>🎯 Interests:</strong> {firstRoommate.interests.slice(0, 3).join(', ')}
                {firstRoommate.interests.length > 3 && ` (+${firstRoommate.interests.length - 3} more)`}
              </div>
            )}
          </div>
          {connection.roommates.length > 1 && (
            <div style={{ marginTop: '0.5rem', fontSize: '0.9rem', color: 'var(--gray-600)' }}>
              +{connection.roommates.length - 1} other potential roommate{connection.roommates.length - 1 !== 1 ? 's' : ''}
            </div>
          )}
        </div>
      );
    }

    return null;
  };

  useEffect(() => {
    loadProfileIds();
  }, [profile?.id]);

  useEffect(() => {
    if (Object.values(profileIds).some(id => id !== null)) {
      loadConnections();
    }
  }, [profileIds]);

  return (
    <div className="content">
      <div className="text-center mb-5">
        <h1 className="welcome-title">Connection Hub</h1>
        <p className="welcome-text">
          Manage your roommate matches, peer support connections, and employer relationships
        </p>
      </div>

      {error && (
        <div className="alert alert-error mb-4">
          <h4>Error Loading Connections</h4>
          <p>{error}</p>
          <button className="btn btn-outline" onClick={loadConnections}>Try Again</button>
        </div>
      )}

      {loading && (
        <div className="text-center" style={{ padding: '4rem' }}>
          <LoadingSpinner size="large" text="Loading your connections..." />
        </div>
      )}

      {!loading && !error && (
        <>
          <div className="card mb-4">
            <div className={styles.connectionStats}>
              <h3 className="card-title">
                {Object.values(connections).reduce((sum, arr) => sum + arr.length, 0)} Total Connection{Object.values(connections).reduce((sum, arr) => sum + arr.length, 0) !== 1 ? 's' : ''}
              </h3>
              <button className="btn btn-outline btn-sm" onClick={loadConnections} disabled={loading}>
                🔄 Refresh
              </button>
            </div>
          </div>

          <div className="card">
            <div className={styles.tabContainer}>
              <ul className={styles.tabNav}>
                <li className={styles.tabItem}>
                  <button className={`${styles.tabButton} ${activeTab === 'active' ? styles.active : ''}`} onClick={() => setActiveTab('active')}>
                    Active<span className={styles.tabCount}>{getTabCount('active')}</span>
                  </button>
                </li>
                <li className={styles.tabItem}>
                  <button className={`${styles.tabButton} ${activeTab === 'awaiting' ? styles.active : ''}`} onClick={() => setActiveTab('awaiting')}>
                    Awaiting Response<span className={styles.tabCount}>{getTabCount('awaiting')}</span>
                  </button>
                </li>
                <li className={styles.tabItem}>
                  <button className={`${styles.tabButton} ${activeTab === 'sent' ? styles.active : ''}`} onClick={() => setActiveTab('sent')}>
                    Sent Requests<span className={styles.tabCount}>{getTabCount('sent')}</span>
                  </button>
                </li>
              </ul>
            </div>

            <div className="card-body">
              {connections[activeTab]?.length > 0 ? (
                <div className="grid-auto">
                  {connections[activeTab].map((connection) => (
                    <div key={connection.id} className={`card ${styles.connectionCard} ${styles[connection.type === 'peer_support' ? 'peerSupport' : connection.type]}`}>
                      <div className={styles.connectionCardHeader}>
                        <div style={{ flex: 1 }}>
                          <div className={styles.connectionTypeLabel}>{getConnectionTypeLabel(connection.type)}</div>
                          <div className={styles.connectionTitle}>{getConnectionName(connection)}</div>
                        </div>
                        <span className={`badge ${connection.status === 'active' || connection.status === 'confirmed' ? 'badge-success' : 'badge-warning'}`}>
                          {connection.status}
                        </span>
                      </div>

                      <div className="card-subtitle mb-3" style={{ color: 'var(--gray-600)' }}>
                        {formatTimeAgo(connection.last_activity)}
                      </div>

                      {/* ✅ ISSUE 2: Show simplified details in both Active and Sent tabs */}
                      {renderConnectionDetails(connection)}

                      {/* Action Buttons */}
                      <div className={styles.actionButtonsGrid}>
                        {activeTab === 'awaiting' && (
                          <>
                            {/* ✅ View Details Button - Show who is requesting */}
                            <div style={{ width: '100%', marginBottom: '1rem' }}>
                              {connection.type === 'roommate' && connection.roommates?.length > 0 && (
                                <button 
                                  className="btn btn-outline" 
                                  onClick={() => handleViewProfile(connection, connection.roommates[0].id)} 
                                  disabled={profileLoading}
                                  style={{ width: '100%' }}
                                >
                                  👁️ View Applicant Profile
                                </button>
                              )}
                              
                              {connection.type === 'peer_support' && connection.other_person && (
                                <button 
                                  className="btn btn-outline" 
                                  onClick={() => handleViewProfile(connection)} 
                                  disabled={profileLoading}
                                  style={{ width: '100%' }}
                                >
                                  👁️ View Applicant Profile
                                </button>
                              )}
                              
                              {connection.type === 'landlord' && connection.property && (
                                <button 
                                  className="btn btn-outline" 
                                  onClick={() => handleViewProperty(connection)} 
                                  disabled={profileLoading}
                                  style={{ width: '100%' }}
                                >
                                  👁️ View Property Details
                                </button>
                              )}
                              
                              {connection.type === 'employer' && connection.other_person && (
                                <button 
                                  className="btn btn-outline" 
                                  onClick={() => handleViewProfile(connection)} 
                                  disabled={profileLoading}
                                  style={{ width: '100%' }}
                                >
                                  👁️ View Applicant Profile
                                </button>
                              )}
                            </div>
                            
                            {/* ✅ Approve/Decline Actions */}
                            <div className={styles.primaryActions}>
                              <button className="btn btn-primary" onClick={() => handleApproveRequest(connection)} disabled={actionLoading}>
                                ✅ Approve
                              </button>
                              <button className="btn btn-outline" onClick={() => handleDeclineRequest(connection)} disabled={actionLoading}>
                                ❌ Decline
                              </button>
                            </div>
                          </>
                        )}

                        {activeTab === 'active' && (
                          <>
                            <div className={styles.primaryActions}>
                              {connection.type === 'landlord' && (
                                <button className="btn btn-outline" onClick={() => handleViewProperty(connection)} disabled={profileLoading}>
                                  👁️ View Property
                                </button>
                              )}
                              {connection.type === 'peer_support' && (
                                <button className="btn btn-outline" onClick={() => handleViewProfile(connection)} disabled={profileLoading}>
                                  👁️ View Profile
                                </button>
                              )}
                              {connection.type === 'employer' && (
                                <button className="btn btn-outline" onClick={() => handleViewEmployer(connection)} disabled={profileLoading}>
                                  👁️ View Details
                                </button>
                              )}
                              <button className="btn btn-primary" onClick={() => handleViewContact(connection)}>
                                📞 Contact Info
                              </button>
                            </div>
                            <div className={styles.secondaryAction}>
                              <button className={`btn ${styles.endConnectionButton}`} onClick={() => handleEndConnection(connection)} disabled={actionLoading}>
                                ❌ End Connection
                              </button>
                            </div>
                          </>
                        )}

                        {activeTab === 'sent' && (
                          <div style={{ width: '100%' }}>
                            <div className={styles.waitingStatus} style={{ marginBottom: '1rem' }}>
                              ⏳ Waiting for response...
                            </div>
                            
                            <div className={styles.primaryActions}>
                              {connection.type === 'landlord' && (
                                <button className="btn btn-outline" onClick={() => handleViewProperty(connection)} disabled={profileLoading}>
                                  👁️ View Property
                                </button>
                              )}
                              
                              {connection.type === 'roommate' && connection.roommates?.length > 0 && (
                                <button className="btn btn-outline" onClick={() => handleViewProfile(connection, connection.roommates[0].id)} disabled={profileLoading}>
                                  👁️ View Full Profile
                                </button>
                              )}
                              
                              {connection.type === 'peer_support' && (
                                <button className="btn btn-outline" onClick={() => handleViewProfile(connection)} disabled={profileLoading}>
                                  👁️ View Full Profile
                                </button>
                              )}

                              {connection.type === 'employer' && (
                                <button className="btn btn-outline" onClick={() => handleViewEmployer(connection)} disabled={profileLoading}>
                                  👁️ View Full Profile
                                </button>
                              )}
                              
                              <button className="btn btn-outline" onClick={() => handleWithdrawRequest(connection)} disabled={actionLoading} style={{ color: 'var(--error-text)', borderColor: 'var(--error-border)' }}>
                                🗑️ Withdraw Request
                              </button>
                            </div>
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
                  <h3 className="empty-state-title">No {activeTab} connections</h3>
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {onBack && (
        <div className="text-center mt-4">
          <button className="btn btn-outline" onClick={onBack}>← Back to Dashboard</button>
        </div>
      )}

      {/* Profile Modal for Peer Support */}
      {showProfileModal && selectedProfile && (
        <ProfileModal
          isOpen={showProfileModal}
          profile={selectedProfile}
          connectionStatus={selectedConnection?.status}
          onClose={() => setShowProfileModal(false)}
          showContactInfo={selectedConnection?.status === 'confirmed' || selectedConnection?.status === 'active'}
        />
      )}

      {/* Property Details Modal */}
      {showPropertyModal && selectedConnection && (
        <PropertyDetailsModal
          isOpen={showPropertyModal}
          property={selectedConnection.property}
          connectionStatus={selectedConnection.status}
          onClose={() => setShowPropertyModal(false)}
          showContactInfo={selectedConnection.status === 'confirmed' || selectedConnection.status === 'active'}
        />
      )}

      {/* Employer Details Modal */}
      {showEmployerModal && selectedConnection && (
        <EmployerDetailsModal
          isOpen={showEmployerModal}
          employer={selectedConnection.other_person}
          connectionStatus={selectedConnection.status}
          onClose={() => setShowEmployerModal(false)}
          onConnect={() => handleAddEmployer(selectedConnection)}
          showContactInfo={selectedConnection.status === 'active'}
        />
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
              {contactInfo.type === 'property' ? (
                <>
                  <h4 style={{ marginBottom: '1rem' }}>Property Information:</h4>
                  <div style={{ marginBottom: '1.5rem', padding: '1rem', background: '#f9f9f9', borderRadius: '8px' }}>
                    {contactInfo.property.address && (
                      <div style={{ marginBottom: '0.5rem' }}>
                        <strong>📍 Address:</strong> {contactInfo.property.address}
                        {contactInfo.property.city && `, ${contactInfo.property.city}`}
                        {contactInfo.property.state && `, ${contactInfo.property.state}`}
                      </div>
                    )}
                    {contactInfo.property.rent && (
                      <div style={{ marginBottom: '0.5rem' }}>
                        <strong>💰 Rent:</strong> ${contactInfo.property.rent}/month
                      </div>
                    )}
                    {contactInfo.property.bedrooms !== undefined && (
                      <div>
                        <strong>🛏️ Bedrooms:</strong> {contactInfo.property.bedrooms}
                        {contactInfo.property.bathrooms && ` | 🚿 Bathrooms: ${contactInfo.property.bathrooms}`}
                      </div>
                    )}
                  </div>
                  
                  <h4 style={{ marginBottom: '1rem' }}>Landlord Contact:</h4>
                  <div style={{ padding: '1rem', background: '#f9f9f9', borderRadius: '8px' }}>
                    <div><strong>{contactInfo.landlord.name}</strong></div>
                    <div>📧 {contactInfo.landlord.email}</div>
                    <div>📞 {contactInfo.landlord.phone}</div>
                  </div>
                </>
              ) : contactInfo.type === 'roommates' ? (
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
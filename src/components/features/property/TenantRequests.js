// src/components/features/properties/TenantRequests.js - Landlord Housing Inquiry Inbox
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../hooks/useAuth';
import { supabase } from '../../../utils/supabase';
import LoadingSpinner from '../../ui/LoadingSpinner';
import styles from './TenantRequests.module.css';

const TenantRequests = () => {
  const { user, profile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [recentRequests, setRecentRequests] = useState([]);
  const [archivedRequests, setArchivedRequests] = useState([]);
  const [showArchived, setShowArchived] = useState(false);
  const [processingRequest, setProcessingRequest] = useState(null);

  // Load all housing requests for this landlord
// Load all housing inquiries for this landlord
  const loadRequests = async () => {
    if (!user?.id || !profile?.id) return;

    setLoading(true);
    setError(null);

    try {
      // 1. Get landlord profile ID
      const { data: landlordProfile, error: landlordError } = await supabase
        .from('landlord_profiles')
        .select('id')
        .eq('user_id', profile.id)
        .single();

      if (landlordError || !landlordProfile) {
        throw new Error('Landlord profile not found. Please complete your landlord profile setup.');
      }

      // 2. Get all properties owned by this landlord
      const { data: landlordProperties, error: propertiesError } = await supabase
        .from('properties')
        .select('id, title, address, city, state, monthly_rent, bedrooms, bathrooms, is_recovery_housing, available_beds, landlord_id')
        .eq('landlord_id', landlordProfile.id);

      if (propertiesError) {
        throw new Error(propertiesError.message);
      }

      if (!landlordProperties || landlordProperties.length === 0) {
        // No properties, no inquiries
        setPendingRequests([]);
        setRecentRequests([]);
        setArchivedRequests([]);
        setLoading(false);
        return;
      }

      const propertyIds = landlordProperties.map(p => p.id);

      // 3. Get all match_groups (housing inquiries) for these properties
      const { data: inquiries, error: inquiriesError } = await supabase
        .from('match_groups')
        .select('*')
        .in('property_id', propertyIds)
        .not('property_id', 'is', null) // Only housing inquiries
        .order('created_at', { ascending: false });

      if (inquiriesError) {
        throw new Error(inquiriesError.message);
      }

      if (!inquiries || inquiries.length === 0) {
        // No inquiries
        setPendingRequests([]);
        setRecentRequests([]);
        setArchivedRequests([]);
        setLoading(false);
        return;
      }

      // 4. Extract all unique applicant IDs from all roommate_ids arrays
      const allApplicantIds = new Set();
      inquiries.forEach(inquiry => {
        const roommateIds = inquiry.roommate_ids || [];
        roommateIds.forEach(id => allApplicantIds.add(id));
      });

      // 5. Get applicant profiles for all applicants
      const { data: applicantProfiles, error: applicantError } = await supabase
        .from('applicant_matching_profiles')
        .select(`
          id,
          user_id,
          primary_phone,
          date_of_birth,
          budget_min,
          budget_max,
          recovery_stage,
          move_in_date,
          about_me,
          registrant_profiles!inner(
            first_name,
            last_name,
            email
          )
        `)
        .in('id', Array.from(allApplicantIds));

      if (applicantError) {
        console.warn('Error loading applicant profiles:', applicantError);
      }

      // 6. Create a lookup map for applicants
      const applicantMap = new Map();
      if (applicantProfiles) {
        applicantProfiles.forEach(applicant => {
          applicantMap.set(applicant.id, applicant);
        });
      }

      // 7. Create a lookup map for properties
      const propertyMap = new Map();
      landlordProperties.forEach(property => {
        propertyMap.set(property.id, property);
      });

      // 8. Enrich inquiries with applicant and property data
      const enrichedInquiries = inquiries.map(inquiry => {
        const roommateIds = inquiry.roommate_ids || [];
        const applicants = roommateIds
          .map(id => applicantMap.get(id))
          .filter(Boolean); // Remove any null/undefined

        return {
          ...inquiry,
          applicants: applicants, // Array of applicants (could be 1 or more)
          property: propertyMap.get(inquiry.property_id),
          isGroupInquiry: applicants.length > 1
        };
      });

      // 9. Categorize inquiries
      const now = new Date();
      const thirtyDaysAgo = new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000));

      const pending = enrichedInquiries.filter(req => req.status === 'requested');
      const recent = enrichedInquiries.filter(req => 
        (req.status === 'confirmed' || req.status === 'active' || req.status === 'inactive') && 
        new Date(req.updated_at || req.created_at) >= thirtyDaysAgo
      );
      const archived = enrichedInquiries.filter(req => 
        (req.status === 'confirmed' || req.status === 'active' || req.status === 'inactive') && 
        new Date(req.updated_at || req.created_at) < thirtyDaysAgo
      );

      setPendingRequests(pending);
      setRecentRequests(recent);
      setArchivedRequests(archived);

    } catch (err) {
      console.error('Error loading tenant requests:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

// Handle approve/reject actions
  const handleRequestAction = async (inquiry, action) => {
    if (processingRequest === inquiry.id) return;

    // Determine applicant name for confirmation message
    const primaryApplicant = inquiry.applicants && inquiry.applicants.length > 0 
      ? inquiry.applicants[0] 
      : null;
    const applicantName = primaryApplicant?.registrant_profiles?.first_name || 'this applicant';
    const isGroup = inquiry.isGroupInquiry;
    const groupText = isGroup ? ` and ${inquiry.applicants.length - 1} roommate${inquiry.applicants.length > 2 ? 's' : ''}` : '';

    const confirmMessage = action === 'confirmed' 
      ? `Approve housing inquiry from ${applicantName}${groupText} for "${inquiry.property.title}"?`
      : `Reject housing inquiry from ${applicantName}${groupText} for "${inquiry.property.title}"?`;

    if (!window.confirm(confirmMessage)) return;

    setProcessingRequest(inquiry.id);

    try {
      // Update the match_group status
      const newStatus = action === 'confirmed' ? 'confirmed' : 'inactive';
      
      const { error: updateError } = await supabase
        .from('match_groups')
        .update({ 
          status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', inquiry.id);

      if (updateError) {
        throw new Error(updateError.message);
      }

      // Reload inquiries to update the UI
      await loadRequests();

      const successMessage = action === 'confirmed'
        ? `Inquiry approved! ${applicantName}${groupText} can now contact you directly about "${inquiry.property.title}".`
        : `Inquiry rejected. ${applicantName}${groupText} will be notified.`;

      alert(successMessage);

    } catch (err) {
      console.error('Error processing inquiry:', err);
      alert(`Failed to ${action === 'confirmed' ? 'approve' : 'reject'} inquiry: ${err.message}`);
    } finally {
      setProcessingRequest(null);
    }
  };

  // Format time ago
  const formatTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);

    if (diffInHours < 1) return 'Less than an hour ago';
    if (diffInHours < 24) return `${Math.floor(diffInHours)} hours ago`;
    if (diffInHours < 48) return '1 day ago';
    return `${Math.floor(diffInHours / 24)} days ago`;
  };

  // Calculate age from date of birth
  const calculateAge = (dateOfBirth) => {
    if (!dateOfBirth) return 'N/A';
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

// Render inquiry card
  const renderRequestCard = (inquiry, section = 'pending') => {
    const applicants = inquiry.applicants || [];
    const primaryApplicant = applicants[0]; // First applicant is the one who sent the inquiry
    const property = inquiry.property;
    const isGroup = inquiry.isGroupInquiry;
    
    if (!primaryApplicant || !property) {
      console.warn('Missing applicant or property data:', inquiry);
      return null;
    }

    return (
      <div key={inquiry.id} className={`card ${styles.requestCard} ${styles[`request${section.charAt(0).toUpperCase() + section.slice(1)}`]}`}>
        {/* Request Header */}
        <div className={styles.requestHeader}>
          <div className={styles.requestInfo}>
            <h4 className={styles.requestTitle}>
              {primaryApplicant.registrant_profiles?.first_name} {primaryApplicant.registrant_profiles?.last_name || 'Anonymous'}
              {isGroup && <span className={styles.groupIndicator}> + {applicants.length - 1} roommate{applicants.length > 2 ? 's' : ''}</span>}
            </h4>
            <div className={styles.requestMeta}>
              <span className={styles.requestProperty}>"{property.title}"</span>
              <span className={styles.requestTime}>{formatTimeAgo(inquiry.created_at)}</span>
            </div>
          </div>
          
          <div className={styles.requestStatus}>
            <span className={`badge ${styles.statusBadge} ${styles[`status${inquiry.status.charAt(0).toUpperCase() + inquiry.status.slice(1)}`]}`}>
              {inquiry.status === 'requested' && '⏳ Pending'}
              {inquiry.status === 'confirmed' && '✅ Approved'}
              {inquiry.status === 'active' && '🏠 Active'}
              {inquiry.status === 'inactive' && '❌ Declined'}
            </span>
          </div>
        </div>

        {/* Property Info */}
        <div className={styles.propertyInfo}>
          <div className={styles.propertyTitle}>📍 {property.address}, {property.city}, {property.state}</div>
          <div className={styles.propertyDetails}>
            ${property.monthly_rent}/month • {property.bedrooms || 'Studio'} bed • {property.bathrooms} bath
            {property.is_recovery_housing && ' • Recovery Housing'}
            {property.available_beds && ` • ${property.available_beds} beds available`}
          </div>
        </div>

        {/* Applicant(s) Info */}
        {applicants.length > 0 && (
          <div className={styles.applicantInfo}>
            <h5 className={styles.applicantTitle}>
              👤 {isGroup ? `Group Inquiry (${applicants.length} applicants)` : 'Applicant Information'}
            </h5>
            
            {/* Show all applicants */}
            {applicants.map((applicant, index) => (
              <div key={applicant.id} className={styles.applicantSection}>
                {isGroup && (
                  <div className={styles.applicantHeader}>
                    <strong>Applicant {index + 1}: {applicant.registrant_profiles?.first_name} {applicant.registrant_profiles?.last_name}</strong>
                    {index === 0 && <span className={styles.primaryLabel}>(Primary Contact)</span>}
                  </div>
                )}
                
                <div className={styles.applicantGrid}>
                  <div className={styles.applicantDetail}>
                    <span className={styles.detailLabel}>Age:</span>
                    <span className={styles.detailValue}>{calculateAge(applicant.date_of_birth)}</span>
                  </div>
                  <div className={styles.applicantDetail}>
                    <span className={styles.detailLabel}>Budget:</span>
                    <span className={styles.detailValue}>${applicant.budget_min} - ${applicant.budget_max}</span>
                  </div>
                  <div className={styles.applicantDetail}>
                    <span className={styles.detailLabel}>Recovery Stage:</span>
                    <span className={styles.detailValue}>{applicant.recovery_stage || 'Not specified'}</span>
                  </div>
                  <div className={styles.applicantDetail}>
                    <span className={styles.detailLabel}>Move-in Date:</span>
                    <span className={styles.detailValue}>
                      {applicant.move_in_date ? new Date(applicant.move_in_date).toLocaleDateString() : 'Flexible'}
                    </span>
                  </div>
                  <div className={styles.applicantDetail}>
                    <span className={styles.detailLabel}>Email:</span>
                    <span className={styles.detailValue}>{applicant.registrant_profiles?.email}</span>
                  </div>
                  {applicant.primary_phone && (
                    <div className={styles.applicantDetail}>
                      <span className={styles.detailLabel}>Phone:</span>
                      <span className={styles.detailValue}>{applicant.primary_phone}</span>
                    </div>
                  )}
                </div>

                {/* Separator between applicants in group inquiries */}
                {isGroup && index < applicants.length - 1 && (
                  <hr className={styles.applicantSeparator} />
                )}
              </div>
            ))}
          </div>
        )}

        {/* Request Message */}
        {inquiry.message && (
          <div className={styles.requestMessage}>
            <h5 className={styles.messageTitle}>💬 Message from {isGroup ? 'Group' : 'Applicant'}</h5>
            <div className={styles.messageContent}>
              {inquiry.message.split('\n').map((line, index) => (
                <p key={index}>{line}</p>
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons - Only show for pending requests */}
        {inquiry.status === 'requested' && (
          <div className={styles.requestActions}>
            <button
              className={`btn btn-success btn-sm ${processingRequest === inquiry.id ? styles.btnLoading : ''}`}
              onClick={() => handleRequestAction(inquiry, 'confirmed')}
              disabled={processingRequest === inquiry.id}
            >
              {processingRequest === inquiry.id ? (
                <>
                  <span className={styles.loadingSpinner}></span>
                  Approving...
                </>
              ) : (
                '✅ Approve Inquiry'
              )}
            </button>
            
            <button
              className={`btn btn-outline-danger btn-sm ${processingRequest === inquiry.id ? styles.btnLoading : ''}`}
              onClick={() => handleRequestAction(inquiry, 'inactive')}
              disabled={processingRequest === inquiry.id}
            >
              {processingRequest === inquiry.id ? (
                <>
                  <span className={styles.loadingSpinner}></span>
                  Rejecting...
                </>
              ) : (
                '❌ Reject Inquiry'
              )}
            </button>

            <button
              className="btn btn-outline btn-sm"
              onClick={() => window.open(`mailto:${primaryApplicant.registrant_profiles?.email}?subject=Regarding your housing inquiry for "${property.title}"`, '_blank')}
            >
              📧 Contact Directly
            </button>
          </div>
        )}

        {/* Response timestamp for non-pending requests */}
        {inquiry.status !== 'requested' && inquiry.updated_at && inquiry.updated_at !== inquiry.created_at && (
          <div className={styles.responseInfo}>
            <small className={styles.responseTime}>
              Responded {formatTimeAgo(inquiry.updated_at)}
            </small>
          </div>
        )}
      </div>
    );
  };

  // Load requests on component mount
  useEffect(() => {
    loadRequests();
  }, [user?.id, profile?.id]);

  // Loading state
  if (loading) {
    return (
      <div className="content">
        <div className={styles.headerSection}>
          <h1 className={styles.headerTitle}>Tenant Requests</h1>
          <p className={styles.headerSubtitle}>Loading your housing inquiries...</p>
        </div>
        <LoadingSpinner size="large" text="Loading tenant requests..." />
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="content">
        <div className={styles.headerSection}>
          <h1 className={styles.headerTitle}>Tenant Requests</h1>
          <p className={styles.headerSubtitle}>Error loading requests</p>
        </div>
        
        <div className="card">
          <div className={styles.errorContainer}>
            <div className={styles.errorIcon}>⚠️</div>
            <h3 className={styles.errorTitle}>Unable to Load Tenant Requests</h3>
            <p className={styles.errorMessage}>{error}</p>
            <button 
              className="btn btn-primary"
              onClick={loadRequests}
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Main content
  return (
    <div className="content">
      {/* Header */}
      <div className={styles.headerSection}>
        <div className={styles.headerContent}>
          <h1 className={styles.headerTitle}>Tenant Requests</h1>
          <p className={styles.headerSubtitle}>
            Manage housing inquiries from potential tenants
          </p>
        </div>
        
        <div className={styles.headerActions}>
          <button 
            className="btn btn-outline"
            onClick={loadRequests}
            disabled={loading}
          >
            🔄 Refresh
          </button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="card mb-4">
        <div className={styles.summaryStats}>
          <div className={styles.statItem}>
            <span className={styles.statValue}>{pendingRequests.length}</span>
            <span className={styles.statLabel}>Pending Requests</span>
          </div>
          <div className={styles.statItem}>
            <span className={styles.statValue}>{recentRequests.length}</span>
            <span className={styles.statLabel}>Recent Responses</span>
          </div>
          <div className={styles.statItem}>
            <span className={styles.statValue}>{archivedRequests.length}</span>
            <span className={styles.statLabel}>Archived</span>
          </div>
        </div>
      </div>

      {/* Pending Requests Section */}
      <div className="mb-5">
        <h2 className={styles.sectionTitle}>
          ⏳ Pending Requests ({pendingRequests.length})
        </h2>
        
        {pendingRequests.length === 0 ? (
          <div className="card">
            <div className={styles.emptySection}>
              <div className={styles.emptyIcon}>📭</div>
              <h3 className={styles.emptyTitle}>No Pending Requests</h3>
              <p className={styles.emptyDescription}>
                New housing inquiries from potential tenants will appear here.
              </p>
            </div>
          </div>
        ) : (
          <div className={styles.requestsList}>
            {pendingRequests.map(request => renderRequestCard(request, 'pending'))}
          </div>
        )}
      </div>

      {/* Recent Responses Section */}
      {recentRequests.length > 0 && (
        <div className="mb-5">
          <h2 className={styles.sectionTitle}>
            📋 Recent Responses ({recentRequests.length})
          </h2>
          <div className={styles.requestsList}>
            {recentRequests.map(request => renderRequestCard(request, 'recent'))}
          </div>
        </div>
      )}

      {/* Archived Requests Section */}
      {archivedRequests.length > 0 && (
        <div className="mb-5">
          <div className={styles.archiveHeader}>
            <h2 className={styles.sectionTitle}>
              📁 Archived Requests ({archivedRequests.length})
            </h2>
            <button
              className="btn btn-outline btn-sm"
              onClick={() => setShowArchived(!showArchived)}
            >
              {showArchived ? 'Hide' : 'Show'} Archived
            </button>
          </div>
          
          {showArchived && (
            <div className={styles.requestsList}>
              {archivedRequests.map(request => renderRequestCard(request, 'archived'))}
            </div>
          )}
        </div>
      )}

      {/* No requests at all */}
      {pendingRequests.length === 0 && recentRequests.length === 0 && archivedRequests.length === 0 && (
        <div className="empty-state">
          <div className="empty-state-icon">🏠</div>
          <h3 className="empty-state-title">No tenant requests yet</h3>
          <p>Housing inquiries from potential tenants will appear here when your properties receive interest.</p>
          
          <div className={styles.emptyStateActions}>
            <a href="/app/properties" className="btn btn-primary">
              <span className={styles.btnIcon}>🏢</span>
              Manage My Properties
            </a>
          </div>
        </div>
      )}
    </div>
  );
};

export default TenantRequests;
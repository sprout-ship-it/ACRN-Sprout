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

      // 2. Get all housing requests for this landlord with related data
      const { data: requests, error: requestsError } = await supabase
        .from('match_requests')
        .select(`
          *,
          properties!inner(
            id,
            title,
            address,
            city,
            state,
            monthly_rent,
            bedrooms,
            bathrooms,
            is_recovery_housing,
            available_beds
          )
        `)
        .eq('recipient_type', 'landlord')
        .eq('recipient_id', landlordProfile.id)
        .eq('request_type', 'housing')
        .eq('properties.landlord_id', landlordProfile.id)
        .order('created_at', { ascending: false });

      if (requestsError) {
        throw new Error(requestsError.message);
      }

      // 3. Get applicant profiles for all requests
      const applicantIds = [...new Set(requests.map(req => req.requester_id))];
      
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
        .in('id', applicantIds);

      if (applicantError) {
        console.warn('Error loading applicant profiles:', applicantError);
      }

      // 4. Merge applicant data with requests
      const enrichedRequests = requests.map(request => {
        const applicant = applicantProfiles?.find(ap => ap.id === request.requester_id);
        return {
          ...request,
          applicant: applicant || null
        };
      });

      // 5. Categorize requests
      const now = new Date();
      const thirtyDaysAgo = new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000));

      const pending = enrichedRequests.filter(req => req.status === 'pending');
      const recent = enrichedRequests.filter(req => 
        req.status !== 'pending' && 
        new Date(req.updated_at || req.created_at) >= thirtyDaysAgo
      );
      const archived = enrichedRequests.filter(req => 
        req.status !== 'pending' && 
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
  const handleRequestAction = async (request, action) => {
    if (processingRequest === request.id) return;

    const confirmMessage = action === 'accepted' 
      ? `Approve housing request from ${request.applicant?.registrant_profiles?.first_name} for "${request.properties.title}"?`
      : `Reject housing request from ${request.applicant?.registrant_profiles?.first_name} for "${request.properties.title}"?`;

    if (!window.confirm(confirmMessage)) return;

    setProcessingRequest(request.id);

    try {
      // 1. Update the match request status
      const { error: updateError } = await supabase
        .from('match_requests')
        .update({ 
          status: action,
          responded_at: new Date().toISOString()
        })
        .eq('id', request.id);

      if (updateError) {
        throw new Error(updateError.message);
      }

      // 2. If approved, create a match_group for future connection tracking
      if (action === 'accepted') {
        const { error: matchGroupError } = await supabase
          .from('match_groups')
          .insert({
            applicant_1_id: request.requester_id,
            property_id: request.property_id,
            status: 'confirmed',
            group_name: `Housing Connection - ${request.properties.title}`
          });

        if (matchGroupError) {
          console.warn('Error creating match group:', matchGroupError);
          // Don't fail the whole operation if match group creation fails
        }
      }

      // 3. Reload requests to update the UI
      await loadRequests();

      const successMessage = action === 'accepted'
        ? `Request approved! The applicant can now contact you directly about "${request.properties.title}".`
        : `Request rejected. The applicant will be notified.`;

      alert(successMessage);

    } catch (err) {
      console.error('Error processing request:', err);
      alert(`Failed to ${action === 'accepted' ? 'approve' : 'reject'} request: ${err.message}`);
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

  // Render request card
  const renderRequestCard = (request, section = 'pending') => {
    const applicant = request.applicant;
    const property = request.properties;
    
    return (
      <div key={request.id} className={`card ${styles.requestCard} ${styles[`request${section.charAt(0).toUpperCase() + section.slice(1)}`]}`}>
        {/* Request Header */}
        <div className={styles.requestHeader}>
          <div className={styles.requestInfo}>
            <h4 className={styles.requestTitle}>
              {applicant?.registrant_profiles?.first_name} {applicant?.registrant_profiles?.last_name || 'Anonymous'}
            </h4>
            <div className={styles.requestMeta}>
              <span className={styles.requestProperty}>"{property.title}"</span>
              <span className={styles.requestTime}>{formatTimeAgo(request.created_at)}</span>
            </div>
          </div>
          
          <div className={styles.requestStatus}>
            <span className={`badge ${styles.statusBadge} ${styles[`status${request.status.charAt(0).toUpperCase() + request.status.slice(1)}`]}`}>
              {request.status === 'pending' && '⏳ Pending'}
              {request.status === 'accepted' && '✅ Approved'}
              {request.status === 'rejected' && '❌ Rejected'}
              {request.status === 'withdrawn' && '↩️ Withdrawn'}
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

        {/* Applicant Info */}
        {applicant && (
          <div className={styles.applicantInfo}>
            <h5 className={styles.applicantTitle}>👤 Applicant Information</h5>
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
          </div>
        )}

        {/* Request Message */}
        {request.message && (
          <div className={styles.requestMessage}>
            <h5 className={styles.messageTitle}>💬 Message from Applicant</h5>
            <div className={styles.messageContent}>
              {request.message.split('\n').map((line, index) => (
                <p key={index}>{line}</p>
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons - Only show for pending requests */}
        {request.status === 'pending' && (
          <div className={styles.requestActions}>
            <button
              className={`btn btn-success btn-sm ${processingRequest === request.id ? styles.btnLoading : ''}`}
              onClick={() => handleRequestAction(request, 'accepted')}
              disabled={processingRequest === request.id}
            >
              {processingRequest === request.id ? (
                <>
                  <span className={styles.loadingSpinner}></span>
                  Approving...
                </>
              ) : (
                '✅ Approve Request'
              )}
            </button>
            
            <button
              className={`btn btn-outline-danger btn-sm ${processingRequest === request.id ? styles.btnLoading : ''}`}
              onClick={() => handleRequestAction(request, 'rejected')}
              disabled={processingRequest === request.id}
            >
              {processingRequest === request.id ? (
                <>
                  <span className={styles.loadingSpinner}></span>
                  Rejecting...
                </>
              ) : (
                '❌ Reject Request'
              )}
            </button>

            <button
              className="btn btn-outline btn-sm"
              onClick={() => window.open(`mailto:${applicant?.registrant_profiles?.email}?subject=Regarding your housing inquiry for "${property.title}"`, '_blank')}
            >
              📧 Contact Directly
            </button>
          </div>
        )}

        {/* Response timestamp for non-pending requests */}
        {request.status !== 'pending' && request.responded_at && (
          <div className={styles.responseInfo}>
            <small className={styles.responseTime}>
              Responded {formatTimeAgo(request.responded_at)}
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
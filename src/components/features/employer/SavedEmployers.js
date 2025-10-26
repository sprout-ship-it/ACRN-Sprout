// src/components/features/employer/SavedEmployers.js - UPDATED with styled display
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import createEmployerService from '../../../utils/database/employerService';
import { transformEmployerForDisplay, getEmployerStats } from '../../../utils/database/employerDisplayUtils';
import { supabase } from '../../../utils/supabase';
import ProfileModal from '../connections/ProfileModal';
import styles from './SavedEmployers.module.css';

const SavedEmployers = ({ onBack }) => {
  const { profile } = useAuth();
  const navigate = useNavigate();
  
  // State management
  const [savedEmployers, setSavedEmployers] = useState([]);
  const [favorites, setFavorites] = useState(new Set());
  const [activeConnections, setActiveConnections] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [actionLoading, setActionLoading] = useState(null);
  const [applicantProfileId, setApplicantProfileId] = useState(null);
  
  // Modal state
  const [showEmployerModal, setShowEmployerModal] = useState(false);
  const [selectedEmployer, setSelectedEmployer] = useState(null);

  // Initialize employer service
  const employerService = createEmployerService(supabase);

  /**
   * Load applicant profile ID
   */
  const loadApplicantProfileId = async () => {
    if (!profile?.id) return;

    try {
      const { data } = await supabase
        .from('applicant_matching_profiles')
        .select('id')
        .eq('user_id', profile.id)
        .single();
      
      if (data) {
        setApplicantProfileId(data.id);
      }
    } catch (err) {
      console.error('Error loading applicant profile:', err);
    }
  };

  /**
   * Load active employment connections
   */
  const loadActiveConnections = async () => {
    if (!applicantProfileId) return;

    try {
      const { data: matches, error } = await supabase
        .from('employment_matches')
        .select('employer_id')
        .eq('applicant_id', applicantProfileId)
        .eq('status', 'active');

      if (error) throw error;

      const activeSet = new Set(matches?.map(m => m.employer_id) || []);
      setActiveConnections(activeSet);
      
      console.log('✅ Loaded active connections:', activeSet.size);
    } catch (err) {
      console.error('Error loading active connections:', err);
    }
  };

  /**
   * Fetch saved employers from favorites and get full employer details
   */
  const fetchSavedEmployers = async () => {
    if (!profile?.id) {
      setError('You must be logged in to view saved employers');
      setLoading(false);
      return;
    }

    try {
      setError(null);
      
      console.log('📋 Fetching favorites for user:', profile.id);
      const favoritesResult = await employerService.favorites.getByUserId(profile.id);
      
      if (!favoritesResult.success) {
        console.error('❌ Failed to fetch favorites:', favoritesResult.error);
        setError('Failed to load saved employers');
        setSavedEmployers([]);
        setFavorites(new Set());
        setLoading(false);
        return;
      }

      const favoritesList = favoritesResult.data || [];
      console.log(`✅ Found ${favoritesList.length} favorites`);

      const favoritesSet = new Set(favoritesList.map(fav => fav.employer_profile_id));
      setFavorites(favoritesSet);

      if (favoritesList.length === 0) {
        setSavedEmployers([]);
        setLoading(false);
        return;
      }

      const employerProfileIds = favoritesList.map(fav => fav.employer_profile_id);
      console.log('💼 Fetching employer profiles for:', employerProfileIds);

const { data: employerProfiles, error: profilesError } = await supabase
  .from('employer_profiles')
  .select('*')
  .in('id', employerProfileIds)
  .eq('is_active', true)
  .order('updated_at', { ascending: false });

      if (profilesError) {
        console.error('❌ Failed to fetch employer profiles:', profilesError);
        setError('Failed to load employer details');
        setLoading(false);
        return;
      }

      console.log(`✅ Found ${employerProfiles?.length || 0} employer profiles`);
      setSavedEmployers(employerProfiles || []);

    } catch (err) {
      console.error('💥 Exception in fetchSavedEmployers:', err);
      setError('An unexpected error occurred');
      setSavedEmployers([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  /**
   * Add employer as active connection
   */
  const handleAddAsEmployer = async (employer) => {
    if (!applicantProfileId) {
      alert('Please complete your applicant profile before adding employers.');
      return;
    }

    if (actionLoading === employer.id) return;

    const confirmed = window.confirm(
      `Add ${employer.company_name} as your current employer? You'll be able to access their contact information immediately.`
    );
    if (!confirmed) return;

    setActionLoading(employer.id);

    try {
      const { data: existingMatch } = await supabase
        .from('employment_matches')
        .select('id, status')
        .eq('applicant_id', applicantProfileId)
        .eq('employer_id', employer.id)
        .single();

      if (existingMatch) {
        if (existingMatch.status === 'active') {
          alert('This employer is already marked as your current employer.');
          setActionLoading(null);
          return;
        }
        
        const { error: updateError } = await supabase
          .from('employment_matches')
          .update({ 
            status: 'active',
            updated_at: new Date().toISOString()
          })
          .eq('id', existingMatch.id);

        if (updateError) throw updateError;
      } else {
        const { error: insertError } = await supabase
          .from('employment_matches')
          .insert({
            applicant_id: applicantProfileId,
            employer_id: employer.id,
            status: 'active',
            requested_by_id: applicantProfileId,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });

        if (insertError) throw insertError;
      }

      setActiveConnections(prev => new Set([...prev, employer.id]));
      
      alert(`${employer.company_name} added as your employer! You can now access their contact information.`);
      
    } catch (err) {
      console.error('💥 Error adding employer:', err);
      alert('Failed to add employer. Please try again.');
    } finally {
      setActionLoading(null);
    }
  };

  /**
   * Remove employer as active connection
   */
  const handleRemoveAsEmployer = async (employer) => {
    if (!applicantProfileId) return;
    if (actionLoading === employer.id) return;

    const confirmed = window.confirm(
      `Remove ${employer.company_name} as your current employer? This will end your employment connection.`
    );
    if (!confirmed) return;

    setActionLoading(employer.id);

    try {
      const { error } = await supabase
        .from('employment_matches')
        .update({ 
          status: 'inactive',
          updated_at: new Date().toISOString()
        })
        .eq('applicant_id', applicantProfileId)
        .eq('employer_id', employer.id)
        .eq('status', 'active');

      if (error) throw error;

      setActiveConnections(prev => {
        const newSet = new Set(prev);
        newSet.delete(employer.id);
        return newSet;
      });

      alert(`${employer.company_name} removed as your employer.`);
      
    } catch (err) {
      console.error('💥 Error removing employer:', err);
      alert('Failed to remove employer. Please try again.');
    } finally {
      setActionLoading(null);
    }
  };

  /**
   * Handle removing employer from favorites
   */
const handleToggleFavorite = async (employerProfileId) => {
  try {
    console.log('💔 Removing favorite:', employerProfileId);
    
    const result = await employerService.favorites.remove(profile.id, employerProfileId);
    
    if (result.success) {
      setFavorites(prev => {
        const newSet = new Set(prev);
        newSet.delete(employerProfileId);
        return newSet;
      });
      
      setSavedEmployers(prev => prev.filter(emp => emp.id !== employerProfileId));
      
      console.log('✅ Favorite removed successfully');
      return true;
    } else {
      console.error('❌ Failed to remove favorite:', result.error);
      setError('Failed to remove employer from favorites');
      return false;
    }
  } catch (err) {
    console.error('💥 Exception removing favorite:', err);
    setError('Failed to remove employer from favorites');
    return false;
  }
};

  /**
   * Handle viewing employer details in modal
   */
  const handleViewDetails = (employer) => {
    setSelectedEmployer(employer);
    setShowEmployerModal(true);
  };

  /**
   * Handle refresh action
   */
  const handleRefresh = async () => {
    setRefreshing(true);
    await loadApplicantProfileId();
    await loadActiveConnections();
    await fetchSavedEmployers();
  };

  /**
   * Handle navigation to find more employers
   */
  const handleFindEmployers = () => {
    navigate('/app/find-employers');
  };

  /**
   * Check if employer is an active connection
   */
  const isActiveConnection = (employerId) => {
    return activeConnections.has(employerId);
  };

  // Load data on mount
  useEffect(() => {
    loadApplicantProfileId();
  }, [profile?.id]);

  useEffect(() => {
    if (applicantProfileId) {
      loadActiveConnections();
    }
  }, [applicantProfileId]);

  useEffect(() => {
    if (applicantProfileId) {
      fetchSavedEmployers();
    }
  }, [profile?.id, applicantProfileId]);

  // Calculate stats
  const stats = getEmployerStats(savedEmployers);

  // Render loading state
  if (loading) {
    return (
      <div className="content">
        <div className={styles.loadingContainer}>
          <div className={styles.loadingSpinner}></div>
          <p className={styles.loadingText}>Loading your saved employers...</p>
        </div>
      </div>
    );
  }

  // Render error state
  if (error) {
    return (
      <div className="content">
        <div className={styles.errorContainer}>
          <div className={styles.errorIcon}>⚠️</div>
          <h2 className={styles.errorTitle}>Unable to Load Saved Employers</h2>
          <p className={styles.errorMessage}>{error}</p>
          <div className={styles.emptyStateActions}>
            <button 
              className="btn btn-primary"
              onClick={handleRefresh}
              disabled={refreshing}
            >
              <span className={styles.btnIcon}>🔄</span>
              {refreshing ? 'Refreshing...' : 'Try Again'}
            </button>
            <button 
              className="btn btn-outline"
              onClick={handleFindEmployers}
            >
              <span className={styles.btnIcon}>🔍</span>
              Find Employers
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="content">
      <div className={styles.savedEmployersContainer}>
        {/* Header Section */}
        <div className={styles.headerSection}>
          <div className={styles.headerContent}>
            <h1 className={styles.headerTitle}>Saved Employers</h1>
            <p className={styles.headerSubtitle}>
              Recovery-friendly employers you've saved for future reference
            </p>
          </div>
          <div className={styles.headerActions}>
            <button 
              className="btn btn-outline btn-sm"
              onClick={handleRefresh}
              disabled={refreshing}
              title="Refresh saved employers"
            >
              <span className={styles.btnIcon}>🔄</span>
              {refreshing ? 'Refreshing...' : 'Refresh'}
            </button>
            <button 
              className="btn btn-primary btn-sm"
              onClick={handleFindEmployers}
              title="Find more employers"
            >
              <span className={styles.btnIcon}>🔍</span>
              Find More
            </button>
          </div>
        </div>

        {/* Stats Bar */}
        {savedEmployers.length > 0 && (
          <div className={styles.statsBar}>
            <div className={styles.statItem}>
              <span className={styles.statValue}>{stats.total}</span>
              <span className={styles.statLabel}>Saved</span>
            </div>
            <div className={styles.statItem}>
              <span className={styles.statValue}>{stats.activelyHiring}</span>
              <span className={styles.statLabel}>Hiring Now</span>
            </div>
            <div className={styles.statItem}>
              <span className={styles.statValue}>{activeConnections.size}</span>
              <span className={styles.statLabel}>My Employers</span>
            </div>
          </div>
        )}

        {/* Saved Employers Grid or Empty State */}
        {savedEmployers.length > 0 ? (
          <div className={styles.employersGrid}>
            <div className={styles.gridContainer}>
              {savedEmployers.map((employer) => {
                const displayData = transformEmployerForDisplay(employer);
                const isActive = isActiveConnection(employer.id);
                const isLoading = actionLoading === employer.id;

                return (
                  <div key={employer.id} className={styles.employerCard}>
                    {/* Card Header */}
                    <div className={styles.cardHeader}>
                      <div className={styles.cardHeaderContent}>
                        <h3 className={styles.cardTitle}>
                          {displayData.companyName}
                        </h3>
                        <div className={styles.badgeGroup}>
                          <span className={`badge ${displayData.hiringStatus.className}`}>
                            {displayData.hiringStatus.emoji} {displayData.hiringStatus.text}
                          </span>
                          {isActive && (
                            <span className="badge badge-success">💼 My Employer</span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Card Body */}
                    <div className={styles.cardBody}>
                      {/* Location */}
                      <div className={styles.locationDisplay}>
                        <span className={styles.locationIcon}>📍</span>
                        <span>{displayData.location}</span>
                      </div>

                      {/* Industry & Type */}
                      <div className={styles.industryType}>
                        <span><strong>Industry:</strong> {displayData.industry}</span>
                      </div>

                      {displayData.companySize && (
                        <div className={styles.cardDetail}>
                          <strong>Size:</strong> {displayData.companySize}
                        </div>
                      )}

                      {displayData.businessType && (
                        <div className={styles.cardDetail}>
                          <strong>Type:</strong> {displayData.businessType}
                        </div>
                      )}

                      {/* Job Types */}
                      {displayData.jobTypes.display.length > 0 && (
                        <div className={styles.tagSection}>
                          <div className={styles.tagLabel}>
                            💼 Job Types Available
                          </div>
                          <div className={styles.tagList}>
                            {displayData.jobTypes.display.map((jobType, i) => (
                              <span key={i} className={styles.tag}>
                                {jobType}
                              </span>
                            ))}
                            {displayData.jobTypes.remaining > 0 && (
                              <span className={styles.tag}>
                                +{displayData.jobTypes.remaining} more
                              </span>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Recovery Features */}
                      {displayData.recoveryFeatures.display.length > 0 && (
                        <div className={styles.tagSection}>
                          <div className={styles.tagLabel}>
                            🤝 Recovery-Friendly Features
                          </div>
                          <div className={styles.tagList}>
                            {displayData.recoveryFeatures.display.map((feature, i) => (
                              <span key={i} className={styles.tag}>
                                {feature}
                              </span>
                            ))}
                            {displayData.recoveryFeatures.remaining > 0 && (
                              <span className={styles.tag}>
                                +{displayData.recoveryFeatures.remaining} more
                              </span>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Description */}
                      {displayData.truncatedDescription && (
                        <div className={styles.description}>
                          {displayData.truncatedDescription}
                        </div>
                      )}
                    </div>

                    {/* Card Actions */}
                    <div className={styles.cardActions}>
                      <button
                        className="btn btn-outline"
                        onClick={() => handleViewDetails(employer)}
                      >
                        👁️ View Details
                      </button>

                      {isActive ? (
                        <button
                          className="btn btn-outline"
                          onClick={() => handleRemoveAsEmployer(employer)}
                          disabled={isLoading}
                          style={{ 
                            color: 'var(--error-text)', 
                            borderColor: 'var(--error-border)' 
                          }}
                        >
                          {isLoading ? 'Removing...' : '❌ Remove as Employer'}
                        </button>
                      ) : (
                        <button
                          className="btn btn-primary"
                          onClick={() => handleAddAsEmployer(employer)}
                          disabled={isLoading}
                        >
                          {isLoading ? 'Adding...' : '💼 Add as My Employer'}
                        </button>
                      )}

                      <button
                        className="btn btn-outline"
                        onClick={() => handleToggleFavorite(employer.id)}
                        title="Remove from favorites"
                      >
                        💔 Unsave
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>❤️</div>
            <h2 className={styles.emptyTitle}>No Saved Employers Yet</h2>
            <p className={styles.emptyMessage}>
              Start building your network by saving recovery-friendly employers that interest you. 
              You can save employers while browsing to easily find them later.
            </p>
            <div className={styles.emptyStateActions}>
              <button 
                className="btn btn-primary"
                onClick={handleFindEmployers}
              >
                <span className={styles.btnIcon}>🔍</span>
                Find Employers
              </button>
            </div>
          </div>
        )}

        {/* Tips Section */}
        <div className={styles.tipsSection}>
          <h3 className={styles.tipsTitle}>
            <span>💡</span>
            Tips for Managing Saved Employers
          </h3>
          <div className={styles.tipsGrid}>
            <div className={styles.tipItem}>
              <span className={styles.tipIcon}>❤️</span>
              <div className={styles.tipContent}>
                <strong>Save employers while browsing</strong> to create your personalized list of 
                recovery-friendly companies that align with your career goals.
              </div>
            </div>
            <div className={styles.tipItem}>
              <span className={styles.tipIcon}>💼</span>
              <div className={styles.tipContent}>
                <strong>Add as My Employer</strong> to mark companies as your current or prospective 
                employers and gain immediate access to their contact information.
              </div>
            </div>
            <div className={styles.tipItem}>
              <span className={styles.tipIcon}>📋</span>
              <div className={styles.tipContent}>
                <strong>Review regularly</strong> to stay updated on new opportunities and 
                maintain engagement with employers you're interested in.
              </div>
            </div>
            <div className={styles.tipItem}>
              <span className={styles.tipIcon}>🎯</span>
              <div className={styles.tipContent}>
                <strong>Quality over quantity</strong> - Focus on saving employers that truly 
                match your values, skills, and recovery-friendly workplace preferences.
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Back Button */}
        {onBack && (
          <div className="text-center mt-5">
            <button
              className="btn btn-outline"
              onClick={onBack}
            >
              ← Back to Dashboard
            </button>
          </div>
        )}

        {/* Profile Modal */}
        {showEmployerModal && selectedEmployer && (
          <ProfileModal
            isOpen={showEmployerModal}
            profile={{
              ...selectedEmployer,
              profile_type: 'employer',
              name: selectedEmployer.company_name || 'Company'
            }}
            connectionStatus={isActiveConnection(selectedEmployer.id) ? 'active' : null}
            onClose={() => setShowEmployerModal(false)}
            onConnect={() => handleAddAsEmployer(selectedEmployer)}
            showContactInfo={isActiveConnection(selectedEmployer.id)}
            showActions={!isActiveConnection(selectedEmployer.id)}
            isAwaitingApproval={false}
          />
        )}
      </div>
    </div>
  );
};

export default SavedEmployers;
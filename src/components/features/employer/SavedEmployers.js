// src/components/features/employer/SavedEmployers.js - UPDATED with connection management
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import createEmployerService from '../../../utils/database/employerService';
import { supabase } from '../../../utils/supabase';
import EmployerDetailsModal from '../connections/modals/EmployerDetailsModal';
import styles from '../property/SavedProperties.module.css';

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

      // Create set of employer_profile IDs that are active connections
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
      
      // Get user's favorite employers
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

      // Update favorites set
      const favoritesSet = new Set(favoritesList.map(fav => fav.employer_user_id));
      setFavorites(favoritesSet);

      if (favoritesList.length === 0) {
        setSavedEmployers([]);
        setLoading(false);
        return;
      }

      // Get full employer profiles for favorited employers
      const employerUserIds = favoritesList.map(fav => fav.employer_user_id);
      console.log('💼 Fetching employer profiles for:', employerUserIds);

      // Fetch employer profiles that match the favorited user IDs
      const { data: employerProfiles, error: profilesError } = await supabase
        .from('employer_profiles')
        .select('*')
        .in('user_id', employerUserIds)
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
   * ✅ NEW: Add employer as active connection (direct to active status)
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
      // Check if match already exists
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
        
        // Update existing inactive match to active
        const { error: updateError } = await supabase
          .from('employment_matches')
          .update({ 
            status: 'active',
            updated_at: new Date().toISOString()
          })
          .eq('id', existingMatch.id);

        if (updateError) throw updateError;
      } else {
        // Create new employment match with active status
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

      // Update local state
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
   * ✅ NEW: Remove employer as active connection
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
      // Set employment match to inactive
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

      // Update local state
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
  const handleToggleFavorite = async (employerUserId) => {
    try {
      console.log('💔 Removing favorite:', employerUserId);
      
      const result = await employerService.favorites.remove(profile.id, employerUserId);
      
      if (result.success) {
        // Update local state
        setFavorites(prev => {
          const newSet = new Set(prev);
          newSet.delete(employerUserId);
          return newSet;
        });
        
        // Remove from saved employers list
        setSavedEmployers(prev => prev.filter(emp => emp.user_id !== employerUserId));
        
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
   * ✅ NEW: Handle viewing employer details in modal
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

      {/* Saved Employers Grid or Empty State */}
      {savedEmployers.length > 0 ? (
        <div className={styles.propertiesGrid}>
          <div className="grid-auto">
            {savedEmployers.map((employer) => {
              const isActive = isActiveConnection(employer.id);
              const isLoading = actionLoading === employer.id;

              return (
                <div key={employer.id} className="card">
                  <div className={styles.cardHeader}>
                    <div className={styles.cardHeaderContent}>
                      <h3 className={styles.cardTitle}>
                        {employer.company_name || 'Company'}
                      </h3>
                      <div className={styles.badgeGroup}>
                        {employer.is_actively_hiring ? (
                          <span className="badge badge-success">🟢 Hiring</span>
                        ) : (
                          <span className="badge badge-warning">⏸️ Not Hiring</span>
                        )}
                        {isActive && (
                          <span className="badge badge-success">💼 My Employer</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className={styles.cardBody}>
                    {employer.industry && (
                      <div className={styles.cardDetail}>
                        <strong>Industry:</strong> {employer.industry}
                      </div>
                    )}
                    
                    {employer.city && employer.state && (
                      <div className={styles.cardDetail}>
                        <strong>Location:</strong> {employer.city}, {employer.state}
                      </div>
                    )}

                    {employer.job_types_available && employer.job_types_available.length > 0 && (
                      <div className={styles.cardDetail}>
                        <strong>Job Types:</strong> {employer.job_types_available.slice(0, 2).join(', ')}
                        {employer.job_types_available.length > 2 && ` (+${employer.job_types_available.length - 2} more)`}
                      </div>
                    )}

                    {employer.recovery_friendly_features && employer.recovery_friendly_features.length > 0 && (
                      <div className={styles.tagSection}>
                        <div className={styles.tagLabel}>Recovery-Friendly:</div>
                        <div className={styles.tagList}>
                          {employer.recovery_friendly_features.slice(0, 3).map((feature, i) => (
                            <span key={i} className={styles.tag}>
                              {feature}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {employer.description && (
                      <div className={styles.cardDetail}>
                        <p className={styles.description}>
                          {employer.description.length > 150 
                            ? `${employer.description.substring(0, 150)}...` 
                            : employer.description
                          }
                        </p>
                      </div>
                    )}
                  </div>

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
                      onClick={() => handleToggleFavorite(employer.user_id)}
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
        <div className={styles.errorContainer}>
          <div className={styles.errorIcon}>❤️</div>
          <h2 className={styles.errorTitle}>No Saved Employers Yet</h2>
          <p className={styles.errorMessage}>
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

      {/* ✅ NEW: Employer Details Modal */}
      {showEmployerModal && selectedEmployer && (
        <EmployerDetailsModal
          isOpen={showEmployerModal}
          employer={selectedEmployer}
          connectionStatus={isActiveConnection(selectedEmployer.id) ? 'active' : null}
          onClose={() => setShowEmployerModal(false)}
          onConnect={() => handleAddAsEmployer(selectedEmployer)}
          showContactInfo={isActiveConnection(selectedEmployer.id)}
        />
      )}
    </div>
  );
};

export default SavedEmployers;
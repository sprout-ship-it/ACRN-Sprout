// src/components/features/employer/SavedEmployers.js
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import createEmployerService from '../../../utils/database/employerService';
import { supabase } from '../../../utils/supabase';
import EmployerResultsGrid from './components/EmployerResultsGrid';
import styles from '../property/SavedProperties.module.css';

const SavedEmployers = ({ onBack }) => {
  const { profile } = useAuth();
  const navigate = useNavigate();
  
  // State management
  const [savedEmployers, setSavedEmployers] = useState([]);
  const [favorites, setFavorites] = useState(new Set());
  const [connections, setConnections] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  // Initialize employer service
  const employerService = createEmployerService(supabase);

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
   * Handle connecting with employer
   */
  const handleConnect = async (employer) => {
    // This would integrate with your connection system
    console.log('🤝 Connecting with employer:', employer.company_name);
    // Add your connection logic here
    return true;
  };

  /**
   * Handle viewing employer details
   */
  const handleViewDetails = (employer) => {
    console.log('👁️ Viewing employer details:', employer.company_name);
    // Add modal or navigation logic here
  };

  /**
   * Handle refresh action
   */
  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchSavedEmployers();
  };

  /**
   * Handle navigation to find more employers
   */
  const handleFindEmployers = () => {
    navigate('/app/find-employers');
  };

  /**
   * Get connection status for employer
   */
  const getConnectionStatus = (employer) => {
    return connections.has(employer.user_id) ? 'connected' : 'none';
  };

  // Load saved employers on mount
  useEffect(() => {
    fetchSavedEmployers();
  }, [profile?.id]);

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
          <EmployerResultsGrid
            employers={savedEmployers}
            loading={false}
            error={null}
            filters={{}}
            favorites={favorites}
            connections={connections}
            onConnect={handleConnect}
            onToggleFavorite={handleToggleFavorite}
            onViewDetails={handleViewDetails}
            onClearFilters={() => {}}
            onFindNearby={() => {}}
            getConnectionStatus={getConnectionStatus}
            showFilters={false}
            emptyStateConfig={{
              show: false // We handle empty state here instead
            }}
          />
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
            <span className={styles.tipIcon}>🤝</span>
            <div className={styles.tipContent}>
              <strong>Connect directly</strong> with saved employers to express interest and 
              start building professional relationships within the recovery community.
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
    </div>
  );
};

export default SavedEmployers;
// src/components/features/employer/EmployerFinder.js - UPDATED FOR PROFILEMODAL
import React, { useState } from 'react';
import useEmployerSearch from './hooks/useEmployerSearch';
import EmployerFilterPanel from './components/EmployerFilterPanel';
import EmployerResultsGrid from './components/EmployerResultsGrid';
import ProfileModal from '../connections/ProfileModal'; // ✅ UPDATED: Use consolidated ProfileModal

const EmployerFinder = ({ onBack }) => {
  // Comprehensive search hook for all employer functionality
  const {
    // Data
    employers,
    favorites,
    connections,
    filters,
    
    // Loading states
    loading,
    favoritesLoading,
    error,
    
    // Actions
    updateFilter,
    updateArrayFilter,
    clearFilters,
    findNearbyEmployers,
    toggleFavorite,
    connectWithEmployer,
    loadEmployers,
    
    // Helpers
    getConnectionStatus,
    
    // State setters
    setError
  } = useEmployerSearch();

  // Local state for modal management
  const [selectedEmployer, setSelectedEmployer] = useState(null);
  const [showModal, setShowModal] = useState(false);

  /**
   * ✅ UPDATED: Handle viewing employer details with ProfileModal format
   */
  const handleViewDetails = (employer) => {
    // Transform employer data to profile format expected by ProfileModal
    const profileData = {
      ...employer,
      profile_type: 'employer',
      name: employer.company_name || 'Company'
    };
    
    setSelectedEmployer(profileData);
    setShowModal(true);
  };

  /**
   * Handle closing employer details modal
   */
  const handleCloseModal = () => {
    setSelectedEmployer(null);
    setShowModal(false);
  };

  /**
   * Handle connecting with employer (with modal management)
   */
  const handleConnect = async (employer) => {
    // Use the original employer data for connection
    const originalEmployer = employers.find(e => 
      e.user_id === employer.user_id || e.id === employer.id
    );
    
    const success = await connectWithEmployer(originalEmployer || employer);
    
    if (success) {
      // Close modal if open and it's the same employer
      if (showModal && selectedEmployer?.user_id === employer.user_id) {
        handleCloseModal();
      }
    }
    
    return success;
  };

  /**
   * Handle toggling favorite status
   */
  const handleToggleFavorite = async (employerId) => {
    console.log('🎯 EmployerFinder: handleToggleFavorite called with:', {
      employerId,
      type: typeof employerId,
      currentFavorites: favorites.size,
      favoritesArray: Array.from(favorites)
    });
    
    const result = await toggleFavorite(employerId);
    
    console.log('🎯 EmployerFinder: toggleFavorite result:', result);
    
    return result;
  };

  /**
   * Handle clearing all filters
   */
  const handleClearFilters = () => {
    clearFilters();
  };

  /**
   * Handle finding nearby employers
   */
  const handleFindNearby = async () => {
    await findNearbyEmployers();
  };

  /**
   * Handle manual search trigger
   */
  const handleSearch = () => {
    loadEmployers();
  };

  /**
   * ✅ NEW: Get connection status for modal
   */
  const getModalConnectionStatus = (employer) => {
    const status = getConnectionStatus(employer);
    
    // Map status to values expected by ProfileModal
    if (status.isConnected) return 'active';
    if (status.isRequested) return 'requested';
    return null;
  };

  /**
   * ✅ NEW: Determine if contact info should be shown
   */
  const shouldShowContactInfo = (employer) => {
    const status = getConnectionStatus(employer);
    return status.isConnected;
  };

  /**
   * ✅ NEW: Determine if action buttons should be shown
   */
  const shouldShowActions = (employer) => {
    const status = getConnectionStatus(employer);
    return !status.isConnected && !status.isRequested;
  };

  return (
    <div className="content">
      {/* Header Section */}
      <div className="text-center mb-5">
        <h1 className="welcome-title">Find Recovery-Friendly Employers</h1>
        <p className="welcome-text">
          Connect with employers committed to supporting individuals in recovery with second-chance hiring, 
          flexible policies, and inclusive workplace cultures.
        </p>
      </div>

      {/* Search Filters Panel */}
      <EmployerFilterPanel
        filters={filters}
        loading={loading}
        onFilterChange={updateFilter}
        onArrayFilterChange={updateArrayFilter}
        onClearFilters={handleClearFilters}
        onFindNearby={handleFindNearby}
        onSearch={handleSearch}
      />

      {/* Results Grid with All States */}
      <EmployerResultsGrid
        employers={employers}
        loading={loading}
        error={error}
        filters={filters}
        favorites={favorites}
        connections={connections}
        onConnect={handleConnect}
        onToggleFavorite={handleToggleFavorite}
        onViewDetails={handleViewDetails}
        onClearFilters={handleClearFilters}
        onFindNearby={handleFindNearby}
        getConnectionStatus={getConnectionStatus}
      />

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

      {/* ✅ UPDATED: Use consolidated ProfileModal */}
      {showModal && selectedEmployer && (
        <ProfileModal
          isOpen={showModal}
          profile={selectedEmployer}
          connectionStatus={getModalConnectionStatus(selectedEmployer)}
          onClose={handleCloseModal}
          onConnect={handleConnect}
          showContactInfo={shouldShowContactInfo(selectedEmployer)}
          showActions={shouldShowActions(selectedEmployer)}
          isAwaitingApproval={false}
        />
      )}
    </div>
  );
};

export default EmployerFinder;
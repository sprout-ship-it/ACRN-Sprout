// src/components/features/employer/EmployerFinder.js
import React, { useState } from 'react';
import useEmployerSearch from './hooks/useEmployerSearch';
import EmployerFilterPanel from './components/EmployerFilterPanel';
import EmployerResultsGrid from './components/EmployerResultsGrid';
import EmployerModal from './components/EmployerModal';

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
   * Handle viewing employer details in modal
   */
  const handleViewDetails = (employer) => {
    setSelectedEmployer(employer);
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
    const success = await connectWithEmployer(employer);
    
    if (success) {
      // Close modal if open and it's the same employer
      if (showModal && selectedEmployer?.id === employer.id) {
        handleCloseModal();
      }
    }
    
    return success;
  };

  /**
   * Handle toggling favorite status
   */
  const handleToggleFavorite = async (employerId) => {
    await toggleFavorite(employerId);
    // Note: Modal stays open when toggling favorites
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

      {/* Employer Details Modal */}
      {showModal && selectedEmployer && (
        <EmployerModal
          isOpen={showModal}
          employer={selectedEmployer}
          connectionStatus={getConnectionStatus(selectedEmployer)}
          isFavorited={favorites.has(selectedEmployer.user_id)}
          onClose={handleCloseModal}
          onConnect={handleConnect}
          onToggleFavorite={handleToggleFavorite}
        />
      )}
    </div>
  );
};

export default EmployerFinder;
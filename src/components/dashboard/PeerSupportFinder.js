// src/components/dashboard/PeerSupportFinder.js
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../utils/supabase';
import LoadingSpinner from '../common/LoadingSpinner';
import '../../styles/global.css';

const PeerSupportFinder = ({ onBack }) => {
  const { user, profile } = useAuth();
  const [specialists, setSpecialists] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedSpecialist, setSelectedSpecialist] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [filters, setFilters] = useState({
    specialties: [],
    serviceArea: '',
    minExperience: ''
  });

  // Available specialty options (you can expand this based on your needs)
  const specialtyOptions = [
    'AA/NA Programs',
    'SMART Recovery',
    'Trauma-Informed Care',
    'Family Therapy',
    'Mindfulness',
    'Career Counseling',
    'Women in Recovery',
    'Secular Programs',
    'Housing Support',
    'Mental Health',
    'Addiction Counseling',
    'Group Facilitation',
    'Crisis Intervention',
    'Relapse Prevention',
    'Life Skills Training'
  ];

  // Load peer specialists on component mount
  useEffect(() => {
    findSpecialists();
  }, []);

  // Reload when filters change
  useEffect(() => {
    if (specialists.length > 0) {
      findSpecialists();
    }
  }, [filters]);

  /**
   * Search for available peer support specialists
   */
  const findSpecialists = async () => {
    setLoading(true);
    setError(null);

    try {
      console.log('🔍 Finding peer support specialists with filters:', filters);
      
      // Build filter object for database query
      const dbFilters = {};
      
      if (filters.specialties.length > 0) {
        dbFilters.specialties = filters.specialties;
      }
      
      if (filters.serviceArea) {
        dbFilters.serviceArea = filters.serviceArea;
      }

      // Get available specialists from database
      const result = await db.peerSupportProfiles.getAvailable(dbFilters);
      
      if (!result.success && result.error) {
        throw new Error(result.error.message || 'Failed to load peer specialists');
      }
      
      let availableSpecialists = result.data || [];
      console.log(`📊 Found ${availableSpecialists.length} available specialists`);
      
      // Apply client-side filters
      if (filters.minExperience) {
        const minYears = parseInt(filters.minExperience);
        availableSpecialists = availableSpecialists.filter(specialist => 
          specialist.years_experience >= minYears
        );
      }

      // Exclude current user if they're also a peer specialist
      availableSpecialists = availableSpecialists.filter(specialist => 
        specialist.user_id !== user.id
      );

      // Sort by experience (most experienced first)
      availableSpecialists.sort((a, b) => 
        (b.years_experience || 0) - (a.years_experience || 0)
      );

      console.log(`✅ Filtered to ${availableSpecialists.length} specialists`);
      setSpecialists(availableSpecialists);
      
    } catch (err) {
      console.error('💥 Error finding specialists:', err);
      setError(err.message || 'Failed to find peer support specialists');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handle specialty filter changes
   */
  const handleSpecialtyChange = (specialty, isChecked) => {
    setFilters(prev => ({
      ...prev,
      specialties: isChecked
        ? [...prev.specialties, specialty]
        : prev.specialties.filter(s => s !== specialty)
    }));
  };

  /**
   * Handle other filter changes
   */
  const handleFilterChange = (field, value) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  /**
   * Show specialist details in modal
   */
  const handleShowDetails = (specialist) => {
    setSelectedSpecialist(specialist);
    setShowDetails(true);
  };

  /**
   * Send connection request to peer specialist
   */
  const handleRequestConnection = async (specialist) => {
    try {
      console.log('🤝 Sending peer support request to:', specialist.registrant_profiles?.first_name);
      
      const requestData = {
        requester_id: user.id,
        target_id: specialist.user_id,
        request_type: 'peer_support',
        message: `Hi ${specialist.registrant_profiles?.first_name}! I'm interested in your peer support services. Your specialties in ${specialist.specialties?.slice(0, 2).join(' and ')} align well with what I'm looking for in my recovery journey.`,
        status: 'pending'
      };
      
      const result = await db.matchRequests.create(requestData);
      
      if (result.error) {
        throw new Error(result.error.message || 'Failed to send connection request');
      }
      
      console.log('✅ Peer support request sent successfully:', result.data);
      alert(`Connection request sent to ${specialist.registrant_profiles?.first_name}!`);
      
    } catch (err) {
      console.error('💥 Error sending connection request:', err);
      alert('Failed to send connection request. Please try again.');
    }
  };

  /**
   * Clear all filters
   */
  const clearFilters = () => {
    setFilters({
      specialties: [],
      serviceArea: '',
      minExperience: ''
    });
  };

  return (
    <>
      <div className="content">
        <div className="text-center mb-5">
          <h1 className="welcome-title">Find Peer Support Specialists</h1>
          <p className="welcome-text">
            Connect with experienced peer support specialists who understand your recovery journey and can provide ongoing guidance and support.
          </p>
        </div>

        {/* Search Filters */}
        <div className="card mb-5">
          <h3 className="card-title">Search Filters</h3>
          
          <div className="grid-auto mb-4">
            <div className="form-group">
              <label className="label">Service Area</label>
              <input
                className="input"
                type="text"
                placeholder="City, State"
                value={filters.serviceArea}
                onChange={(e) => handleFilterChange('serviceArea', e.target.value)}
              />
            </div>
            
            <div className="form-group">
              <label className="label">Minimum Experience</label>
              <select
                className="input"
                value={filters.minExperience}
                onChange={(e) => handleFilterChange('minExperience', e.target.value)}
              >
                <option value="">Any experience level</option>
                <option value="1">1+ years</option>
                <option value="2">2+ years</option>
                <option value="3">3+ years</option>
                <option value="5">5+ years</option>
                <option value="10">10+ years</option>
              </select>
            </div>
            
            <div className="form-group">
              <button
                className="btn btn-primary"
                onClick={findSpecialists}
                disabled={loading}
              >
                {loading ? 'Searching...' : 'Search'}
              </button>
            </div>
          </div>

          {/* Specialties Filter */}
          <div className="form-group">
            <label className="label">Specialties (select any that interest you)</label>
            <div className="grid-auto">
              {specialtyOptions.map(specialty => (
                <div key={specialty} className="checkbox-item">
                  <input
                    type="checkbox"
                    id={`specialty-${specialty}`}
                    checked={filters.specialties.includes(specialty)}
                    onChange={(e) => handleSpecialtyChange(specialty, e.target.checked)}
                  />
                  <label htmlFor={`specialty-${specialty}`}>
                    {specialty}
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* Clear Filters */}
          {(filters.specialties.length > 0 || filters.serviceArea || filters.minExperience) && (
            <div className="text-center">
              <button
                className="btn btn-outline"
                onClick={clearFilters}
              >
                Clear All Filters
              </button>
            </div>
          )}
        </div>

        {/* Error State */}
        {error && (
          <div className="card mb-5">
            <div className="alert alert-error">
              <h4>Error Loading Specialists</h4>
              <p>{error}</p>
              <button 
                className="btn btn-outline"
                onClick={() => {
                  setError(null);
                  findSpecialists();
                }}
              >
                Try Again
              </button>
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="empty-state">
            <LoadingSpinner />
            <p>Finding peer support specialists...</p>
          </div>
        )}

        {/* No Results State */}
        {!loading && !error && specialists.length === 0 && (
          <div className="card text-center">
            <h3>No specialists found</h3>
            <p>Try adjusting your filters or check back later for new specialists.</p>
            <p className="text-sm text-gray-600">
              Current filters: {filters.specialties.length} specialties, {filters.serviceArea || 'Any location'}, {filters.minExperience ? `${filters.minExperience}+ years` : 'Any experience'}
            </p>
          </div>
        )}

        {/* Specialists Grid */}
        {!loading && !error && specialists.length > 0 && (
          <div className="grid-auto mb-5">
            {specialists.map((specialist) => (
              <div key={specialist.user_id} className="card">
                <div className="card-header">
                  <div>
                    <div className="card-title">
                      {specialist.registrant_profiles?.first_name || 'Anonymous'}
                    </div>
                    <div className="card-subtitle">
                      {specialist.professional_title || 'Peer Support Specialist'}
                    </div>
                  </div>
                  <div>
                    {specialist.is_licensed && (
                      <span className="badge badge-success mb-1">Licensed</span>
                    )}
                    {specialist.years_experience && (
                      <span className="badge badge-info">
                        {specialist.years_experience} years experience
                      </span>
                    )}
                  </div>
                </div>

                <div className="mb-4">
                  <div className="grid-2 text-gray-600 mb-3">
                    <div>
                      <span className="text-gray-600">Experience:</span>
                      <span className="text-gray-800 ml-1">
                        {specialist.years_experience ? `${specialist.years_experience} years` : 'Not specified'}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600">Service Area:</span>
                      <span className="text-gray-800 ml-1">
                        {specialist.service_area?.join(', ') || 'Not specified'}
                      </span>
                    </div>
                  </div>

                  {/* Specialties */}
                  {specialist.specialties?.length > 0 && (
                    <div className="mb-3">
                      <div className="label mb-2">Specialties</div>
                      <div className="mb-2">
                        {specialist.specialties.slice(0, 4).map((specialty, i) => (
                          <span key={i} className="badge badge-info mr-1 mb-1">
                            {specialty}
                          </span>
                        ))}
                        {specialist.specialties.length > 4 && (
                          <span className="text-sm text-gray-600">
                            +{specialist.specialties.length - 4} more
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Brief Bio */}
                  {specialist.bio && (
                    <div className="mb-3">
                      <p className="card-text">
                        {specialist.bio.length > 150 
                          ? `${specialist.bio.substring(0, 150)}...` 
                          : specialist.bio
                        }
                      </p>
                    </div>
                  )}

                  {/* Availability */}
                  <div className="text-sm text-gray-600 mb-3">
                    <strong>Accepting new clients:</strong> {specialist.is_accepting_clients ? 'Yes' : 'No'}
                  </div>
                </div>

                <div className="grid-2">
                  <button
                    className="btn btn-outline"
                    onClick={() => handleShowDetails(specialist)}
                  >
                    View Details
                  </button>
                  
                  <button
                    className="btn btn-secondary"
                    onClick={() => handleRequestConnection(specialist)}
                    disabled={!specialist.is_accepting_clients}
                  >
                    Request Connection
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Back Button */}
        {onBack && (
          <div className="text-center">
            <button
              className="btn btn-outline"
              onClick={onBack}
            >
              Back to Dashboard
            </button>
          </div>
        )}
      </div>

      {/* Specialist Details Modal */}
      {showDetails && selectedSpecialist && (
        <div className="modal-overlay" onClick={() => setShowDetails(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">
                {selectedSpecialist.registrant_profiles?.first_name || 'Anonymous'} - Peer Support Specialist
              </h2>
              <button
                className="modal-close"
                onClick={() => setShowDetails(false)}
              >
                ×
              </button>
            </div>

            {/* Professional Information */}
            <div className="mb-4">
              <h4 className="card-title">Professional Background</h4>
              <div className="grid-2 text-sm mb-3">
                <div>
                  <strong>Title:</strong> {selectedSpecialist.professional_title || 'Peer Support Specialist'}
                </div>
                <div>
                  <strong>Experience:</strong> {selectedSpecialist.years_experience || 'Not specified'} years
                </div>
                <div>
                  <strong>Licensed:</strong> {selectedSpecialist.is_licensed ? 'Yes' : 'No'}
                </div>
                <div>
                  <strong>Accepting Clients:</strong> {selectedSpecialist.is_accepting_clients ? 'Yes' : 'No'}
                </div>
              </div>
            </div>

            {/* Bio */}
            {selectedSpecialist.bio && (
              <div className="mb-4">
                <h4 className="card-title">About</h4>
                <p className="card-text">{selectedSpecialist.bio}</p>
              </div>
            )}

            {/* Service Areas */}
            {selectedSpecialist.service_area?.length > 0 && (
              <div className="mb-4">
                <h4 className="card-title">Service Areas</h4>
                <div className="mb-2">
                  {selectedSpecialist.service_area.map((area, i) => (
                    <span key={i} className="badge badge-success mr-1 mb-1">{area}</span>
                  ))}
                </div>
              </div>
            )}

            {/* All Specialties */}
            {selectedSpecialist.specialties?.length > 0 && (
              <div className="mb-4">
                <h4 className="card-title">Specialties</h4>
                <div className="mb-2">
                  {selectedSpecialist.specialties.map((specialty, i) => (
                    <span key={i} className="badge badge-info mr-1 mb-1">{specialty}</span>
                  ))}
                </div>
              </div>
            )}

            {/* Recovery Methods Supported */}
            {selectedSpecialist.supported_recovery_methods?.length > 0 && (
              <div className="mb-4">
                <h4 className="card-title">Supported Recovery Methods</h4>
                <div className="mb-2">
                  {selectedSpecialist.supported_recovery_methods.map((method, i) => (
                    <span key={i} className="badge badge-warning mr-1 mb-1">{method}</span>
                  ))}
                </div>
              </div>
            )}

            {/* Additional Information */}
            {selectedSpecialist.additional_info && (
              <div className="mb-4">
                <h4 className="card-title">Additional Information</h4>
                <p className="card-text">{selectedSpecialist.additional_info}</p>
              </div>
            )}

            <div className="grid-2">
              <button
                className="btn btn-outline"
                onClick={() => setShowDetails(false)}
              >
                Close
              </button>
              
              <button
                className="btn btn-secondary"
                onClick={() => {
                  handleRequestConnection(selectedSpecialist);
                  setShowDetails(false);
                }}
                disabled={!selectedSpecialist.is_accepting_clients}
              >
                Request Connection
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default PeerSupportFinder;
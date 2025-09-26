// src/components/features/matching/MatchDashboard.js - SCHEMA ALIGNED & CLEANED
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { db } from '../../../utils/supabase';

// Import CSS foundation and component module
import '../../../styles/main.css';
import styles from './MatchDashboard.module.css';

const MatchDashboard = ({ onBack }) => {
  const { user, profile } = useAuth();
  
  // State management
  const [activeTab, setActiveTab] = useState('housing');
  const [housingResults, setHousingResults] = useState([]);
  const [peerResults, setPeerResults] = useState([]);
  const [matchedRoommate, setMatchedRoommate] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // ✅ SCHEMA ALIGNED: Housing filters using database field names
  const [housingFilters, setHousingFilters] = useState({
    city: '',
    state: '',
    max_rent: '', // Schema field: monthly_rent
    min_bedrooms: '',
    property_type: '',
    is_recovery_housing: null // Schema field
  });

  // ✅ SCHEMA ALIGNED: Peer support filters using database field names
  const [peerFilters, setPeerFilters] = useState({
    service_city: '',
    service_state: '',
    specialties: [],
    recovery_methods: [], // Schema field
    accepting_clients: true // Schema field
  });

  /**
   * ✅ SCHEMA ALIGNED: Load user's matched roommate data
   */
  const loadMatchedRoommate = async () => {
    try {
      // This would fetch from match_groups or housing_matches table
      // For now, we'll set to null until real matching is implemented
      setMatchedRoommate(null);
    } catch (err) {
      console.error('Error loading matched roommate:', err);
      setError('Failed to load roommate match information');
    }
  };

  /**
   * ✅ SCHEMA ALIGNED: Search for housing using properties table
   */
  const handleHousingSearch = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await db.properties.searchProperties({
        city: housingFilters.city || undefined,
        state: housingFilters.state || undefined,
        max_monthly_rent: housingFilters.max_rent ? parseInt(housingFilters.max_rent) : undefined,
        min_bedrooms: housingFilters.min_bedrooms ? parseInt(housingFilters.min_bedrooms) : undefined,
        property_type: housingFilters.property_type || undefined,
        is_recovery_housing: housingFilters.is_recovery_housing,
        accepting_applications: true // Only show available properties
      });
      
      if (result.success) {
        setHousingResults(result.data || []);
      } else {
        throw new Error(result.error || 'Failed to search housing');
      }
      
    } catch (err) {
      console.error('Error searching housing:', err);
      setError(err.message);
      setHousingResults([]);
    } finally {
      setLoading(false);
    }
  };

  /**
   * ✅ SCHEMA ALIGNED: Search for peer support using peer_support_profiles table
   */
  const handlePeerSearch = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await db.peerSupport.searchPeerSupport({
        service_city: peerFilters.service_city || undefined,
        service_state: peerFilters.service_state || undefined,
        specialties: peerFilters.specialties.length > 0 ? peerFilters.specialties : undefined,
        recovery_methods: peerFilters.recovery_methods.length > 0 ? peerFilters.recovery_methods : undefined,
        accepting_clients: peerFilters.accepting_clients
      });
      
      if (result.success) {
        setPeerResults(result.data || []);
      } else {
        throw new Error(result.error || 'Failed to search peer support');
      }
      
    } catch (err) {
      console.error('Error searching peer support:', err);
      setError(err.message);
      setPeerResults([]);
    } finally {
      setLoading(false);
    }
  };

  /**
   * ✅ SCHEMA ALIGNED: Handle contacting property landlord
   */
  const handleContactLandlord = async (property) => {
    try {
      // This would create a match_request with property_id
      const result = await db.matchRequests.create({
        requester_type: 'applicant',
        requester_id: user.id,
        recipient_type: 'landlord', 
        recipient_id: property.landlord_id,
        property_id: property.id, // Schema field for property-specific requests
        request_type: 'housing',
        message: `Interested in your property: ${property.title}`
      });
      
      if (result.success) {
        alert(`Contact request sent for: ${property.title}`);
      } else {
        throw new Error(result.error || 'Failed to send contact request');
      }
      
    } catch (err) {
      console.error('Error contacting landlord:', err);
      alert('Failed to send contact request. Please try again.');
    }
  };

  /**
   * ✅ SCHEMA ALIGNED: Handle contacting peer support specialist
   */
  const handleContactPeer = async (peer) => {
    try {
      // This would create a peer_support_match
      const result = await db.matchRequests.create({
        requester_type: 'applicant',
        requester_id: user.id,
        recipient_type: 'peer-support',
        recipient_id: peer.id,
        request_type: 'peer-support',
        message: `Interested in peer support services`
      });
      
      if (result.success) {
        alert(`Connection request sent to ${peer.first_name || peer.professional_title}`);
      } else {
        throw new Error(result.error || 'Failed to send connection request');
      }
      
    } catch (err) {
      console.error('Error connecting with peer:', err);
      alert('Failed to send connection request. Please try again.');
    }
  };

  /**
   * ✅ SCHEMA ALIGNED: Get user's location from profile
   */
  const getUserLocation = () => {
    if (profile?.primary_city && profile?.primary_state) {
      return `${profile.primary_city}, ${profile.primary_state}`;
    }
    return null;
  };

  /**
   * ✅ SCHEMA ALIGNED: Auto-populate filters from user profile
   */
  const useMyLocation = () => {
    if (profile?.primary_city && profile?.primary_state) {
      setHousingFilters(prev => ({
        ...prev,
        city: profile.primary_city,
        state: profile.primary_state
      }));
      setPeerFilters(prev => ({
        ...prev,
        service_city: profile.primary_city,
        service_state: profile.primary_state
      }));
    } else {
      alert('No location found in your profile. Please update your matching profile.');
    }
  };

  // Load initial data
  useEffect(() => {
    loadMatchedRoommate();
    
    if (activeTab === 'housing') {
      handleHousingSearch();
    } else if (activeTab === 'peer-support') {
      handlePeerSearch();
    }
  }, [activeTab]);

  return (
    <div className="content">
      {/* Header */}
      <div className="text-center mb-5">
        <h1 className="welcome-title">Match Dashboard</h1>
        <p className="welcome-text">
          Search for housing and connect with peer support specialists
        </p>
        
        {/* Show user location if available */}
        {getUserLocation() && (
          <div className="alert alert-info">
            <strong>Your preferred location:</strong> {getUserLocation()}
            <button 
              className="btn btn-outline btn-sm ml-2"
              onClick={useMyLocation}
            >
              Use My Location
            </button>
          </div>
        )}
      </div>

      {/* Roommate Match Information */}
      {matchedRoommate ? (
        <div className="card mb-5">
          <div className="card-header">
            <h2 className="card-title">Your Roommate Match</h2>
            <span className="badge badge-success">Matched</span>
          </div>
          
          <div className="grid-2 mb-4">
            <div className="card">
              <h3 className="card-title">You</h3>
              <div className="card-text">
                {profile?.first_name || 'Your Name'}<br/>
                Ready to find housing together
              </div>
            </div>
            
            <div className="card">
              <h3 className="card-title">{matchedRoommate.first_name}</h3>
              <div className="card-text">
                Recovery: {matchedRoommate.recovery_stage}<br/>
                Location: {matchedRoommate.primary_city}, {matchedRoommate.primary_state}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="alert alert-info mb-5">
          <h4>No Roommate Match Yet</h4>
          <p>You can still search for housing and peer support services independently.</p>
        </div>
      )}
      
      {/* Action Tabs */}
      <div className="navigation mb-5">
        <ul className="nav-list">
          <li className="nav-item">
            <button
              className={`nav-button ${activeTab === 'housing' ? 'active' : ''}`}
              onClick={() => setActiveTab('housing')}
            >
              <span className="nav-icon">🏠</span>
              Search Housing
            </button>
          </li>
          
          <li className="nav-item">
            <button
              className={`nav-button ${activeTab === 'peer-support' ? 'active' : ''}`}
              onClick={() => setActiveTab('peer-support')}
            >
              <span className="nav-icon">🤝</span>
              Find Peer Support
            </button>
          </li>
          
          <li className="nav-item">
            <button
              className={`nav-button ${activeTab === 'communication' ? 'active' : ''}`}
              onClick={() => setActiveTab('communication')}
            >
              <span className="nav-icon">💬</span>
              Communication
            </button>
          </li>
        </ul>
      </div>
      
      {/* Content Sections */}
      <div className="card">
        {/* ✅ SCHEMA ALIGNED: Housing Search Tab */}
        {activeTab === 'housing' && (
          <>
            <h3 className="card-title">🏠 Available Housing</h3>
            
            {/* Search Controls */}
            <div className="alert alert-info mb-4">
              <div className={styles.filterRowPrimary}>
                <div className="form-group">
                  <label className="label">City</label>
                  <input
                    className="input"
                    type="text"
                    value={housingFilters.city}
                    onChange={(e) => setHousingFilters(prev => ({ ...prev, city: e.target.value }))}
                    placeholder="Austin"
                  />
                </div>
                
                <div className="form-group">
                  <label className="label">State</label>
                  <input
                    className="input"
                    type="text"
                    value={housingFilters.state}
                    onChange={(e) => setHousingFilters(prev => ({ ...prev, state: e.target.value }))}
                    placeholder="TX"
                    maxLength="2"
                  />
                </div>
                
                <div className="form-group">
                  <label className="label">Max Rent</label>
                  <select
                    className="input"
                    value={housingFilters.max_rent}
                    onChange={(e) => setHousingFilters(prev => ({ ...prev, max_rent: e.target.value }))}
                  >
                    <option value="">Any price</option>
                    <option value="1000">Up to $1,000</option>
                    <option value="1500">Up to $1,500</option>
                    <option value="2000">Up to $2,000</option>
                    <option value="2500">Up to $2,500</option>
                  </select>
                </div>
                
                <div className="form-group">
                  <label className="label">Min Bedrooms</label>
                  <select
                    className="input"
                    value={housingFilters.min_bedrooms}
                    onChange={(e) => setHousingFilters(prev => ({ ...prev, min_bedrooms: e.target.value }))}
                  >
                    <option value="">Any</option>
                    <option value="1">1+</option>
                    <option value="2">2+</option>
                    <option value="3">3+</option>
                  </select>
                </div>
                
                <div className="form-group">
                  <label className="label">Property Type</label>
                  <select
                    className="input"
                    value={housingFilters.property_type}
                    onChange={(e) => setHousingFilters(prev => ({ ...prev, property_type: e.target.value }))}
                  >
                    <option value="">Any type</option>
                    <option value="apartment">Apartment</option>
                    <option value="house">House</option>
                    <option value="condo">Condo</option>
                    <option value="townhouse">Townhouse</option>
                    <option value="studio">Studio</option>
                  </select>
                </div>
                
                <div className="form-group">
                  <button
                    className="btn btn-primary"
                    onClick={handleHousingSearch}
                    disabled={loading}
                  >
                    {loading ? 'Searching...' : 'Search'}
                  </button>
                </div>
              </div>
              
              {/* Recovery Housing Filter */}
              <div className="checkbox-item mt-3">
                <input
                  type="checkbox"
                  id="recovery-housing"
                  checked={housingFilters.is_recovery_housing === true}
                  onChange={(e) => setHousingFilters(prev => ({ 
                    ...prev, 
                    is_recovery_housing: e.target.checked ? true : null 
                  }))}
                />
                <label htmlFor="recovery-housing">
                  Recovery housing only
                </label>
              </div>
            </div>
            
            {/* Housing Results */}
            {error && (
              <div className="alert alert-error mb-4">
                <strong>Error:</strong> {error}
              </div>
            )}
            
            {loading ? (
              <div className={styles.loadingState}>
                <div className={styles.loadingText}>Finding housing options...</div>
              </div>
            ) : housingResults.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon">🏠</div>
                <h3 className="empty-state-title">No properties found</h3>
                <p>No housing options found. Try adjusting your search criteria.</p>
              </div>
            ) : (
              <div className={styles.searchResultsGrid}>
                {housingResults.map(property => (
                  <div key={property.id} className={styles.searchResultCard}>
                    <div className={styles.housingCardPlaceholder}>
                      <div className={styles.housingCardIcon}>🏠</div>
                    </div>
                    
                    <div className={styles.searchResultContent}>
                      {property.is_recovery_housing && (
                        <span className="badge badge-warning mb-2">
                          Recovery Housing
                        </span>
                      )}
                      
                      <h4 className={styles.searchResultTitle}>{property.title}</h4>
                      <p className={styles.searchResultAddress}>
                        {property.address}, {property.city}, {property.state} {property.zip_code}
                      </p>
                      <p className={styles.searchResultPrice}>
                        ${property.monthly_rent}/month
                      </p>
                      
                      <div className={styles.searchResultDetails}>
                        {property.bedrooms} bed • {property.bathrooms} bath<br/>
                        Type: {property.property_type}
                        {property.amenities && property.amenities.length > 0 && (
                          <><br/>Amenities: {property.amenities.join(', ')}</>
                        )}
                      </div>
                      
                      <button
                        className={`btn btn-primary ${styles.searchResultButton}`}
                        onClick={() => handleContactLandlord(property)}
                      >
                        Contact Landlord
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
        
        {/* ✅ SCHEMA ALIGNED: Peer Support Tab */}
        {activeTab === 'peer-support' && (
          <>
            <h3 className="card-title">🤝 Peer Support Specialists</h3>
            
            {/* Search Controls */}
            <div className="alert alert-info mb-4">
              <div className={styles.filterRowPrimary}>
                <div className="form-group">
                  <label className="label">City</label>
                  <input
                    className="input"
                    type="text"
                    value={peerFilters.service_city}
                    onChange={(e) => setPeerFilters(prev => ({ ...prev, service_city: e.target.value }))}
                    placeholder="Austin"
                  />
                </div>
                
                <div className="form-group">
                  <label className="label">State</label>
                  <input
                    className="input"
                    type="text"
                    value={peerFilters.service_state}
                    onChange={(e) => setPeerFilters(prev => ({ ...prev, service_state: e.target.value }))}
                    placeholder="TX"
                    maxLength="2"
                  />
                </div>
                
                <div className="form-group">
                  <button
                    className="btn btn-primary"
                    onClick={handlePeerSearch}
                    disabled={loading}
                  >
                    {loading ? 'Searching...' : 'Search'}
                  </button>
                </div>
              </div>
            </div>
            
            {/* Peer Results */}
            {error && (
              <div className="alert alert-error mb-4">
                <strong>Error:</strong> {error}
              </div>
            )}
            
            {loading ? (
              <div className={styles.loadingState}>
                <div className={styles.loadingText}>Finding peer support specialists...</div>
              </div>
            ) : peerResults.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon">🤝</div>
                <h3 className="empty-state-title">No specialists found</h3>
                <p>No peer support specialists found. Try adjusting your search criteria.</p>
              </div>
            ) : (
              <div className={styles.searchResultsGrid}>
                {peerResults.map(peer => (
                  <div key={peer.id} className={styles.peerSupportCard}>
                    <div className={styles.peerSupportHeader}>
                      <div className={styles.peerSupportInfo}>
                        <h4 className="card-title">{peer.professional_title}</h4>
                        <p className="card-subtitle">
                          {peer.service_city}, {peer.service_state}
                        </p>
                      </div>
                      {peer.years_experience && (
                        <span className="badge badge-info">{peer.years_experience} years</span>
                      )}
                    </div>
                    
                    {peer.specialties && peer.specialties.length > 0 && (
                      <div className={styles.peerSupportSpecialties}>
                        <div className="label mb-2">Specialties</div>
                        <div className={styles.specialtyBadges}>
                          {peer.specialties.map((specialty, i) => (
                            <span key={i} className={`badge badge-info ${styles.mr1} ${styles.mb1}`}>
                              {specialty}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {peer.bio && (
                      <p className={styles.peerSupportDescription}>
                        {peer.bio.substring(0, 150)}...
                      </p>
                    )}
                    
                    <button
                      className={`btn btn-primary ${styles.peerSupportButton}`}
                      onClick={() => handleContactPeer(peer)}
                    >
                      Connect with Specialist
                    </button>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
        
        {/* Communication Tab */}
        {activeTab === 'communication' && (
          <>
            <h3 className="card-title">💬 Communication Center</h3>
            
            <div className="empty-state">
              <div className="empty-state-icon">💬</div>
              <h4 className="empty-state-title">Direct Communication Coming Soon</h4>
              <p>
                We're building in-app messaging to help you communicate directly with your roommate, 
                landlords, and peer support specialists. For now, use the contact information provided 
                when you connect with someone.
              </p>
            </div>
          </>
        )}
      </div>
      
      {/* Back Button */}
      {onBack && (
        <div className="text-center mt-5">
          <button
            className="btn btn-outline"
            onClick={onBack}
          >
            Back to Dashboard
          </button>
        </div>
      )}
    </div>
  );
};

export default MatchDashboard;
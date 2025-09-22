// src/components/features/matching/MatchDashboard.js - UPDATED WITH CSS MODULE
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';

// ✅ UPDATED: Import our new CSS foundation and component module
import '../../../styles/main.css';
import styles from './MatchDashboard.module.css';

// ==================== MOCK DATA ====================

const mockMatchInfo = {
  roommate: {
    name: 'Sarah M.',
    age: 28,
    recoveryStage: 'Stable (8 months)',
    location: 'Austin, TX',
    interests: ['Yoga', 'Cooking', 'Reading']
  },
  matchDate: '2024-08-20',
  sharedCriteria: {
    location: 'Austin, TX',
    priceRange: '$800-$1,500',
    housingTypes: ['Apartment', 'House'],
    moveInDate: '2024-10-01'
  }
};

const mockHousingListings = [
  {
    id: 1,
    title: 'Sunny 2BR Apartment Near Recovery Center',
    address: '123 Recovery Lane, Austin, TX',
    price: 1200,
    bedrooms: 2,
    bathrooms: 1,
    isRecoveryFriendly: true,
    amenities: ['Laundry', 'Parking', 'Gym'],
    description: 'Beautiful apartment in recovery-friendly community'
  },
  {
    id: 2,
    title: 'Peaceful House with Garden',
    address: '456 Serenity Drive, Austin, TX',
    price: 1400,
    bedrooms: 3,
    bathrooms: 2,
    isRecoveryFriendly: true,
    amenities: ['Yard', 'Garage', 'Pet-friendly'],
    description: 'Quiet neighborhood perfect for recovery'
  },
  {
    id: 3,
    title: 'Downtown Loft - Walking Distance to Meetings',
    address: '789 Hope Street, Austin, TX',
    price: 1100,
    bedrooms: 1,
    bathrooms: 1,
    isRecoveryFriendly: false,
    amenities: ['Pool', 'Fitness center'],
    description: 'Modern loft in the heart of the city'
  }
];

const mockPeerSupport = [
  {
    id: 1,
    name: 'Dr. Jennifer L.',
    title: 'Licensed Peer Recovery Specialist',
    matchScore: 95,
    specialties: ['AA/NA Programs', 'Trauma-Informed Care', 'Family Therapy'],
    experience: '8 years',
    location: 'Austin, TX',
    description: 'Specializes in early to mid-stage recovery support with emphasis on building healthy relationships.'
  },
  {
    id: 2,
    name: 'Michael R.',
    title: 'Certified Recovery Coach',
    matchScore: 88,
    specialties: ['SMART Recovery', 'Mindfulness', 'Career Counseling'],
    experience: '5 years',
    location: 'Austin, TX',
    description: 'Focuses on holistic recovery approaches and life skills development.'
  },
  {
    id: 3,
    name: 'Amanda K.',
    title: 'Peer Support Specialist',
    matchScore: 92,
    specialties: ['Women in Recovery', 'Secular Programs', 'Housing Support'],
    experience: '6 years',
    location: 'Austin, TX',
    description: 'Passionate about helping women navigate housing and recovery challenges.'
  }
];

// ==================== MATCH DASHBOARD COMPONENT ====================

const MatchDashboard = ({ onBack }) => {
  const { user, profile } = useAuth();
  const [activeTab, setActiveTab] = useState('housing');
  const [housingResults, setHousingResults] = useState(mockHousingListings);
  const [peerResults, setPeerResults] = useState(mockPeerSupport);
  const [loading, setLoading] = useState(false);
  const [housingFilters, setHousingFilters] = useState({
    location: 'Austin, TX',
    maxPrice: '1500',
    bedrooms: '',
    type: ''
  });
  
  // Handle housing search
  const handleHousingSearch = async () => {
    setLoading(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Filter results based on criteria
      let filtered = mockHousingListings;
      
      if (housingFilters.maxPrice) {
        filtered = filtered.filter(listing => listing.price <= parseInt(housingFilters.maxPrice));
      }
      
      if (housingFilters.bedrooms) {
        filtered = filtered.filter(listing => listing.bedrooms >= parseInt(housingFilters.bedrooms));
      }
      
      // Prioritize recovery-friendly properties
      filtered.sort((a, b) => {
        if (a.isRecoveryFriendly && !b.isRecoveryFriendly) return -1;
        if (!a.isRecoveryFriendly && b.isRecoveryFriendly) return 1;
        return 0;
      });
      
      setHousingResults(filtered);
      
    } catch (error) {
      console.error('Error searching housing:', error);
    } finally {
      setLoading(false);
    }
  };
  
  // Handle peer support search
  const handlePeerSearch = async () => {
    setLoading(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Sort by match score
      const sorted = [...mockPeerSupport].sort((a, b) => b.matchScore - a.matchScore);
      setPeerResults(sorted);
      
    } catch (error) {
      console.error('Error searching peer support:', error);
    } finally {
      setLoading(false);
    }
  };
  
  // Handle contact actions
  const handleContactLandlord = (listing) => {
    alert(`Contacting landlord for: ${listing.title}`);
  };
  
  const handleContactPeer = (peer) => {
    alert(`Connecting with ${peer.name} for peer support services`);
  };
  
  // Load initial data
  useEffect(() => {
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
          Search for housing and connect with peer support specialists with your matched roommate
        </p>
      </div>
      
      {/* Match Information */}
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
            <h3 className="card-title">{mockMatchInfo.roommate.name}</h3>
            <div className="card-text">
              Age: {mockMatchInfo.roommate.age}<br/>
              Recovery: {mockMatchInfo.roommate.recoveryStage}<br/>
              Interests: {mockMatchInfo.roommate.interests.join(', ')}
            </div>
          </div>
        </div>
        
        <div className="alert alert-info">
          <h4 className="mb-2">Shared Housing Criteria</h4>
          <div className="grid-auto text-gray-600">
            <div><strong>Location:</strong> {mockMatchInfo.sharedCriteria.location}</div>
            <div><strong>Budget:</strong> {mockMatchInfo.sharedCriteria.priceRange}</div>
            <div><strong>Types:</strong> {mockMatchInfo.sharedCriteria.housingTypes.join(', ')}</div>
            <div><strong>Move-in:</strong> {mockMatchInfo.sharedCriteria.moveInDate}</div>
          </div>
        </div>
      </div>
      
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
        {/* Housing Search Tab */}
        {activeTab === 'housing' && (
          <>
            <h3 className="card-title">🏠 Available Housing</h3>
            
            {/* ✅ UPDATED: Search Controls using CSS module */}
            <div className="alert alert-info mb-4">
              <div className={styles.filterRowPrimary}>
                <div className="form-group">
                  <label className="label">Location</label>
                  <input
                    className="input"
                    type="text"
                    value={housingFilters.location}
                    onChange={(e) => setHousingFilters(prev => ({ ...prev, location: e.target.value }))}
                    placeholder="City, State"
                  />
                </div>
                
                <div className="form-group">
                  <label className="label">Max Price</label>
                  <select
                    className="input"
                    value={housingFilters.maxPrice}
                    onChange={(e) => setHousingFilters(prev => ({ ...prev, maxPrice: e.target.value }))}
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
                    value={housingFilters.bedrooms}
                    onChange={(e) => setHousingFilters(prev => ({ ...prev, bedrooms: e.target.value }))}
                  >
                    <option value="">Any</option>
                    <option value="1">1+</option>
                    <option value="2">2+</option>
                    <option value="3">3+</option>
                  </select>
                </div>
                
                <div className="form-group">
                  <button
                    className="btn btn-secondary"
                    onClick={handleHousingSearch}
                    disabled={loading}
                  >
                    {loading ? 'Searching...' : 'Search'}
                  </button>
                </div>
              </div>
            </div>
            
            {/* ✅ UPDATED: Housing Results using CSS module */}
            {loading ? (
              <div className={styles.loadingState}>
                <div className={styles.loadingText}>Finding the perfect housing options for you...</div>
              </div>
            ) : housingResults.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon">🏠</div>
                <h3 className="empty-state-title">No properties found</h3>
                <p>No housing options found. Try adjusting your search criteria.</p>
              </div>
            ) : (
              <div className={styles.searchResultsGrid}>
                {housingResults.map(listing => (
                  <div key={listing.id} className={styles.searchResultCard}>
                    {/* ✅ UPDATED: Housing card placeholder using CSS module */}
                    <div className={styles.housingCardPlaceholder}>
                      <div className={styles.housingCardIcon}>🏠</div>
                    </div>
                    
                    <div className={styles.searchResultContent}>
                      {listing.isRecoveryFriendly && (
                        <span className="badge badge-warning mb-2">
                          Recovery Friendly
                        </span>
                      )}
                      
                      <h4 className={styles.searchResultTitle}>{listing.title}</h4>
                      <p className={styles.searchResultAddress}>{listing.address}</p>
                      <p className={styles.searchResultPrice}>
                        ${listing.price}/month
                      </p>
                      
                      <div className={styles.searchResultDetails}>
                        {listing.bedrooms} bed • {listing.bathrooms} bath<br/>
                        {listing.amenities.join(' • ')}
                      </div>
                      
                      <button
                        className={`btn btn-primary ${styles.searchResultButton}`}
                        onClick={() => handleContactLandlord(listing)}
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
        
        {/* ✅ UPDATED: Peer Support Tab using CSS module */}
        {activeTab === 'peer-support' && (
          <>
            <h3 className="card-title">🤝 Peer Support Specialists</h3>
            
            <p className="card-text mb-5">
              Connect with peer support specialists who understand your recovery journey and can provide ongoing guidance.
            </p>
            
            {loading ? (
              <div className={styles.loadingState}>
                <div className={styles.loadingText}>Finding compatible peer support specialists...</div>
              </div>
            ) : (
              <div className={styles.searchResultsGrid}>
                {peerResults.map(peer => (
                  <div key={peer.id} className={styles.peerSupportCard}>
                    <div className={styles.peerSupportHeader}>
                      <div className={styles.peerSupportInfo}>
                        <h4 className="card-title">{peer.name}</h4>
                        <p className="card-subtitle">{peer.title}</p>
                      </div>
                      <span className="badge badge-success">{peer.matchScore}% Match</span>
                    </div>
                    
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
                    
                    <div className={styles.peerSupportDetails}>
                      <strong>Experience:</strong> {peer.experience}<br/>
                      <strong>Location:</strong> {peer.location}
                    </div>
                    
                    <p className={styles.peerSupportDescription}>
                      {peer.description}
                    </p>
                    
                    <button
                      className={`btn btn-primary ${styles.peerSupportButton}`}
                      onClick={() => handleContactPeer(peer)}
                    >
                      Connect with {peer.name.split(' ')[0]}
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
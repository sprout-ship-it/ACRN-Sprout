// src/components/PropertySearch.js
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../utils/supabase';
import '../styles/global.css';

const PropertySearch = () => {
  const { user, profile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [properties, setProperties] = useState([]);
  const [totalResults, setTotalResults] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  
  // Search and filter state
  const [searchFilters, setSearchFilters] = useState({
    location: '',
    maxPrice: '',
    minBedrooms: '',
    propertyType: '',
    recoveryFriendly: false,
    furnished: false,
    petsAllowed: false,
    smokingAllowed: false,
    acceptedSubsidies: [],
    amenities: [],
    utilities: []
  });

  // Available filter options based on your schema
  const propertyTypes = [
    { value: 'apartment', label: 'Apartment' },
    { value: 'house', label: 'House' },
    { value: 'condo', label: 'Condo' },
    { value: 'townhouse', label: 'Townhouse' },
    { value: 'studio', label: 'Studio' },
    { value: 'sober_living_level_1', label: 'Sober Living Level 1' },
    { value: 'sober_living_level_2', label: 'Sober Living Level 2' },
    { value: 'halfway_house', label: 'Halfway House' },
    { value: 'transitional_housing', label: 'Transitional Housing' }
  ];

  const subsidyOptions = [
    'Section 8', 'HUD-VASH', 'Veterans Benefits', 'SSI/SSDI', 
    'State Housing Vouchers', 'Local Housing Assistance', 'Medicaid'
  ];

  const amenityOptions = [
    'Parking', 'Laundry', 'Gym', 'Pool', 'Garden', 'Balcony', 
    'Air Conditioning', 'Heating', 'Internet', 'Cable TV'
  ];

  const utilityOptions = [
    'Electric', 'Gas', 'Water', 'Sewer', 'Trash', 'Internet', 'Cable'
  ];

  // Load properties on component mount and when filters change
  useEffect(() => {
    handleSearch();
  }, []);

  // Handle search with filters
  const handleSearch = async (resetPage = true) => {
    if (resetPage) {
      setCurrentPage(1);
    }
    
    setLoading(true);
    try {
      // Build the query with filters
      let query = supabase
        .from('properties')
        .select('*', { count: 'exact' })
        .eq('status', 'available');

      // Location filter (city or state)
      if (searchFilters.location.trim()) {
        query = query.or(`city.ilike.%${searchFilters.location}%,state.ilike.%${searchFilters.location}%,address.ilike.%${searchFilters.location}%`);
      }

      // Price filter
      if (searchFilters.maxPrice) {
        query = query.lte('monthly_rent', parseInt(searchFilters.maxPrice));
      }

      // Bedrooms filter
      if (searchFilters.minBedrooms) {
        query = query.gte('bedrooms', parseInt(searchFilters.minBedrooms));
      }

      // Property type filter
      if (searchFilters.propertyType) {
        query = query.eq('property_type', searchFilters.propertyType);
      }

      // Recovery housing filter
      if (searchFilters.recoveryFriendly) {
        query = query.eq('is_recovery_housing', true);
      }

      // Basic amenity filters
      if (searchFilters.furnished) {
        query = query.eq('furnished', true);
      }

      if (searchFilters.petsAllowed) {
        query = query.eq('pets_allowed', true);
      }

      if (!searchFilters.smokingAllowed) {
        query = query.eq('smoking_allowed', false);
      }

      // Array filters (subsidies, amenities, utilities)
      if (searchFilters.acceptedSubsidies.length > 0) {
        query = query.overlaps('accepted_subsidies', searchFilters.acceptedSubsidies);
      }

      if (searchFilters.amenities.length > 0) {
        query = query.overlaps('amenities', searchFilters.amenities);
      }

      if (searchFilters.utilities.length > 0) {
        query = query.overlaps('utilities_included', searchFilters.utilities);
      }

      // Pagination
      const pageSize = 12;
      const from = (currentPage - 1) * pageSize;
      const to = from + pageSize - 1;
      
      query = query.range(from, to);

      // Order by: recovery housing first, then by price
      query = query.order('is_recovery_housing', { ascending: false })
                  .order('monthly_rent', { ascending: true });

      const { data, error, count } = await query;

      if (error) throw error;

      setProperties(data || []);
      setTotalResults(count || 0);
      
    } catch (error) {
      console.error('Error searching properties:', error);
      alert('Error searching properties. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle filter input changes
  const handleFilterChange = (field, value) => {
    setSearchFilters(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Handle array filter changes (checkboxes)
  const handleArrayFilterChange = (field, value, isChecked) => {
    setSearchFilters(prev => ({
      ...prev,
      [field]: isChecked
        ? [...prev[field], value]
        : prev[field].filter(item => item !== value)
    }));
  };

  // Clear all filters
  const clearFilters = () => {
    setSearchFilters({
      location: '',
      maxPrice: '',
      minBedrooms: '',
      propertyType: '',
      recoveryFriendly: false,
      furnished: false,
      petsAllowed: false,
      smokingAllowed: false,
      acceptedSubsidies: [],
      amenities: [],
      utilities: []
    });
  };

  // Handle contact landlord
  const handleContactLandlord = (property) => {
    const subject = `Inquiry about ${property.title}`;
    const body = `Hi,\n\nI'm interested in your property listing "${property.title}" at ${property.address}.\n\nCould you please provide more information?\n\nThank you!`;
    
    if (property.contact_email) {
      window.location.href = `mailto:${property.contact_email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    } else if (property.phone) {
      alert(`Please call the landlord at: ${property.phone}`);
    } else {
      alert('Contact information not available for this property.');
    }
  };

  // Handle save property (future feature)
  const handleSaveProperty = (property) => {
    alert(`Property "${property.title}" saved to your favorites! (Feature coming soon)`);
  };

  // Pagination
  const totalPages = Math.ceil(totalResults / 12);
  const showPagination = totalPages > 1;

  return (
    <div className="content">
      {/* Header */}
      <div className="text-center mb-5">
        <h1 className="welcome-title">Property Search</h1>
        <p className="welcome-text">
          Find recovery-friendly housing options that meet your needs
        </p>
      </div>

      {/* Search Bar and Quick Filters */}
      <div className="card mb-4">
        <div className="grid-auto mb-4">
          <div className="form-group">
            <label className="label">Location</label>
            <input
              className="input"
              type="text"
              placeholder="City, State, or Address"
              value={searchFilters.location}
              onChange={(e) => handleFilterChange('location', e.target.value)}
            />
          </div>
          
          <div className="form-group">
            <label className="label">Max Monthly Rent</label>
            <select
              className="input"
              value={searchFilters.maxPrice}
              onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
            >
              <option value="">Any price</option>
              <option value="500">Up to $500</option>
              <option value="750">Up to $750</option>
              <option value="1000">Up to $1,000</option>
              <option value="1500">Up to $1,500</option>
              <option value="2000">Up to $2,000</option>
              <option value="2500">Up to $2,500</option>
              <option value="3000">Up to $3,000</option>
            </select>
          </div>
          
          <div className="form-group">
            <label className="label">Min Bedrooms</label>
            <select
              className="input"
              value={searchFilters.minBedrooms}
              onChange={(e) => handleFilterChange('minBedrooms', e.target.value)}
            >
              <option value="">Any</option>
              <option value="1">1+</option>
              <option value="2">2+</option>
              <option value="3">3+</option>
              <option value="4">4+</option>
            </select>
          </div>
          
          <div className="form-group">
            <button
              className="btn btn-primary"
              onClick={() => handleSearch()}
              disabled={loading}
              style={{ marginTop: '27px' }}
            >
              {loading ? 'Searching...' : 'Search'}
            </button>
          </div>
        </div>

        {/* Quick Filter Toggles */}
        <div className="grid-auto mb-4">
          <div className="checkbox-item" onClick={() => handleFilterChange('recoveryFriendly', !searchFilters.recoveryFriendly)}>
            <input
              type="checkbox"
              checked={searchFilters.recoveryFriendly}
              onChange={() => {}}
            />
            <span>Recovery Housing Only</span>
          </div>
          
          <div className="checkbox-item" onClick={() => handleFilterChange('furnished', !searchFilters.furnished)}>
            <input
              type="checkbox"
              checked={searchFilters.furnished}
              onChange={() => {}}
            />
            <span>Furnished</span>
          </div>
          
          <div className="checkbox-item" onClick={() => handleFilterChange('petsAllowed', !searchFilters.petsAllowed)}>
            <input
              type="checkbox"
              checked={searchFilters.petsAllowed}
              onChange={() => {}}
            />
            <span>Pet Friendly</span>
          </div>
        </div>

        {/* Advanced Filters Toggle */}
        <div className="text-center">
          <button
            className="btn btn-outline"
            onClick={() => setShowFilters(!showFilters)}
          >
            {showFilters ? 'Hide' : 'Show'} Advanced Filters
          </button>
          
          {(searchFilters.acceptedSubsidies.length > 0 || searchFilters.amenities.length > 0 || searchFilters.utilities.length > 0 || searchFilters.propertyType) && (
            <button
              className="btn btn-outline ml-2"
              onClick={clearFilters}
            >
              Clear All Filters
            </button>
          )}
        </div>
      </div>

      {/* Advanced Filters */}
      {showFilters && (
        <div className="card mb-4">
          <h3 className="card-title">Advanced Filters</h3>
          
          <div className="grid-2 mb-4">
            <div className="form-group">
              <label className="label">Property Type</label>
              <select
                className="input"
                value={searchFilters.propertyType}
                onChange={(e) => handleFilterChange('propertyType', e.target.value)}
              >
                <option value="">All Types</option>
                {propertyTypes.map(type => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="form-group">
              <label className="label">Smoking Policy</label>
              <select
                className="input"
                value={searchFilters.smokingAllowed}
                onChange={(e) => handleFilterChange('smokingAllowed', e.target.value === 'true')}
              >
                <option value={false}>Non-Smoking Preferred</option>
                <option value={true}>Smoking Allowed OK</option>
              </select>
            </div>
          </div>

          {/* Accepted Subsidies */}
          <div className="form-group">
            <label className="label">Accepted Subsidies/Benefits</label>
            <div className="grid-auto">
              {subsidyOptions.map(subsidy => (
                <div
                  key={subsidy}
                  className={`checkbox-item ${searchFilters.acceptedSubsidies.includes(subsidy) ? 'selected' : ''}`}
                  onClick={() => handleArrayFilterChange('acceptedSubsidies', subsidy, !searchFilters.acceptedSubsidies.includes(subsidy))}
                >
                  <input
                    type="checkbox"
                    checked={searchFilters.acceptedSubsidies.includes(subsidy)}
                    onChange={() => {}}
                  />
                  <span>{subsidy}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Amenities */}
          <div className="form-group">
            <label className="label">Required Amenities</label>
            <div className="grid-auto">
              {amenityOptions.map(amenity => (
                <div
                  key={amenity}
                  className={`checkbox-item ${searchFilters.amenities.includes(amenity) ? 'selected' : ''}`}
                  onClick={() => handleArrayFilterChange('amenities', amenity, !searchFilters.amenities.includes(amenity))}
                >
                  <input
                    type="checkbox"
                    checked={searchFilters.amenities.includes(amenity)}
                    onChange={() => {}}
                  />
                  <span>{amenity}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Utilities Included */}
          <div className="form-group">
            <label className="label">Utilities Included</label>
            <div className="grid-auto">
              {utilityOptions.map(utility => (
                <div
                  key={utility}
                  className={`checkbox-item ${searchFilters.utilities.includes(utility) ? 'selected' : ''}`}
                  onClick={() => handleArrayFilterChange('utilities', utility, !searchFilters.utilities.includes(utility))}
                >
                  <input
                    type="checkbox"
                    checked={searchFilters.utilities.includes(utility)}
                    onChange={() => {}}
                  />
                  <span>{utility}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Results Header */}
      <div className="card mb-4">
        <div className="flex" style={{ alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h3 className="card-title">
              {loading ? 'Searching...' : `${totalResults} Properties Found`}
            </h3>
            {totalResults > 0 && (
              <p className="text-gray-600">
                Recovery housing properties are prioritized in results
              </p>
            )}
          </div>
          
          {showPagination && (
            <div className="text-gray-600">
              Page {currentPage} of {totalPages}
            </div>
          )}
        </div>
      </div>

      {/* Results Grid */}
      {loading ? (
        <div className="loading-container">
          <div className="loading-spinner large"></div>
          <p className="loading-text">Finding the perfect housing options for you...</p>
        </div>
      ) : properties.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">🏠</div>
          <h3 className="empty-state-title">No properties found</h3>
          <p>Try adjusting your search criteria or location.</p>
          <button
            className="btn btn-primary mt-3"
            onClick={clearFilters}
          >
            Clear Filters
          </button>
        </div>
      ) : (
        <>
          <div className="grid-auto">
            {properties.map(property => (
              <div key={property.id} className="card">
                {/* Property Image Placeholder */}
                <div className="card" style={{ 
                  background: 'var(--bg-light-cream)', 
                  marginBottom: 'var(--spacing-lg)', 
                  textAlign: 'center', 
                  padding: '60px 20px' 
                }}>
                  <div style={{ fontSize: '3rem', color: 'var(--primary-purple)' }}>
                    {property.is_recovery_housing ? '🏡' : '🏠'}
                  </div>
                </div>
                
                <div>
                  {/* Badges */}
                  <div className="mb-2">
                    {property.is_recovery_housing && (
                      <span className="badge badge-warning mr-1">
                        Recovery Housing
                      </span>
                    )}
                    {property.furnished && (
                      <span className="badge badge-info mr-1">
                        Furnished
                      </span>
                    )}
                    {property.pets_allowed && (
                      <span className="badge badge-success mr-1">
                        Pet Friendly
                      </span>
                    )}
                    {property.accepted_subsidies && property.accepted_subsidies.length > 0 && (
                      <span className="badge badge-info mr-1">
                        Subsidies OK
                      </span>
                    )}
                  </div>
                  
                  <h4 className="card-title">{property.title}</h4>
                  <p className="text-gray-600 mb-2">
                    {property.address}, {property.city}, {property.state} {property.zip_code}
                  </p>
                  <p className="card-title text-secondary-teal mb-2">
                    ${property.monthly_rent}/month
                  </p>
                  
                  <div className="text-gray-600 mb-3">
                    {property.bedrooms || 'Studio'} bed • {property.bathrooms} bath
                    {property.property_type && (
                      <span> • {property.property_type.replace(/_/g, ' ')}</span>
                    )}
                  </div>

                  {/* Amenities Preview */}
                  {property.amenities && property.amenities.length > 0 && (
                    <div className="text-gray-600 mb-3">
                      <small>{property.amenities.slice(0, 3).join(' • ')}</small>
                      {property.amenities.length > 3 && (
                        <small> • +{property.amenities.length - 3} more</small>
                      )}
                    </div>
                  )}

                  {/* Recovery Housing Details */}
                  {property.is_recovery_housing && (
                    <div className="alert alert-info mb-3">
                      <small>
                        <strong>Recovery Support:</strong>
                        {property.case_management && ' Case Management'}
                        {property.counseling_services && ' • Counseling'}
                        {property.required_programs && property.required_programs.length > 0 && ` • Program Requirements`}
                      </small>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="grid-2">
                    <button
                      className="btn btn-primary btn-sm"
                      onClick={() => handleContactLandlord(property)}
                    >
                      Contact Owner
                    </button>
                    
                    <button
                      className="btn btn-outline btn-sm"
                      onClick={() => handleSaveProperty(property)}
                    >
                      Save Property
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {showPagination && (
            <div className="text-center mt-5">
              <div className="grid-auto" style={{ maxWidth: '400px', margin: '0 auto' }}>
                <button
                  className="btn btn-outline"
                  onClick={() => {
                    setCurrentPage(currentPage - 1);
                    handleSearch(false);
                  }}
                  disabled={currentPage === 1 || loading}
                >
                  Previous
                </button>
                
                <span className="text-center" style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  padding: '15px'
                }}>
                  Page {currentPage} of {totalPages}
                </span>
                
                <button
                  className="btn btn-outline"
                  onClick={() => {
                    setCurrentPage(currentPage + 1);
                    handleSearch(false);
                  }}
                  disabled={currentPage === totalPages || loading}
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Future External Integration Note */}
      <div className="card mt-5" style={{ background: 'var(--bg-light-cream)' }}>
        <div className="text-center">
          <h4 className="card-title">Not finding what you need?</h4>
          <p className="text-gray-600">
            We're working on integrating with national property databases to expand your search options. 
            Properties listed directly with our recovery community will always be prioritized.
          </p>
        </div>
      </div>
    </div>
  );
};

export default PropertySearch;
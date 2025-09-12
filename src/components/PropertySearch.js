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
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [userPreferences, setUserPreferences] = useState(null);
  const [searchMode, setSearchMode] = useState('basic'); // 'basic' or 'recovery'
  
  // ✅ FIXED: Restructured search filters to match form criteria
  const [basicFilters, setBasicFilters] = useState({
    location: '',
    state: '',
    maxRent: '',
    minBedrooms: '',
    housingType: [], // Array to match form structure
    furnished: false,
    petsAllowed: false,
    utilityBudget: '' // Added for better budget alignment
  });

  // ✅ NEW: Recovery-specific search filters
  const [recoveryFilters, setRecoveryFilters] = useState({
    recoveryHousingOnly: true,
    soberness: '',
    caseManagement: false,
    counselingServices: false,
    supportGroups: false,
    requiredPrograms: [],
    recoveryStage: ''
  });

  // ✅ IMPROVED: Advanced filters for detailed search
  const [advancedFilters, setAdvancedFilters] = useState({
    acceptedSubsidies: [],
    amenities: [],
    utilitiesIncluded: [],
    smokingPolicy: '',
    guestPolicy: '',
    backgroundCheck: '',
    leaseLength: '',
    moveInCost: ''
  });

  // ✅ NEW: External search integration flags
  const [externalSources, setExternalSources] = useState({
    includeZillow: false,
    includeApartmentsDotCom: false,
    includeRentDotCom: false,
    enableExternalSearch: false // Master toggle for future feature
  });

  // Housing type options that match form structure
  const housingTypeOptions = [
    { value: 'apartment', label: 'Apartment' },
    { value: 'house', label: 'House' },
    { value: 'condo', label: 'Condo' },
    { value: 'townhouse', label: 'Townhouse' },
    { value: 'studio', label: 'Studio' },
    { value: 'shared_room', label: 'Shared Room' },
    { value: 'sober_living_level_1', label: 'Sober Living Level 1' },
    { value: 'sober_living_level_2', label: 'Sober Living Level 2' },
    { value: 'halfway_house', label: 'Halfway House' },
    { value: 'transitional_housing', label: 'Transitional Housing' }
  ];

  const stateOptions = [
    'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
    'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
    'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
    'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
    'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'
  ];

  const subsidyOptions = [
    'Section 8', 'HUD-VASH', 'Veterans Benefits', 'SSI/SSDI', 
    'State Housing Vouchers', 'Local Housing Assistance', 'Medicaid',
    'SNAP Benefits', 'Housing Choice Voucher', 'Low Income Housing Tax Credit'
  ];

  const amenityOptions = [
    'Parking', 'Laundry In-Unit', 'Laundry On-Site', 'Gym/Fitness Center', 
    'Pool', 'Garden/Yard', 'Balcony/Patio', 'Air Conditioning', 'Heating', 
    'High-Speed Internet', 'Cable TV', 'Dishwasher', 'Microwave', 'Storage'
  ];

  const utilityOptions = [
    'Electric', 'Gas', 'Water', 'Sewer', 'Trash/Recycling', 
    'Internet', 'Cable', 'Heat', 'Hot Water'
  ];

  // ✅ NEW: Load user preferences from their matching profile
  useEffect(() => {
    loadUserPreferences();
  }, [user]);

  // Load properties on component mount and when filters change
  useEffect(() => {
    handleSearch();
  }, [basicFilters, recoveryFilters, advancedFilters, searchMode]);

  /**
   * ✅ NEW: Load user's housing preferences from their profile
   */
  const loadUserPreferences = async () => {
    if (!user?.id) return;

    try {
      const { data, error } = await supabase
        .from('applicant_forms')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (data && !error) {
        setUserPreferences(data);
        
        // ✅ NEW: Auto-populate filters from user preferences
        const autoFilters = {
          location: data.preferred_location || '',
          maxRent: data.budget_max?.toString() || '',
          minBedrooms: data.preferred_bedrooms?.toString() || '',
          housingType: data.housing_type || [],
          furnished: data.furnished_preference || false,
          petsAllowed: data.pets_owned || false
        };
        
        setBasicFilters(prev => ({ ...prev, ...autoFilters }));
        console.log('✅ Auto-populated search from user preferences:', autoFilters);
      }
    } catch (err) {
      console.error('Error loading user preferences:', err);
    }
  };

  /**
   * ✅ IMPROVED: Enhanced search with recovery housing prioritization
   */
  const handleSearch = async (resetPage = true) => {
    if (resetPage) {
      setCurrentPage(1);
    }
    
    setLoading(true);
    try {
      console.log('🔍 Searching with mode:', searchMode, 'Filters:', { basicFilters, recoveryFilters, advancedFilters });
      
      // ✅ FIXED: Build query based on search mode and aligned criteria
      let query = supabase
        .from('properties')
        .select('*', { count: 'exact' })
        .eq('status', 'available');

      // Basic location and housing criteria
      if (basicFilters.location.trim()) {
        query = query.or(`city.ilike.%${basicFilters.location}%,state.ilike.%${basicFilters.location}%,address.ilike.%${basicFilters.location}%`);
      }

      if (basicFilters.state) {
        query = query.eq('state', basicFilters.state);
      }

      if (basicFilters.maxRent) {
        query = query.lte('monthly_rent', parseInt(basicFilters.maxRent));
      }

      if (basicFilters.minBedrooms) {
        query = query.gte('bedrooms', parseInt(basicFilters.minBedrooms));
      }

      // ✅ IMPROVED: Housing type filtering that matches form structure
      if (basicFilters.housingType.length > 0) {
        const housingTypeQuery = basicFilters.housingType.map(type => `property_type.eq.${type}`).join(',');
        query = query.or(housingTypeQuery);
      }

      // ✅ NEW: Recovery housing mode vs basic housing mode
      if (searchMode === 'recovery') {
        // Recovery housing specific filters
        if (recoveryFilters.recoveryHousingOnly) {
          query = query.eq('is_recovery_housing', true);
        }
        
        if (recoveryFilters.caseManagement) {
          query = query.eq('case_management', true);
        }
        
        if (recoveryFilters.counselingServices) {
          query = query.eq('counseling_services', true);
        }
        
        if (recoveryFilters.supportGroups) {
          query = query.eq('support_groups', true);
        }

        if (recoveryFilters.requiredPrograms.length > 0) {
          query = query.overlaps('required_programs', recoveryFilters.requiredPrograms);
        }
      } else {
        // Basic housing mode - prioritize recovery housing but don't require it
        // (Recovery housing will be sorted to top in ordering)
      }

      // Basic amenity filters
      if (basicFilters.furnished) {
        query = query.eq('furnished', true);
      }

      if (basicFilters.petsAllowed) {
        query = query.eq('pets_allowed', true);
      }

      // ✅ IMPROVED: Advanced filters (only when expanded)
      if (showAdvancedFilters) {
        if (advancedFilters.acceptedSubsidies.length > 0) {
          query = query.overlaps('accepted_subsidies', advancedFilters.acceptedSubsidies);
        }

        if (advancedFilters.amenities.length > 0) {
          query = query.overlaps('amenities', advancedFilters.amenities);
        }

        if (advancedFilters.utilitiesIncluded.length > 0) {
          query = query.overlaps('utilities_included', advancedFilters.utilitiesIncluded);
        }

        if (advancedFilters.smokingPolicy) {
          query = query.eq('smoking_allowed', advancedFilters.smokingPolicy === 'allowed');
        }

        if (advancedFilters.leaseLength) {
          query = query.gte('min_lease_months', parseInt(advancedFilters.leaseLength));
        }
      }

      // Pagination
      const pageSize = 12;
      const from = (currentPage - 1) * pageSize;
      const to = from + pageSize - 1;
      
      query = query.range(from, to);

      // ✅ IMPROVED: Smart ordering based on search mode
      if (searchMode === 'recovery') {
        // Recovery mode: recovery housing first, then by features
        query = query.order('is_recovery_housing', { ascending: false })
                    .order('case_management', { ascending: false })
                    .order('monthly_rent', { ascending: true });
      } else {
        // Basic mode: recovery housing first (priority), then by price
        query = query.order('is_recovery_housing', { ascending: false })
                    .order('monthly_rent', { ascending: true });
      }

      const { data, error, count } = await query;

      if (error) throw error;

      // ✅ NEW: Future external API integration point
      let allProperties = data || [];
      
      if (externalSources.enableExternalSearch && externalSources.includeZillow) {
        // TODO: Integrate Zillow API
        console.log('🔮 Future: Zillow API integration would happen here');
        // const zillowResults = await fetchFromZillow(basicFilters);
        // allProperties = [...allProperties, ...zillowResults];
      }

      setProperties(allProperties);
      setTotalResults(count || 0);
      
    } catch (error) {
      console.error('Error searching properties:', error);
      alert('Error searching properties. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  /**
   * ✅ NEW: Handle search mode toggle
   */
  const handleSearchModeChange = (mode) => {
    setSearchMode(mode);
    setCurrentPage(1);
  };

  /**
   * ✅ IMPROVED: Filter change handlers for different filter groups
   */
  const handleBasicFilterChange = (field, value) => {
    setBasicFilters(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleRecoveryFilterChange = (field, value) => {
    setRecoveryFilters(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleAdvancedFilterChange = (field, value) => {
    setAdvancedFilters(prev => ({
      ...prev,
      [field]: value
    }));
  };

  /**
   * Handle array filter changes (checkboxes)
   */
  const handleArrayFilterChange = (filterGroup, field, value, isChecked) => {
    const setFilter = filterGroup === 'basic' ? setBasicFilters : 
                     filterGroup === 'recovery' ? setRecoveryFilters : 
                     setAdvancedFilters;
    
    setFilter(prev => ({
      ...prev,
      [field]: isChecked
        ? [...prev[field], value]
        : prev[field].filter(item => item !== value)
    }));
  };

  /**
   * ✅ NEW: Use my preferences from profile
   */
  const handleUseMyPreferences = () => {
    if (userPreferences) {
      const autoFilters = {
        location: userPreferences.preferred_location || '',
        maxRent: userPreferences.budget_max?.toString() || '',
        minBedrooms: userPreferences.preferred_bedrooms?.toString() || '',
        housingType: userPreferences.housing_type || [],
        furnished: userPreferences.furnished_preference || false,
        petsAllowed: userPreferences.pets_owned || false
      };
      
      setBasicFilters(prev => ({ ...prev, ...autoFilters }));
      alert('Search filters updated with your profile preferences!');
    } else {
      alert('No preferences found in your profile. Please complete your matching profile first.');
    }
  };

  /**
   * Clear all filters
   */
  const clearAllFilters = () => {
    setBasicFilters({
      location: '',
      state: '',
      maxRent: '',
      minBedrooms: '',
      housingType: [],
      furnished: false,
      petsAllowed: false,
      utilityBudget: ''
    });
    
    setRecoveryFilters({
      recoveryHousingOnly: searchMode === 'recovery',
      soberness: '',
      caseManagement: false,
      counselingServices: false,
      supportGroups: false,
      requiredPrograms: [],
      recoveryStage: ''
    });
    
    setAdvancedFilters({
      acceptedSubsidies: [],
      amenities: [],
      utilitiesIncluded: [],
      smokingPolicy: '',
      guestPolicy: '',
      backgroundCheck: '',
      leaseLength: '',
      moveInCost: ''
    });
  };

  /**
   * Handle contact landlord
   */
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

  /**
   * Handle save property (future feature)
   */
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
        <h1 className="welcome-title">Find Recovery-Friendly Housing</h1>
        <p className="welcome-text">
          Search for housing options that support your recovery journey and meet your needs
        </p>
      </div>

      {/* ✅ NEW: Search Mode Toggle */}
      <div className="card mb-4">
        <h3 className="card-title">Search Type</h3>
        <div className="navigation">
          <ul className="nav-list">
            <li className="nav-item">
              <button
                className={`nav-button ${searchMode === 'basic' ? 'active' : ''}`}
                onClick={() => handleSearchModeChange('basic')}
              >
                <span className="nav-icon">🏠</span>
                <span>All Housing</span>
              </button>
            </li>
            <li className="nav-item">
              <button
                className={`nav-button ${searchMode === 'recovery' ? 'active' : ''}`}
                onClick={() => handleSearchModeChange('recovery')}
              >
                <span className="nav-icon">🏡</span>
                <span>Recovery Housing</span>
              </button>
            </li>
          </ul>
        </div>
        <p className="text-gray-600 mt-2">
          {searchMode === 'basic' 
            ? 'Search all available housing with recovery-friendly options prioritized'
            : 'Search specifically for recovery housing with specialized support services'
          }
        </p>
      </div>

      {/* ✅ IMPROVED: Basic Search Filters (Always Visible) */}
      <div className="card mb-4">
        <div className="card-header">
          <h3 className="card-title">Basic Housing Criteria</h3>
          {userPreferences && (
            <button
              className="btn btn-outline btn-sm"
              onClick={handleUseMyPreferences}
            >
              Use My Preferences
            </button>
          )}
        </div>
        
        <div className="grid-auto mb-4">
          <div className="form-group">
            <label className="label">Location</label>
            <input
              className="input"
              type="text"
              placeholder="City, State, or Address"
              value={basicFilters.location}
              onChange={(e) => handleBasicFilterChange('location', e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="label">State</label>
            <select
              className="input"
              value={basicFilters.state}
              onChange={(e) => handleBasicFilterChange('state', e.target.value)}
            >
              <option value="">Any State</option>
              {stateOptions.map(state => (
                <option key={state} value={state}>{state}</option>
              ))}
            </select>
          </div>
          
          <div className="form-group">
            <label className="label">Max Monthly Rent</label>
            <select
              className="input"
              value={basicFilters.maxRent}
              onChange={(e) => handleBasicFilterChange('maxRent', e.target.value)}
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
              value={basicFilters.minBedrooms}
              onChange={(e) => handleBasicFilterChange('minBedrooms', e.target.value)}
            >
              <option value="">Any</option>
              <option value="0">Studio</option>
              <option value="1">1+</option>
              <option value="2">2+</option>
              <option value="3">3+</option>
              <option value="4">4+</option>
            </select>
          </div>
        </div>

        {/* ✅ IMPROVED: Housing type selection that matches form structure */}
        <div className="form-group mb-4">
          <label className="label">Housing Types (select all that work for you)</label>
          <div className="grid-auto">
            {housingTypeOptions.map(type => (
              <div
                key={type.value}
                className={`checkbox-item ${basicFilters.housingType.includes(type.value) ? 'selected' : ''}`}
                onClick={() => handleArrayFilterChange('basic', 'housingType', type.value, !basicFilters.housingType.includes(type.value))}
              >
                <input
                  type="checkbox"
                  checked={basicFilters.housingType.includes(type.value)}
                  onChange={() => {}}
                />
                <span>{type.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Basic toggles */}
        <div className="grid-auto mb-4">
          <div className="checkbox-item" onClick={() => handleBasicFilterChange('furnished', !basicFilters.furnished)}>
            <input
              type="checkbox"
              checked={basicFilters.furnished}
              onChange={() => {}}
            />
            <span>Furnished</span>
          </div>
          
          <div className="checkbox-item" onClick={() => handleBasicFilterChange('petsAllowed', !basicFilters.petsAllowed)}>
            <input
              type="checkbox"
              checked={basicFilters.petsAllowed}
              onChange={() => {}}
            />
            <span>Pet Friendly</span>
          </div>

          <button
            className="btn btn-primary"
            onClick={() => handleSearch()}
            disabled={loading}
          >
            {loading ? 'Searching...' : 'Search Housing'}
          </button>
        </div>
      </div>

      {/* ✅ NEW: Recovery-Specific Filters (When in Recovery Mode) */}
      {searchMode === 'recovery' && (
        <div className="card mb-4">
          <h3 className="card-title">Recovery Support Features</h3>
          
          <div className="grid-auto mb-4">
            <div className="checkbox-item" onClick={() => handleRecoveryFilterChange('caseManagement', !recoveryFilters.caseManagement)}>
              <input
                type="checkbox"
                checked={recoveryFilters.caseManagement}
                onChange={() => {}}
              />
              <span>Case Management Available</span>
            </div>
            
            <div className="checkbox-item" onClick={() => handleRecoveryFilterChange('counselingServices', !recoveryFilters.counselingServices)}>
              <input
                type="checkbox"
                checked={recoveryFilters.counselingServices}
                onChange={() => {}}
              />
              <span>Counseling Services</span>
            </div>

            <div className="checkbox-item" onClick={() => handleRecoveryFilterChange('supportGroups', !recoveryFilters.supportGroups)}>
              <input
                type="checkbox"
                checked={recoveryFilters.supportGroups}
                onChange={() => {}}
              />
              <span>Support Groups</span>
            </div>
          </div>
        </div>
      )}

      {/* ✅ IMPROVED: Advanced Filters (Collapsible) */}
      <div className="card mb-4">
        <div className="text-center">
          <button
            className="btn btn-outline"
            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
          >
            {showAdvancedFilters ? 'Hide' : 'Show'} Advanced Filters
          </button>
          
          <button
            className="btn btn-outline ml-2"
            onClick={clearAllFilters}
          >
            Clear All Filters
          </button>
        </div>

        {showAdvancedFilters && (
          <div className="mt-4">
            <h4 className="card-title">Advanced Search Options</h4>
            
            {/* Accepted Subsidies */}
            <div className="form-group">
              <label className="label">Accepted Subsidies/Benefits</label>
              <div className="grid-auto">
                {subsidyOptions.map(subsidy => (
                  <div
                    key={subsidy}
                    className={`checkbox-item ${advancedFilters.acceptedSubsidies.includes(subsidy) ? 'selected' : ''}`}
                    onClick={() => handleArrayFilterChange('advanced', 'acceptedSubsidies', subsidy, !advancedFilters.acceptedSubsidies.includes(subsidy))}
                  >
                    <input
                      type="checkbox"
                      checked={advancedFilters.acceptedSubsidies.includes(subsidy)}
                      onChange={() => {}}
                    />
                    <span>{subsidy}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Required Amenities */}
            <div className="form-group">
              <label className="label">Required Amenities</label>
              <div className="grid-auto">
                {amenityOptions.map(amenity => (
                  <div
                    key={amenity}
                    className={`checkbox-item ${advancedFilters.amenities.includes(amenity) ? 'selected' : ''}`}
                    onClick={() => handleArrayFilterChange('advanced', 'amenities', amenity, !advancedFilters.amenities.includes(amenity))}
                  >
                    <input
                      type="checkbox"
                      checked={advancedFilters.amenities.includes(amenity)}
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
                    className={`checkbox-item ${advancedFilters.utilitiesIncluded.includes(utility) ? 'selected' : ''}`}
                    onClick={() => handleArrayFilterChange('advanced', 'utilitiesIncluded', utility, !advancedFilters.utilitiesIncluded.includes(utility))}
                  >
                    <input
                      type="checkbox"
                      checked={advancedFilters.utilitiesIncluded.includes(utility)}
                      onChange={() => {}}
                    />
                    <span>{utility}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Additional Filters */}
            <div className="grid-2">
              <div className="form-group">
                <label className="label">Smoking Policy</label>
                <select
                  className="input"
                  value={advancedFilters.smokingPolicy}
                  onChange={(e) => handleAdvancedFilterChange('smokingPolicy', e.target.value)}
                >
                  <option value="">Any Policy</option>
                  <option value="not_allowed">Non-Smoking Only</option>
                  <option value="allowed">Smoking Allowed OK</option>
                </select>
              </div>

              <div className="form-group">
                <label className="label">Minimum Lease Length</label>
                <select
                  className="input"
                  value={advancedFilters.leaseLength}
                  onChange={(e) => handleAdvancedFilterChange('leaseLength', e.target.value)}
                >
                  <option value="">Any Length</option>
                  <option value="1">1+ months</option>
                  <option value="3">3+ months</option>
                  <option value="6">6+ months</option>
                  <option value="12">12+ months</option>
                </select>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ✅ NEW: Future External Search Integration */}
      {process.env.NODE_ENV === 'development' && (
        <div className="card mb-4" style={{ background: 'var(--bg-light-cream)' }}>
          <h4 className="card-title">🔮 External Search Integration (Coming Soon)</h4>
          <p className="text-gray-600 mb-3">
            We're working on integrating with national property databases to expand your search options.
          </p>
          <div className="grid-auto">
            <div className="checkbox-item" onClick={() => setExternalSources(prev => ({ ...prev, includeZillow: !prev.includeZillow }))}>
              <input
                type="checkbox"
                checked={externalSources.includeZillow}
                onChange={() => {}}
                disabled
              />
              <span>Include Zillow Results</span>
            </div>
            <div className="checkbox-item" onClick={() => setExternalSources(prev => ({ ...prev, includeApartmentsDotCom: !prev.includeApartmentsDotCom }))}>
              <input
                type="checkbox"
                checked={externalSources.includeApartmentsDotCom}
                onChange={() => {}}
                disabled
              />
              <span>Include Apartments.com</span>
            </div>
            <div className="checkbox-item" onClick={() => setExternalSources(prev => ({ ...prev, includeRentDotCom: !prev.includeRentDotCom }))}>
              <input
                type="checkbox"
                checked={externalSources.includeRentDotCom}
                onChange={() => {}}
                disabled
              />
              <span>Include Rent.com</span>
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
                {searchMode === 'recovery' 
                  ? 'Recovery housing properties with specialized support'
                  : 'Recovery housing properties are prioritized in results'
                }
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
          <p>Try adjusting your search criteria or switching search modes.</p>
          <div className="mt-3">
            <button
              className="btn btn-primary"
              onClick={clearAllFilters}
            >
              Clear Filters
            </button>
            <button
              className="btn btn-outline ml-2"
              onClick={() => handleSearchModeChange(searchMode === 'basic' ? 'recovery' : 'basic')}
            >
              Try {searchMode === 'basic' ? 'Recovery Housing' : 'All Housing'} Search
            </button>
          </div>
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
    </div>
  );
};

export default PropertySearch;